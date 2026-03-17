const rootHeader = document.querySelector('.site-header-shell');
const navToggle = document.querySelector('.site-header__toggle');
const navMenu = document.querySelector('.site-header__menu');
const dropdownGroups = Array.from(document.querySelectorAll('[data-dropdown]'));
const authSlider = document.querySelector('[data-slider]');

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

function initAuthSlider() {
  if (!authSlider) {
    return;
  }

  const track = authSlider.querySelector('.auth-slider__track');
  const slides = Array.from(authSlider.querySelectorAll('[data-slide]'));
  const prevButton = authSlider.querySelector('[data-slider-prev]');
  const nextButton = authSlider.querySelector('[data-slider-next]');
  const currentLabel = authSlider.querySelector('[data-slider-current]');
  const totalLabel = authSlider.querySelector('[data-slider-total]');
  let currentIndex = 0;

  if (!track || !prevButton || !nextButton || !currentLabel || !totalLabel || slides.length === 0) {
    console.warn('Auth slider markup is incomplete');
    return;
  }

  slides.forEach((slide) => {
    slide.querySelectorAll('.auth-card__row').forEach((row) => {
      const cells = row.querySelectorAll('span');
      if (cells.length !== 3) {
        return;
      }

      cells[0].dataset.label = 'Method';
      cells[1].dataset.label = 'How It Works';
      cells[2].dataset.label = 'Best For';
    });
  });

  const formatIndex = (value) => String(value + 1).padStart(2, '0');

  const render = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    currentLabel.textContent = formatIndex(currentIndex);
    totalLabel.textContent = String(slides.length).padStart(2, '0');
  };

  prevButton.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = Math.min(slides.length - 1, currentIndex + 1);
    render();
  });

  render();
}

initAuthSlider();
