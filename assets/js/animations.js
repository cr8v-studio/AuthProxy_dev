import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/+esm';

// Base motion stack: GSAP + ScrollTrigger + Lenis.
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileViewport = window.matchMedia('(max-width: 767px)');
const isMobileViewport = () => mobileViewport.matches;

const getMotion = () => ({
  duration: isMobileViewport() ? 0.5 : 0.65,
  hoverDuration: 0.52,
  distance: isMobileViewport() ? 18 : 28,
  scaleStart: isMobileViewport() ? 0.985 : 0.965,
  buttonScale: isMobileViewport() ? 1.01 : 1.018,
  cardLift: isMobileViewport() ? -4 : -8,
  ease: 'power3.out',
  easeSoft: 'power2.out'
});

const heroSection = document.querySelector('.hero-section');
const header = document.querySelector('.site-header-shell');
const REVEAL_ASSIGNMENTS = [
  ['.section-label', 'fade-in'],
  ['.section-intro > *', 'fade-up'],
  ['.problem-grid__visual-wrap', 'scale-in'],
  ['.problem-item', 'fade-up'],
  ['.problem-statement > *', 'fade-up'],
  ['.how-grid__visual-wrap', 'scale-in'],
  ['.how-grid__core > *', 'fade-up'],
  ['.how-note > *', 'fade-up'],
  ['.auth-section__intro > *', 'fade-up'],
  ['.auth-slider__viewport', 'fade-up'],
  ['.auth-slider__footer', 'fade-in']
];

document.documentElement.style.scrollBehavior = 'auto';

function addClass(selector, className) {
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.add(className);
  });
}

// Keep reduced-motion users on the same visual hierarchy without transitional movement.
function setReducedMotionState() {
  document
    .querySelectorAll('.fade-up, .fade-in, .scale-in, .capability-card, .hero-section__visual, .hero-metric')
    .forEach((element) => {
      gsap.set(element, { clearProps: 'transform,opacity,visibility' });
    });

  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
}

function mapRevealUtilities() {
  REVEAL_ASSIGNMENTS.forEach(([selector, className]) => {
    addClass(selector, className);
  });
}

// Lenis owns scroll interpolation while GSAP stays synced through the shared RAF loop.
function initLenis() {
  if (prefersReducedMotion) {
    return null;
  }

  const lenis = new Lenis({
    duration: isMobileViewport() ? 0.85 : 1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.95,
    touchMultiplier: 1
  });

  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -24,
        duration: isMobileViewport() ? 0.9 : 1.05,
        easing: (value) => 1 - Math.pow(1 - value, 3)
      });
    });
  });

  return lenis;
}

// Header scroll-state stays centralized here so the rest of the motion system can stay declarative.
function initNavbarMotion(lenis) {
  if (!header) {
    return;
  }

  const syncHeaderState = (scrollY) => {
    header.classList.toggle('is-scrolled', scrollY > 40);
  };

  syncHeaderState(window.scrollY);

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      syncHeaderState(scroll);
    });
    return;
  }

  window.addEventListener(
    'scroll',
    () => {
      syncHeaderState(window.scrollY);
    },
    { passive: true }
  );
}

// Shared utility reveal presets used across non-hero sections.
function createRevealSystem() {
  const motion = getMotion();
  const revealMap = new Map([
    ['fade-up', { autoAlpha: 0, y: motion.distance }],
    ['fade-in', { autoAlpha: 0 }],
    ['scale-in', { autoAlpha: 0, y: motion.distance * 0.35, scale: motion.scaleStart }]
  ]);

  revealMap.forEach((fromVars, className) => {
    gsap.utils.toArray(`.${className}`).forEach((element) => {
      if (element.closest('.hero-section')) {
        return;
      }

      gsap.from(element, {
        ...fromVars,
        duration: motion.duration,
        ease: motion.ease,
        force3D: true,
        scrollTrigger: {
          trigger: element,
          start: 'top 84%',
          once: true
        }
      });
    });
  });
}

