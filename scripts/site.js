const rootHeader = document.querySelector('.site-header-shell');
const navToggle = document.querySelector('.site-header__toggle');
const navMenu = document.querySelector('.site-header__menu');
const dropdownGroups = Array.from(document.querySelectorAll('[data-dropdown]'));

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const navigationEntry = performance.getEntriesByType('navigation')[0];
const isReloadNavigation = navigationEntry?.type === 'reload';

if (isReloadNavigation) {
  if (window.location.hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  window.addEventListener(
    'load',
    () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    },
    { once: true }
  );
}

function closeMenu() {
  if (!rootHeader || !navToggle) {
    return;
  }

  rootHeader.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function toggleDropdown(group, forceOpen) {
  const button = group.querySelector('.site-header-dropdown');
  const nextState = forceOpen ?? !group.classList.contains('is-open');

  dropdownGroups.forEach((item) => {
    if (item !== group) {
      item.classList.remove('is-open');
      item.querySelector('.site-header-dropdown')?.setAttribute('aria-expanded', 'false');
    }
  });

  group.classList.toggle('is-open', nextState);
  button?.setAttribute('aria-expanded', nextState ? 'true' : 'false');
}

if (navToggle && navMenu && rootHeader) {
  navToggle.addEventListener('click', () => {
    const isOpen = rootHeader.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

dropdownGroups.forEach((group) => {
  const button = group.querySelector('.site-header-dropdown');

  button?.addEventListener('click', () => {
    toggleDropdown(group);
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-dropdown]')) {
    dropdownGroups.forEach((group) => toggleDropdown(group, false));
  }

  if (!event.target.closest('.site-header-shell')) {
    closeMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    dropdownGroups.forEach((group) => toggleDropdown(group, false));
    closeMenu();
  }
});
