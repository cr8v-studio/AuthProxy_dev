#!/usr/bin/env python3
"""Static smoke-check for AuthProxy motion runtime wiring.

This check does not execute browser animations. It validates that:
1) Key runtime selectors still exist in index.html.
2) Key motion initializers are still invoked in animations.js.
3) Removed dead selectors do not silently return to runtime.
"""

from __future__ import annotations

from pathlib import Path
import re
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = PROJECT_ROOT / "index.html"
ANIMATIONS_FILE = PROJECT_ROOT / "assets" / "motion" / "animations.js"
SITE_CSS_FILE = PROJECT_ROOT / "styles" / "site.css"


REQUIRED_HTML_SELECTORS = [
    ".site-header-shell",
    ".hero-section__metrics-wrap",
    ".solution-section__cards",
    ".how-v2__stats",
    ".how-v2__pipeline",
    ".how-v2__diagram",
    ".security-section__metric",
    ".developers-section__intro",
]

REQUIRED_ANIMATION_CALLS = [
    "initHeroMetricsCarousel()",
    "initSolutionCardsMotion()",
    "initHowV2StatsReveal()",
    "initHowV2PipelineChevronFlow()",
    "initNavbarMotion(",
]

DISALLOWED_RUNTIME_MARKERS = [
    "initHeroGridImpulseFlow(",
    "initSolutionGridLaserHover(",
]

DISALLOWED_CSS_MARKERS = [
    ".hero-section__impulse",
    ".hero-section__impulse-dot",
    ".hero-section__impulse-node",
]


def fail(message: str) -> None:
    print(f"[FAIL] {message}")


def ok(message: str) -> None:
    print(f"[OK]   {message}")


def selector_exists_in_html(html: str, selector: str) -> bool:
    if selector.startswith("."):
        class_name = selector[1:]
        pattern = re.compile(r'class="[^"]*\b' + re.escape(class_name) + r"\b")
        return bool(pattern.search(html))
    if selector.startswith("#"):
        pattern = re.compile(r'id="' + re.escape(selector[1:]) + r'"')
        return bool(pattern.search(html))
    return selector in html


def main() -> int:
    missing_files = [path for path in [INDEX_FILE, ANIMATIONS_FILE, SITE_CSS_FILE] if not path.exists()]
    if missing_files:
        for path in missing_files:
            fail(f"File not found: {path}")
        return 2

    html = INDEX_FILE.read_text(encoding="utf-8")
    animations = ANIMATIONS_FILE.read_text(encoding="utf-8")
    css = SITE_CSS_FILE.read_text(encoding="utf-8")

    failures = 0

    for selector in REQUIRED_HTML_SELECTORS:
        if selector_exists_in_html(html, selector):
            ok(f"Selector exists in HTML: {selector}")
        else:
            fail(f"Missing selector in HTML: {selector}")
            failures += 1

    for call in REQUIRED_ANIMATION_CALLS:
        if call in animations:
            ok(f"Motion initializer present: {call}")
        else:
            fail(f"Missing motion initializer call: {call}")
            failures += 1

    for marker in DISALLOWED_RUNTIME_MARKERS:
        if marker in animations:
            fail(f"Dead runtime marker returned: {marker}")
            failures += 1
        else:
            ok(f"Dead runtime marker absent: {marker}")

    for marker in DISALLOWED_CSS_MARKERS:
        if marker in css:
            fail(f"Dead CSS marker returned: {marker}")
            failures += 1
        else:
            ok(f"Dead CSS marker absent: {marker}")

    if failures:
        print(f"\nResult: {failures} issue(s) found.")
        return 1

    print("\nResult: motion smoke-check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