// Section label chevrons enter from left one-by-one on first viewport entry.
function initSectionLabelChevronMotion() {
  const labels = gsap.utils.toArray('.section-label');

  if (!labels.length) {
    return;
  }

  labels.forEach((label) => {
    const chevrons = Array.from(label.querySelectorAll('.section-label__chevrons img'));
    const labelText = label.querySelector(':scope > :not(.section-label__chevrons)');

    if (!chevrons.length || !labelText) {
      return;
    }

    const orderedChevrons = chevrons.reverse();
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: label,
        start: 'top 84%',
        once: true
      }
    });

    timeline.from(orderedChevrons, {
      autoAlpha: 0,
      x: isMobileViewport() ? -20 : -28,
      duration: isMobileViewport() ? 0.62 : 0.78,
      ease: 'power3.out',
      delay: isMobileViewport() ? 0.12 : 0.18,
      stagger: 0.16,
      force3D: true
    });

    timeline.from(
      labelText,
      {
        autoAlpha: 0,
        y: isMobileViewport() ? 14 : 18,
        duration: isMobileViewport() ? 0.56 : 0.66,
        ease: 'power3.out',
        force3D: true
      },
      '-=0.34'
    );
  });
}

// Hero intro stays timeline-driven so load order is intentional and premium.
function initHeroTimeline() {
  if (!heroSection) {
    return;
  }
  const motion = getMotion();

  const title = heroSection.querySelector('.hero-section__title');
  const subtitle = heroSection.querySelector('.hero-section__lead');
  const ctaButtons = heroSection.querySelectorAll('.hero-section__cta-row > *');
  const visualWrap = heroSection.querySelector('.hero-section__visual-wrap');
  const visual = heroSection.querySelector('.hero-section__visual');
  const visualRevealDistance = isMobileViewport() ? 44 : 72;

  const timeline = gsap.timeline({
    defaults: {
      duration: motion.duration,
      ease: motion.ease
    }
  });

  if (title) {
    timeline.from(
      title,
      {
        autoAlpha: 0,
        y: motion.distance
      },
      0
    );
  }

  if (subtitle) {
    timeline.from(
      subtitle,
      {
        autoAlpha: 0,
        y: motion.distance * 0.8
      },
      '-=0.3'
    );
  }

  if (ctaButtons.length) {
    timeline.from(
      ctaButtons,
      {
        autoAlpha: 0,
        y: motion.distance * 0.75,
        stagger: 0.08
      },
      '-=0.26'
    );
  }

  if (visualWrap && visual) {
    timeline.from(
      visual,
      {
        autoAlpha: 0,
        y: visualRevealDistance,
        duration: 0.74,
        ease: motion.ease
      },
      '-=0.34'
    );
  }

  if (visual) {
    gsap.to(visual, {
      yPercent: isMobileViewport() ? -4 : -10,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  }
}

function initHeroMetricsCarousel() {
  const metricsWrap = heroSection?.querySelector('.hero-section__metrics-wrap');
  const sourceTrack = metricsWrap?.querySelector('.hero-section__metrics');

  if (!metricsWrap || !sourceTrack || prefersReducedMotion) {
    return;
  }

  const originalCards = Array.from(sourceTrack.children);

  if (originalCards.length === 0) {
    return;
  }

  metricsWrap.classList.add('is-carousel');
  let metricsTrack = metricsWrap.querySelector('.hero-section__metrics-carousel-track');

  if (!metricsTrack) {
    metricsTrack = document.createElement('div');
    metricsTrack.className = 'hero-section__metrics-carousel-track';

    const createGroup = (isClone = false) => {
      const group = document.createElement('div');
      group.className = 'hero-section__metrics hero-section__metrics-group';

      originalCards.forEach((card) => {
        const nextCard = card.cloneNode(true);

        if (isClone) {
          nextCard.setAttribute('aria-hidden', 'true');
          nextCard.dataset.marqueeClone = 'true';
        }

        group.append(nextCard);
      });

      return group;
    };

    metricsTrack.append(createGroup(false), createGroup(true));
    sourceTrack.replaceWith(metricsTrack);
  }

  let tween = null;
  let resizeFrame = 0;
  let isHovered = false;
  const playbackState = { value: 1 };
  const setPlayback = gsap.quickTo(playbackState, 'value', {
    duration: 1.2,
    ease: 'power3.out',
    overwrite: true,
    onUpdate: () => {
      if (!tween) {
        return;
      }

      const nextScale = playbackState.value < 0.001 ? 0 : playbackState.value;
      tween.timeScale(nextScale);
    }
  });

  const applyMarqueeLayout = () => {
    const visibleCards = 4;
    const cardWidth = metricsWrap.clientWidth / visibleCards;
    const groups = Array.from(metricsTrack.querySelectorAll('.hero-section__metrics-group'));
    const allCards = Array.from(metricsTrack.querySelectorAll('.hero-metric'));

    allCards.forEach((card) => {
      card.style.flexBasis = `${cardWidth}px`;
      card.style.width = `${cardWidth}px`;
    });

    groups.forEach((group) => {
      group.style.width = `${cardWidth * originalCards.length}px`;
    });

    tween?.kill();
    gsap.set(metricsTrack, { x: 0 });

    tween = gsap.to(metricsTrack, {
      x: -(cardWidth * originalCards.length),
      duration: 44,
      ease: 'none',
      repeat: -1
    });

    playbackState.value = isHovered ? 0 : 1;
    tween.timeScale(playbackState.value);
  };

  applyMarqueeLayout();

  metricsWrap.addEventListener('mouseenter', () => {
    isHovered = true;
    setPlayback(0);
  });

  metricsWrap.addEventListener('mouseleave', () => {
    isHovered = false;
    setPlayback(1);
  });

  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(applyMarqueeLayout);
    },
    { passive: true }
  );
}

