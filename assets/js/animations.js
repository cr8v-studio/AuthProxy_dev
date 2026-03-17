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
  distance: isMobileViewport() ? 18 : 28,
  scaleStart: isMobileViewport() ? 0.985 : 0.965,
  ease: 'power3.out'
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
      yPercent: isMobileViewport() ? -2 : -5,
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
  };

  applyMarqueeLayout();
  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(applyMarqueeLayout);
    },
    { passive: true }
  );
}

// Section-specific card motion stays lightweight: reveal stays in JS, hover lives in CSS.
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
}

// The BUILD control keeps its scramble treatment in JS; the rest of hover motion now lives in CSS.
function initBuildScramble() {
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

  document.querySelectorAll('.site-header-link-m2').forEach((element) => {
    const label = element.querySelector('.site-header-link-m2__label');
    const originalText = label ? (label.textContent || '').trim() : '';

    if (!label || !originalText) {
      return;
    }

    // Keep a stable button footprint so scramble glyph widths don't shift nearby controls.
    const stableWidth = Math.ceil(element.getBoundingClientRect().width);
    element.style.width = `${stableWidth}px`;
    element.style.minWidth = `${stableWidth}px`;

    const pointerEnter = () => {
      playBuildScramble(label, originalText);
    };

    const pointerLeave = () => {
      resetBuildScramble(label, originalText);
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
  initFeatureCards();
  initBuildScramble();

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  ScrollTrigger.refresh();
}

initMotionSystem();
