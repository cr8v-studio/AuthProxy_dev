import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/+esm';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;

const MOTION = {
  duration: isMobileViewport ? 0.5 : 0.65,
  hoverDuration: 0.52,
  distance: isMobileViewport ? 18 : 28,
  scaleStart: isMobileViewport ? 0.985 : 0.965,
  buttonScale: isMobileViewport ? 1.01 : 1.018,
  cardLift: isMobileViewport ? -4 : -8,
  ease: 'power3.out',
  easeSoft: 'power2.out'
};

const heroSection = document.querySelector('.hero-section');
const header = document.querySelector('.site-header-shell');

document.documentElement.style.scrollBehavior = 'auto';

function addClass(selector, className) {
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.add(className);
  });
}

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
  addClass('.section-label', 'fade-in');
  addClass('.section-intro > *', 'fade-up');
  addClass('.problem-grid__visual-wrap', 'scale-in');
  addClass('.problem-item', 'fade-up');
  addClass('.problem-statement > *', 'fade-up');
  addClass('.how-grid__visual-wrap', 'scale-in');
  addClass('.how-grid__core > *', 'fade-up');
  addClass('.how-note > *', 'fade-up');
  addClass('.auth-section__intro > *', 'fade-up');
  addClass('.auth-slider__viewport', 'fade-up');
  addClass('.auth-slider__footer', 'fade-in');
}

function initLenis() {
  if (prefersReducedMotion) {
    return null;
  }

  const lenis = new Lenis({
    duration: isMobileViewport ? 0.85 : 1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.95,
    touchMultiplier: 1
  });

  lenis.on('scroll', ScrollTrigger.update);

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
        duration: isMobileViewport ? 0.9 : 1.05,
        easing: (value) => 1 - Math.pow(1 - value, 3)
      });
    });
  });

  return lenis;
}

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

