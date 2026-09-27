#!/usr/bin/env python3
"""Reject private identities and workstation/asset links without printing their values."""
import argparse
import re
import subprocess
import sys


def git(*args):
    return subprocess.check_output(['git', *args])


PATTERNS = {
    'local home path': re.compile(rb'/(?:Users|home)/[A-Za-z0-9_.-]+/'),
    'Windows home path': re.compile(rb'[A-Za-z]:\\Users\\[^\\\s]+\\'),
    'personal email': re.compile(rb'[A-Za-z0-9._%+-]+@(?:gmail|googlemail|outlook|hotmail|icloud|yahoo|yandex|mail)\.[A-Za-z.]+', re.I),
    'temporary design asset URL': re.compile(rb'https?://(?:www\.)?figma\.com/api/mcp/asset/', re.I),
    'private key': re.compile(rb'-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----'),
}


def check_text(data, location, failures):
    if b'\0' in data:
        return
    for label, pattern in PATTERNS.items():
        if pattern.search(data):
            failures.append(f'{location}: {label} (value hidden)')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--staged', action='store_true', help='Check staged content and the next commit identity.')
    args = parser.parse_args()
    failures = []
    checked = 0
    if args.staged:
        for role in ['AUTHOR', 'COMMITTER']:
            identity = git('var', f'GIT_{role}_IDENT')
            email = re.search(rb'<([^<>]+)>', identity)
            if not email or not email.group(1).endswith(b'@users.noreply.github.com'):
                failures.append(f'Next {role.lower()} email must use GitHub noreply (value hidden).')
        for path in git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split(b'\0'):
            if path:
                name = path.decode('utf-8')
                check_text(git('show', ':' + name), name, failures)
                checked += 1
    else:
        for row in git('log', '--all', '--format=%H%x00%ae%x00%ce').splitlines():
            sha, author, committer = row.split(b'\0')
            if not all(e.endswith(b'@users.noreply.github.com') for e in [author, committer]):
                failures.append(f'Commit {sha[:7].decode()}: non-noreply identity (value hidden).')
        check_text(git('log', '--all', '--format=%B'), 'Commit messages', failures)
        objects = git('rev-list', '--objects', '--all').splitlines()
        names = {row.split(b' ', 1)[0]: row.split(b' ', 1)[-1].decode('utf-8') for row in objects}
        metadata = subprocess.check_output(
            ['git', 'cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
            input=b'\n'.join(names) + b'\n',
        )
        reader = subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        try:
            for row in metadata.splitlines():
                sha, kind, size = row.split()
                if kind != b'blob':
                    continue
                reader.stdin.write(sha + b'\n')
                reader.stdin.flush()
                reader.stdout.readline()
                data = reader.stdout.read(int(size))
                reader.stdout.read(1)
                check_text(data, names[sha], failures)
                checked += 1
        finally:
            reader.stdin.close()
            reader.wait()
    if failures:
        print('\n'.join(sorted(set(failures))))
        return 1
    print(f'Privacy check passed: {checked} file versions checked; no private values printed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