// Section-specific card motion stays lightweight: stagger on reveal, restrained hover on intent.
function initFeatureCards() {
  const motion = getMotion();
  const section = document.querySelector('.capability-list');
  const cards = gsap.utils.toArray('.capability-card');

  if (!section || cards.length === 0) {
    return;
  }

  gsap.from(cards, {
    autoAlpha: 0,
    y: motion.distance,
    duration: motion.duration,
    ease: motion.ease,
    stagger: isMobileViewport() ? 0.07 : 0.1,
    force3D: true,
    scrollTrigger: {
      trigger: section,
      start: 'top 76%',
      once: true
    }
  });

  if (prefersReducedMotion) {
    return;
  }

  cards.forEach((card) => {
    const cardStyles = getComputedStyle(card);
    const shadowRest = cardStyles.getPropertyValue('--effect-shadow-card-rest').trim();
    const shadowHover = cardStyles.getPropertyValue('--effect-shadow-card-hover').trim();

    card.addEventListener('mouseenter', () => {
      const nextMotion = getMotion();
      gsap.to(card, {
        y: nextMotion.cardLift,
        scale: isMobileViewport() ? 1.01 : 1.015,
        boxShadow: shadowHover,
        duration: nextMotion.hoverDuration,
        ease: nextMotion.easeSoft,
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      const nextMotion = getMotion();
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: shadowRest,
        duration: nextMotion.hoverDuration,
        ease: nextMotion.easeSoft,
        overwrite: 'auto'
      });
    });
  });
}

