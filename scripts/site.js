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

const capabilitiesPanel = document.querySelector('.capabilities-section__panel');

if (capabilitiesPanel) {
  const tabs = Array.from(capabilitiesPanel.querySelectorAll('.capabilities-section__nav-item'));
  const titleEl = capabilitiesPanel.querySelector('.capabilities-section__detail-title');
  const descriptionEl = capabilitiesPanel.querySelector('.capabilities-section__detail-copy');
  const bulletEls = Array.from(capabilitiesPanel.querySelectorAll('.capability-benefit__text'));
  const ctaLabelEl = capabilitiesPanel.querySelector('.capabilities-section__link .site-header-button-v2__label');
  const ctaLinkEl = capabilitiesPanel.querySelector('.capabilities-section__link');
  const markIconEl = capabilitiesPanel.querySelector('.capabilities-section__detail-mark');

  const tabProfiles = {
    authentication: {
      title: 'Authentication',
      description:
        'Support modern login flows with built-in methods including PassKey, OTP, OAuth, and AI-facing access patterns.',
      bullets: [
        '12 built-in auth methods',
        'Cryptographic verification by default',
        'In-memory sessions and instant revocation',
        'Docs available for deeper implementation details'
      ],
      ctaLabel: 'Explore Authentication',
      ctaHref: 'https://docs.authproxy.tech/docs/intro',
      markIcon: './assets/sections/capabilities/cap-icon-12.svg'
    },
    'reverse-proxy': {
      title: 'Reverse Proxy',
      description:
        'Route requests through one edge layer with policy enforcement, header injection, and dynamic route control.',
      bullets: [
        'Dynamic routing',
        'Zero-downtime config updates',
        'Built-in rate limiting',
        'Route-level security flags'
      ],
      ctaLabel: 'Explore Reverse Proxy',
      ctaHref: 'https://docs.authproxy.tech/docs/intro',
      markIcon: './assets/sections/capabilities/cap-icon-7.svg'
    }
  };

  const applyTabProfile = (profile) => {
    if (!profile || !titleEl || !descriptionEl || !ctaLabelEl || !ctaLinkEl || !markIconEl) {
      return;
    }

    titleEl.textContent = profile.title;
    descriptionEl.textContent = profile.description;
    bulletEls.forEach((el, index) => {
      if (profile.bullets[index]) {
        el.textContent = profile.bullets[index];
      }
    });
    ctaLabelEl.textContent = profile.ctaLabel;
    ctaLinkEl.setAttribute('href', profile.ctaHref);
    markIconEl.setAttribute('src', profile.markIcon);
  };

  const setActiveTab = (tab) => {
    tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      const hash = tab.getAttribute('href')?.replace('#', '') || '';
      const profile = tabProfiles[hash];
      if (!profile) {
        return;
      }

      event.preventDefault();
      setActiveTab(tab);
      applyTabProfile(profile);
      history.replaceState(null, '', `#${hash}`);
    });
  });

  const activeTab = tabs.find((tab) => tab.classList.contains('is-active')) ?? tabs[0];
  const activeHash = activeTab?.getAttribute('href')?.replace('#', '') || 'authentication';
  applyTabProfile(tabProfiles[activeHash] ?? tabProfiles.authentication);
}