function createRevealSystem() {
  const revealMap = new Map([
    ['fade-up', { autoAlpha: 0, y: MOTION.distance }],
    ['fade-in', { autoAlpha: 0 }],
    ['scale-in', { autoAlpha: 0, y: MOTION.distance * 0.35, scale: MOTION.scaleStart }]
  ]);

  revealMap.forEach((fromVars, className) => {
    gsap.utils.toArray(`.${className}`).forEach((element) => {
      if (element.closest('.hero-section')) {
        return;
      }

      gsap.from(element, {
        ...fromVars,
        duration: MOTION.duration,
        ease: MOTION.ease,
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

function initHeroTimeline() {
  if (!heroSection) {
    return;
  }

  const badge =
    heroSection.querySelector('.hero-section__badge') ||
    heroSection.querySelector('.hero-badge') ||
    heroSection.querySelector('.hero-section__eyebrow');
  const title = heroSection.querySelector('.hero-section__title');
  const subtitle = heroSection.querySelector('.hero-section__lead');
  const ctaButtons = heroSection.querySelectorAll('.hero-section__cta-row > *');
  const visual = heroSection.querySelector('.hero-section__visual-wrap');
  const metrics = heroSection.querySelectorAll('.hero-metric');
  const leadBands = heroSection.querySelectorAll('.hero-section__lead-band');

  const timeline = gsap.timeline({
    defaults: {
      duration: MOTION.duration,
      ease: MOTION.ease
    }
  });

  if (badge) {
    timeline.from(
      badge,
      {
        autoAlpha: 0,
        y: MOTION.distance * 0.5
      },
      0
    );
  }

  if (title) {
    timeline.from(
      title,
      {
        autoAlpha: 0,
        y: MOTION.distance
      },
      badge ? '-=0.22' : 0
    );
  }

  if (subtitle) {
    timeline.from(
      subtitle,
      {
        autoAlpha: 0,
        y: MOTION.distance * 0.8
      },
      '-=0.3'
    );
  }

  if (leadBands.length) {
    timeline.from(
      leadBands,
      {
        autoAlpha: 0,
        scaleY: 0.94,
        stagger: 0.04,
        duration: 0.5,
        transformOrigin: '50% 0%'
      },
      '<'
    );
  }

  if (ctaButtons.length) {
    timeline.from(
      ctaButtons,
      {
        autoAlpha: 0,
        y: MOTION.distance * 0.75,
        stagger: 0.08
      },
      '-=0.26'
    );
  }

  if (visual) {
    timeline.from(
      visual,
      {
        autoAlpha: 0,
        y: MOTION.distance,
        scale: MOTION.scaleStart
      },
      '-=0.4'
    );
  }

  if (metrics.length) {
    timeline.from(
      metrics,
      {
        autoAlpha: 0,
        y: MOTION.distance * 0.6,
        stagger: 0.06,
        duration: 0.5,
        ease: MOTION.easeSoft
      },
      '-=0.25'
    );
  }

  const heroVisual = heroSection.querySelector('.hero-section__visual');

  if (heroVisual) {
    gsap.to(heroVisual, {
      yPercent: isMobileViewport ? -2 : -5,
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

function initFeatureCards() {
  const section = document.querySelector('.capability-list');
  const cards = gsap.utils.toArray('.capability-card');

  if (!section || cards.length === 0) {
    return;
  }

  gsap.from(cards, {
    autoAlpha: 0,
    y: MOTION.distance,
    duration: MOTION.duration,
    ease: MOTION.ease,
    stagger: isMobileViewport ? 0.07 : 0.1,
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
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: MOTION.cardLift,
        scale: isMobileViewport ? 1.01 : 1.015,
        boxShadow: '0 22px 44px rgba(31, 31, 31, 0.08)',
        duration: MOTION.hoverDuration,
        ease: MOTION.easeSoft,
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: '0 0 0 rgba(31, 31, 31, 0)',
        duration: MOTION.hoverDuration,
        ease: MOTION.easeSoft,
        overwrite: 'auto'
      });
    });
  });
}

function initInteractiveHoverStates() {
  if (prefersReducedMotion) {
    return;
  }

  const scrambleMap = new WeakMap();
  const scrambleGlyphs = ['■', '▪', '▌', '▐', '▬'];

  const playScramble = (label, finalText) => {
    if (!label || !finalText) {
      return;
    }

    scrambleMap.get(label)?.kill();

    const state = { frame: 0 };
    const randomGlyph = () => scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)];

    const tween = gsap.to(state, {
      frame: finalText.length + 5,
      duration: 0.64,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: () => {
        const frame = Math.floor(state.frame);
        let nextText = '';

        for (let index = 0; index < finalText.length; index += 1) {
          const character = finalText[index];

          if (character === ' ') {
            nextText += ' ';
            continue;
          }

          if (frame > index + 4) {
            nextText += character;
            continue;
          }

          nextText += randomGlyph();
        }

        label.textContent = nextText;
      },
      onComplete: () => {
        label.textContent = finalText;
      }
    });

    scrambleMap.set(label, tween);
  };

  const resetScramble = (label, finalText) => {
    if (!label) {
      return;
    }

    scrambleMap.get(label)?.kill();
    label.textContent = finalText || 'BUILD';
  };

  const interactiveElements = document.querySelectorAll(
    '.site-header-button-v1, .site-header-button-v2, .site-header-link-m2, .site-header-dropdown, .button-page-numbering'
  );

  interactiveElements.forEach((element) => {
    const isBuildButton = element.classList.contains('site-header-link-m2');
    const isDropdownTrigger = element.classList.contains('site-header-dropdown');
    const isPageButton = element.classList.contains('button-page-numbering');
    const buildLabel = isBuildButton ? element.querySelector('.site-header-link-m2__label') : null;
    const originalBuildText = isBuildButton && buildLabel ? (buildLabel.textContent || '').trim().toUpperCase() : '';
    const scaleTo = gsap.quickTo(element, 'scale', {
      duration: MOTION.hoverDuration,
      ease: MOTION.ease
    });
    const yTo = gsap.quickTo(element, 'y', {
      duration: MOTION.hoverDuration,
      ease: MOTION.ease
    });

    gsap.set(element, {
      transformOrigin: '50% 50%',
      willChange: 'transform'
    });

    const pointerEnter = () => {
      if ('disabled' in element && element.disabled) {
        return;
      }

      const targetScale = isBuildButton
        ? isMobileViewport
          ? 1.008
          : 1.012
        : isDropdownTrigger
          ? isMobileViewport
            ? 1.004
            : 1.008
          : isPageButton
            ? isMobileViewport
              ? 1.01
              : 1.014
            : MOTION.buttonScale;
      const targetY = isDropdownTrigger ? -0.5 : isMobileViewport ? -0.75 : -1.5;

      scaleTo(targetScale);
      yTo(targetY);

      if (isBuildButton) {
        playScramble(buildLabel, originalBuildText);
      }
    };

    const pointerLeave = () => {
      scaleTo(1);
      yTo(0);

      if (isBuildButton) {
        resetScramble(buildLabel, originalBuildText);
      }
    };

    element.addEventListener('mouseenter', pointerEnter);
    element.addEventListener('mouseleave', pointerLeave);
    element.addEventListener('focus', pointerEnter);
    element.addEventListener('blur', pointerLeave);
  });
}

async function initLottieSupport() {
  const dotLottieNodes = Array.from(document.querySelectorAll('[data-dotlottie-src]'));
  const lottieNodes = Array.from(document.querySelectorAll('[data-lottie-src]'));

  if (dotLottieNodes.length) {
    const { DotLottie } = await import(
      'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.41.0/+esm'
    );

    dotLottieNodes.forEach((node) => {
      const src = node.dataset.dotlottieSrc;

      if (!src) {
        return;
      }

      new DotLottie({
        autoplay: node.dataset.autoplay !== 'false',
        canvas: node,
        loop: node.dataset.loop !== 'false',
        src
      });
    });
  }

  if (lottieNodes.length) {
    const { default: lottie } = await import(
      'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/+esm'
    );

    lottieNodes.forEach((node) => {
      const path = node.dataset.lottieSrc;

      if (!path) {
        return;
      }

      lottie.loadAnimation({
        container: node,
        renderer: 'svg',
        loop: node.dataset.loop !== 'false',
        autoplay: node.dataset.autoplay !== 'false',
        path
      });
    });
  }
}

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
  createRevealSystem();
  initFeatureCards();
  initInteractiveHoverStates();
  initLottieSupport().catch((error) => {
    console.warn('Optional Lottie setup failed', error);
  });

  ScrollTrigger.refresh();
}

initMotionSystem();