// Shared interactive motion for buttons and controls, including the BUILD scramble treatment.
function initInteractiveHoverStates() {
  if (prefersReducedMotion) {
    return;
  }

  const scrambleStateMap = new WeakMap();
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const randomScrambleChar = () =>
    scrambleChars[Math.floor(Math.random() * scrambleChars.length)];

  const playBuildScramble = (label, finalText) => {
    if (!label || !finalText) {
      return;
    }

    const previousState = scrambleStateMap.get(label);

    if (previousState) {
      if (previousState.tween) {
        previousState.tween.kill();
      }
      if (previousState.delayTween) {
        previousState.delayTween.kill();
      }
    }

    const state = { progress: 0 };
    const revealDelay = 0.08;
    const totalFrames = Math.max(1, finalText.length);

    const renderFrame = () => {
      const normalized = gsap.utils.clamp(0, 1, state.progress);
      const revealProgress =
        normalized <= revealDelay ? 0 : (normalized - revealDelay) / (1 - revealDelay);
      const revealCount = Math.floor(revealProgress * totalFrames);

      const nextText = finalText
        .split('')
        .map((character, index) => {
          if (character === ' ') {
            return ' ';
          }

          if (index < revealCount) {
            return character;
          }

          return randomScrambleChar();
        })
        .join('');

      label.textContent = nextText;
    };

    renderFrame();

    const tween = gsap.to(state, {
      progress: 1,
      duration: 0.58,
      ease: 'power1.out',
      overwrite: 'auto',
      onUpdate: renderFrame,
      onComplete: () => {
        label.textContent = finalText;
      }
    });

    scrambleStateMap.set(label, { tween, delayTween: null });
  };

  const resetBuildScramble = (label, finalText) => {
    if (!label) {
      return;
    }

    const state = scrambleStateMap.get(label);

    if (state?.tween) {
      state.tween.kill();
    }

    label.textContent = finalText || 'BUILD';
  };

  const interactiveElements = document.querySelectorAll(
    '.site-header-button-v1, .site-header-button-v2, .site-header-link-m2, .site-header-dropdown, .button-page-numbering'
  );

  interactiveElements.forEach((element) => {
    const isBuildButton = element.classList.contains('site-header-link-m2');
    const isButtonV1 = element.classList.contains('site-header-button-v1');
    const isButtonV2 = element.classList.contains('site-header-button-v2');
    const isDropdownTrigger = element.classList.contains('site-header-dropdown');
    const isPageButton = element.classList.contains('button-page-numbering');
    const buildLabel = isBuildButton ? element.querySelector('.site-header-link-m2__label') : null;
    const scrambleTarget = isBuildButton ? buildLabel : isButtonV1 ? element : null;
    const originalScrambleText = scrambleTarget ? (scrambleTarget.textContent || '').trim() : '';
    const motion = getMotion();
    const scaleTo = gsap.quickTo(element, 'scale', {
      duration: motion.hoverDuration,
      ease: motion.ease
    });
    const yTo = gsap.quickTo(element, 'y', {
      duration: motion.hoverDuration,
      ease: motion.ease
    });

    gsap.set(element, {
      transformOrigin: '50% 50%',
      willChange: 'transform'
    });

    if (scrambleTarget) {
      // Keep a stable button footprint so scramble glyph widths don't shift nearby controls.
      const stableWidth = Math.ceil(element.getBoundingClientRect().width);
      element.style.width = `${stableWidth}px`;
      element.style.minWidth = `${stableWidth}px`;
    }

    const pointerEnter = () => {
      const nextMotion = getMotion();
      if ('disabled' in element && element.disabled) {
        return;
      }

      const targetScale = isBuildButton
        ? isMobileViewport()
          ? 1.008
          : 1.012
        : isDropdownTrigger
          ? isMobileViewport()
            ? 1.004
            : 1.008
          : isPageButton
            ? isMobileViewport()
              ? 1.01
              : 1.014
            : nextMotion.buttonScale;
      const targetY = isBuildButton || isButtonV1 || isButtonV2
        ? 0
        : isDropdownTrigger
          ? -0.5
          : isMobileViewport()
            ? -0.75
            : -1.5;

      scaleTo(targetScale);
      yTo(targetY);

      if (scrambleTarget) {
        playBuildScramble(scrambleTarget, originalScrambleText);
      }
    };

    const pointerLeave = () => {
      scaleTo(1);
      yTo(0);

      if (scrambleTarget) {
        resetBuildScramble(scrambleTarget, originalScrambleText);
      }
    };

    element.addEventListener('mouseenter', pointerEnter);
    element.addEventListener('mouseleave', pointerLeave);
    element.addEventListener('focus', pointerEnter);
    element.addEventListener('blur', pointerLeave);
  });
}

// One base motion system for the whole page.
function initMotionSystem() {
  mapRevealUtilities();

  if (prefersReducedMotion) {
    setReducedMotionState();
    initNavbarMotion(null);
    return;
  }

  ScrollTrigger.config({
    ignoreMobileResize: true
  });

  const lenis = initLenis();

  initNavbarMotion(lenis);
  initHeroTimeline();
  initHeroMetricsCarousel();
  createRevealSystem();
  initSectionLabelChevronMotion();
  initFeatureCards();
  initInteractiveHoverStates();

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  ScrollTrigger.refresh();
}

initMotionSystem();
