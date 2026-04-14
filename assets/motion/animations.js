import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/+esm';

// Base motion stack: GSAP + ScrollTrigger + Lenis.
gsap.registerPlugin(ScrollTrigger);

const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionMedia.matches;
const mobileViewport = window.matchMedia('(max-width: 767px)');
const isMobileViewport = () => mobileViewport.matches;
const MOTION_BOOT_FLAG = '__apMotionBooted';
const MOTION_HOVER_BIND_FLAG = '__apMotionHoverBound';
const MOTION_CURSOR_BIND_FLAG = '__apMotionCursorBound';
const MOTION_DEBUG_FLAG = '__AP_MOTION_DEBUG__';
const MOTION_RUNTIME_CLEANUPS = [];
const rootStyles = getComputedStyle(document.documentElement);
const motionDebug = (...args) => {
  if (window[MOTION_DEBUG_FLAG]) {
    console.log('[ap-motion]', ...args);
  }
};
const isMotionDisabled = (element) =>
  Boolean(
    element &&
      (element.matches?.('[data-motion="off"]') || element.closest?.('[data-motion="off"]'))
  );

const registerMotionCleanup = (cleanup) => {
  if (typeof cleanup === 'function') {
    MOTION_RUNTIME_CLEANUPS.push(cleanup);
  }
};

const cleanupMotionRuntime = () => {
  while (MOTION_RUNTIME_CLEANUPS.length) {
    const cleanup = MOTION_RUNTIME_CLEANUPS.pop();
    try {
      cleanup?.();
    } catch (error) {
      motionDebug('cleanup error', error);
    }
  }
};

const readMotionToken = (tokenName, fallback) => {
  const rawValue = rootStyles.getPropertyValue(tokenName).trim();
  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getMotion = () => ({
  duration: isMobileViewport()
    ? readMotionToken('--motion-duration-reveal-mobile', 0.5)
    : readMotionToken('--motion-duration-reveal-desktop', 0.65),
  distance: isMobileViewport()
    ? readMotionToken('--motion-distance-reveal-mobile', 18)
    : readMotionToken('--motion-distance-reveal-desktop', 28),
  scaleStart: isMobileViewport()
    ? readMotionToken('--motion-scale-start-mobile', 0.985)
    : readMotionToken('--motion-scale-start-desktop', 0.965),
  hoverDuration: readMotionToken('--motion-duration-hover', 0.5),
  buttonScale: readMotionToken('--motion-scale-button', 1),
  ease: 'power3.out'
});

const HOW_SECURITY_MOTION = {
  pipeline: {
    phaseDelay: { mobile: 0.12, desktop: 0.15 },
    duration: { mobile: 2.5, desktop: 3.1 },
    layerAlpha: { active: 1, idle: 0.55 },
    intensityTransition: {
      active: { duration: 0.42, ease: 'power2.out' },
      idle: { duration: 0.5, ease: 'power2.out' }
    },
    timescale: { active: 1, idle: 0.7 },
    timescaleTransition: {
      active: { duration: 0.45, ease: 'power2.out' },
      idle: { duration: 0.55, ease: 'power2.out' }
    }
  },
  securityMetric: {
    startValue: 10,
    endValue: 5,
    timelineDelay: 0.22,
    counterDuration: { mobile: 1.8, desktop: 2.2 },
    blurDuration: { mobile: 1.2, desktop: 1.35 },
    counterEase: 'power1.out',
    blurEase: 'power1.out',
    initialBlur: 'blur(1.5px)',
    finalBlur: 'blur(0px)',
    initialAlpha: 0.78,
    finalAlpha: 1
  }
};

const getResponsiveMotionValue = (valueMap) =>
  isMobileViewport() ? valueMap.mobile : valueMap.desktop;

const handleReducedMotionChange = (event) => {
  prefersReducedMotion = event.matches;
  cleanupMotionRuntime();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  document.body.classList.remove('is-hero-laser-cursor');
  window[MOTION_BOOT_FLAG] = false;
  initMotionSystem();
};

if (typeof reducedMotionMedia.addEventListener === 'function') {
  reducedMotionMedia.addEventListener('change', handleReducedMotionChange);
} else if (typeof reducedMotionMedia.addListener === 'function') {
  reducedMotionMedia.addListener(handleReducedMotionChange);
}

const heroSection = document.querySelector('.hero-section');
const header = document.querySelector('.site-header-shell');
const REVEAL_ASSIGNMENTS = [
  ['.section-label', 'fade-in'],
  ['.solution-section__intro, .solution-section__cards, .solution-section__summary', 'fade-up'],
  ['.how-v2__intro > *', 'fade-up'],
  ['.how-v2__stats, .how-v2__performance', 'fade-up'],
  ['.how-v2__diagram', 'scale-in']
];

document.documentElement.style.scrollBehavior = 'auto';

function addClass(selector, className) {
  document.querySelectorAll(selector).forEach((element) => {
    if (isMotionDisabled(element)) {
      return;
    }
    element.classList.add(className);
  });
}

// Keep reduced-motion users on the same visual hierarchy without transitional movement.
function setReducedMotionState() {
  document
    .querySelectorAll('.fade-up, .fade-in, .scale-in, .hero-section__visual, .hero-metric')
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

  // Auto-assign base reveal classes for newly added sections.
  // This keeps scroll motion consistent without requiring manual selector updates each time.
  const hasRevealClass = (element) =>
    element.classList.contains('fade-up') ||
    element.classList.contains('fade-in') ||
    element.classList.contains('scale-in');

  const sections = gsap.utils.toArray('main section:not(.hero-section)');
  sections.forEach((section) => {
    if (isMotionDisabled(section)) {
      return;
    }

    const directChildren = Array.from(section.children).filter((child) => {
      if (!(child instanceof HTMLElement)) {
        return false;
      }
      if (child.classList.contains('sr-only')) {
        return false;
      }
      if (child.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      if (isMotionDisabled(child)) {
        return false;
      }
      return true;
    });

    directChildren.forEach((child) => {
      if (hasRevealClass(child)) {
        return;
      }

      const classSignature = `${child.className}`.toLowerCase();
      const isVisualBlock =
        classSignature.includes('visual') ||
        classSignature.includes('mockup') ||
        classSignature.includes('media') ||
        classSignature.includes('image') ||
        classSignature.includes('figure');

      child.classList.add(isVisualBlock ? 'scale-in' : 'fade-up');
    });
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

  const onLenisScroll = () => ScrollTrigger.update();
  const onRefresh = () => lenis.resize();
  const onTick = (time) => {
    lenis.raf(time * 1000);
  };

  lenis.on('scroll', onLenisScroll);
  ScrollTrigger.addEventListener('refresh', onRefresh);
  gsap.ticker.add(onTick);

  gsap.ticker.lagSmoothing(0);

  const getHeaderOffset = () => {
    if (header) {
      return Math.round(header.getBoundingClientRect().height);
    }

    const tokenValue = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')
    );
    return Number.isFinite(tokenValue) ? Math.round(tokenValue) : 0;
  };

  const resolveAnchorTarget = (target) => {
    if (!(target instanceof HTMLElement)) {
      return target;
    }

    if (target.matches('.site-wide.section-label-bar, .section-label-bar')) {
      return target;
    }

    const section =
      target.matches('section') ? target : target.closest('section');

    if (!section) {
      return target;
    }

    const sectionLabelBar =
      section.querySelector(':scope > .site-wide.section-label-bar, :scope > .section-label-bar');

    return sectionLabelBar || target;
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const sectionTarget = document.querySelector(`section${targetId}`);
      const fallbackTarget = document.querySelector(targetId);
      const target = sectionTarget || fallbackTarget;

      if (!target) {
        return;
      }

      event.preventDefault();
      const isHeaderLogo = link.classList.contains('site-header-logo');
      const scrollTarget = isHeaderLogo ? 0 : resolveAnchorTarget(target);
      const scrollDuration = isHeaderLogo
        ? (isMobileViewport() ? 1.15 : 1.45)
        : (isMobileViewport() ? 0.9 : 1.05);
      const scrollEasing = isHeaderLogo
        ? (value) => 1 - Math.pow(1 - value, 4)
        : (value) => 1 - Math.pow(1 - value, 3);
      const headerSnapCompensation = 1;
      lenis.scrollTo(scrollTarget, {
        offset: isHeaderLogo ? 0 : -getHeaderOffset() + headerSnapCompensation,
        duration: scrollDuration,
        easing: scrollEasing
      });

      if (isHeaderLogo && window.location.hash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    });
  });

  const destroy = () => {
    lenis.stop();
    if (typeof lenis.off === 'function') {
      lenis.off('scroll', onLenisScroll);
    }
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    gsap.ticker.remove(onTick);
    if (typeof lenis.destroy === 'function') {
      lenis.destroy();
    }
  };

  return { lenis, destroy };
}

function runInitialPreloader(lenis) {
  const preloader = document.querySelector('[data-preloader]');
  const logo = preloader?.querySelector('[data-preloader-logo]');
  const frameLines = preloader ? gsap.utils.toArray('.site-preloader__line', preloader) : [];
  const columns = gsap.utils.toArray('.site-preloader__col');

  if (!preloader) {
    document.body.classList.remove('is-preloading');
    lenis?.start();
    return Promise.resolve();
  }

  if (prefersReducedMotion) {
    preloader.setAttribute('hidden', '');
    document.body.classList.remove('is-preloading');
    lenis?.start();
    return Promise.resolve();
  }

  preloader.hidden = false;
  document.body.classList.add('is-preloading');
  lenis?.stop();

  gsap.set(preloader, { yPercent: 0, autoAlpha: 1 });
  if (columns.length) {
    gsap.set(columns, { yPercent: 0, autoAlpha: 1 });
  }
  if (frameLines.length) {
    gsap.set(frameLines, { autoAlpha: 0.1 });
    gsap.set('.site-preloader__line--top, .site-preloader__line--bottom', { scaleX: 0 });
    gsap.set('.site-preloader__line--left, .site-preloader__line--right', { scaleY: 0 });
  }
  if (logo) {
    gsap.set(logo, {
      transformOrigin: '50% 50%',
      autoAlpha: 0,
      scale: 0.94,
      x: 0,
      y: 0,
      filter: 'brightness(0) invert(1) blur(2px)'
    });
  }

  return new Promise((resolve) => {
    let completed = false;
    let safetyTimeoutId = 0;

    const finish = () => {
      if (completed) {
        return;
      }
      completed = true;
      if (safetyTimeoutId) {
        window.clearTimeout(safetyTimeoutId);
      }
      preloader.setAttribute('hidden', '');
      document.body.classList.remove('is-preloading');
      window.requestAnimationFrame(() => {
        lenis?.start();
        resolve();
      });
    };

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: finish
    });

    if (frameLines.length) {
      timeline.to(
        '.site-preloader__line--top',
        {
          scaleX: 1,
          autoAlpha: 0.44,
          duration: isMobileViewport() ? 0.6 : 0.72,
          ease: 'power2.out'
        }
      );
      timeline.to(
        '.site-preloader__line--right',
        {
          scaleY: 1,
          autoAlpha: 0.44,
          duration: isMobileViewport() ? 0.6 : 0.72,
          ease: 'power2.out'
        },
        '>-0.46'
      );
      timeline.to(
        '.site-preloader__line--bottom',
        {
          scaleX: 1,
          autoAlpha: 0.44,
          duration: isMobileViewport() ? 0.6 : 0.72,
          ease: 'power2.out'
        },
        '>-0.46'
      );
      timeline.to(
        '.site-preloader__line--left',
        {
          scaleY: 1,
          autoAlpha: 0.44,
          duration: isMobileViewport() ? 0.6 : 0.72,
          ease: 'power2.out'
        },
        '>-0.46'
      );
    }

    if (logo) {
      timeline.to(
        logo,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'brightness(0) invert(1) blur(0px)',
          duration: isMobileViewport() ? 0.7 : 0.86,
          ease: 'power3.out'
        },
        0.28
      );
      timeline.to({}, { duration: isMobileViewport() ? 0.58 : 0.74 });
      timeline.to(
        logo,
        {
          autoAlpha: 0,
          y: isMobileViewport() ? -4 : -8,
          scale: 1.01,
          filter: 'brightness(0) invert(1) blur(1px)',
          duration: isMobileViewport() ? 0.4 : 0.48,
          ease: 'power2.inOut'
        },
        '>-0.02'
      );
    }

    timeline.to(
      preloader,
      {
        yPercent: -100,
        duration: isMobileViewport() ? 0.96 : 1.12,
        ease: 'power2.inOut'
      },
      '>'
    );

    safetyTimeoutId = window.setTimeout(finish, 5200);
  });
}

// Header scroll-state stays centralized here so the rest of the motion system can stay declarative.
function initNavbarMotion(lenis) {
  if (!header) {
    return () => {};
  }

  const syncHeaderState = (scrollY) => {
    header.classList.toggle('is-scrolled', scrollY > 40);
  };

  syncHeaderState(window.scrollY);

  if (lenis) {
    const onLenisScroll = ({ scroll }) => {
      syncHeaderState(scroll);
    };
    lenis.on('scroll', onLenisScroll);
    return () => {
      if (typeof lenis.off === 'function') {
        lenis.off('scroll', onLenisScroll);
      }
    };
  }

  const onWindowScroll = () => {
    syncHeaderState(window.scrollY);
  };
  window.addEventListener('scroll', onWindowScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onWindowScroll);
  };
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
      if (isMotionDisabled(element)) {
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

// Dedicated headline reveal for the Solution title copy.
function initSolutionHeadlineMotion() {
  const title = document.querySelector('.solution-section .solution-section__title');

  if (!title || prefersReducedMotion || title.dataset.motionSplitReady === 'true') {
    return;
  }

  const intro = title.closest('.solution-section__intro');
  intro?.classList.remove('fade-up');

  const sourceText = (title.textContent || '').trim();
  if (!sourceText) {
    return;
  }

  const words = sourceText.split(/\s+/);
  title.innerHTML = words
    .map((word) => `<span class="solution-section__title-word">${word}</span>`)
    .join(' ');
  title.dataset.motionSplitReady = 'true';

  const wordNodes = gsap.utils.toArray('.solution-section__title-word', title);
  if (!wordNodes.length) {
    return;
  }

  gsap.set(wordNodes, {
    display: 'inline-block',
    autoAlpha: 0,
    y: isMobileViewport() ? 10 : 14,
    force3D: true
  });

  gsap.to(wordNodes, {
    autoAlpha: 1,
    y: 0,
    duration: isMobileViewport() ? 0.5 : 0.58,
    ease: 'power3.out',
    stagger: isMobileViewport() ? 0.03 : 0.04,
    scrollTrigger: {
      trigger: title,
      start: 'top 82%',
      once: true
    }
  });
}

// Sequenced reveal for Solution cards (lead + 01-05) with inner text hierarchy.
function initSolutionCardsMotion() {
  const cardsWrap = document.querySelector('.solution-section .solution-section__cards');

  if (!cardsWrap || prefersReducedMotion) {
    return;
  }

  cardsWrap.classList.remove('fade-up');
  const cards = gsap.utils.toArray('.solution-card', cardsWrap);

  if (!cards.length) {
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: cardsWrap,
      start: 'top 80%',
      once: true
    }
  });

  cards.forEach((card, index) => {
    const number = card.querySelector('.solution-card__number');
    const leadCopy = card.querySelector('.solution-card__lead-copy');
    const description = card.querySelector('.solution-card__desc');
    const detail = card.querySelector('.solution-card__detail');
    const bodyTargets = [number, leadCopy, description, detail].filter(Boolean);
    const at = index * (isMobileViewport() ? 0.08 : 0.1);

    timeline.from(
      card,
      {
        autoAlpha: 0,
        y: isMobileViewport() ? 16 : 22,
        duration: isMobileViewport() ? 0.48 : 0.56,
        ease: 'power3.out',
        force3D: true
      },
      at
    );

    if (bodyTargets.length) {
      timeline.from(
        bodyTargets,
        {
          autoAlpha: 0,
          y: isMobileViewport() ? 10 : 12,
          duration: isMobileViewport() ? 0.44 : 0.5,
          ease: 'power3.out',
          stagger: 0.04,
          force3D: true
        },
        at + 0.08
      );
    }
  });
}

// Text reveal for "AuthProxy replaces all five." and its capability list.
function initSolutionSummaryMotion() {
  const summary = document.querySelector('.solution-section .solution-section__summary');

  if (!summary || prefersReducedMotion || summary.dataset.motionSummaryReady === 'true') {
    return;
  }

  const summaryTitle = summary.querySelector('.solution-section__summary-title');
  const capabilityItems = gsap.utils.toArray('.solution-capability-item', summary);

  if (!summaryTitle) {
    return;
  }

  const titleTextNodes = gsap.utils.toArray('span', summaryTitle);
  titleTextNodes.forEach((node) => {
    node.style.display = 'inline-block';
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: summary,
      start: 'top 82%',
      once: true
    }
  });

  if (titleTextNodes.length) {
    timeline.from(
      titleTextNodes,
      {
        autoAlpha: 0,
        y: isMobileViewport() ? 14 : 18,
        duration: isMobileViewport() ? 0.5 : 0.58,
        ease: 'power3.out',
        stagger: isMobileViewport() ? 0.06 : 0.08,
        force3D: true
      },
      0
    );
  } else {
    timeline.from(
      summaryTitle,
      {
        autoAlpha: 0,
        y: isMobileViewport() ? 14 : 18,
        duration: isMobileViewport() ? 0.5 : 0.58,
        ease: 'power3.out',
        force3D: true
      },
      0
    );
  }

  capabilityItems.forEach((item, index) => {
    const title = item.querySelector('.solution-capability-item__title');
    const tag = item.querySelector('.solution-capability-item__tag');
    const at = (isMobileViewport() ? 0.14 : 0.18) + index * (isMobileViewport() ? 0.06 : 0.08);

    if (title) {
      timeline.from(
        title,
        {
          autoAlpha: 0,
          y: isMobileViewport() ? 10 : 12,
          duration: isMobileViewport() ? 0.44 : 0.5,
          ease: 'power3.out',
          force3D: true
        },
        at
      );
    }

    if (tag) {
      timeline.from(
        tag,
        {
          autoAlpha: 0,
          y: isMobileViewport() ? 8 : 10,
          duration: isMobileViewport() ? 0.42 : 0.48,
          ease: 'power3.out',
          force3D: true
        },
        at + 0.04
      );
    }
  });

  summary.dataset.motionSummaryReady = 'true';
}

// Sequential reveal for How v2 metric rows (Auth check / Policy check / Route resolve).
function initHowV2StatsReveal() {
  const statsWrap = document.querySelector('.how-v2__stats');
  const rows = statsWrap ? gsap.utils.toArray('p', statsWrap) : [];

  if (!statsWrap || !rows.length || prefersReducedMotion) {
    return;
  }

  rows.forEach((row) => row.classList.remove('fade-up'));

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: statsWrap,
      start: 'top 84%',
      once: true
    }
  });

  timeline.from(rows, {
    autoAlpha: 0,
    y: isMobileViewport() ? 14 : 18,
    duration: isMobileViewport() ? 0.5 : 0.58,
    ease: 'power3.out',
    stagger: isMobileViewport() ? 0.16 : 0.2,
    force3D: true
  });
}

// How v2 pipeline arrows: chevron-flow with phased right arrow delay.
function initHowV2PipelineChevronFlow() {
  const pipeline = document.querySelector('.how-v2__pipeline');
  const arrows = gsap.utils.toArray('.how-v2__pipeline-arrow', pipeline);

  if (!pipeline || arrows.length < 2 || prefersReducedMotion) {
    return;
  }

  const rightPhaseDelay = getResponsiveMotionValue(HOW_SECURITY_MOTION.pipeline.phaseDelay);
  const flowDuration = getResponsiveMotionValue(HOW_SECURITY_MOTION.pipeline.duration);
  const activeOpacity = HOW_SECURITY_MOTION.pipeline.layerAlpha.active;
  const idleOpacity = HOW_SECURITY_MOTION.pipeline.layerAlpha.idle;
  const animatedLayers = [];
  const animatedTweens = [];

  const createLayer = (arrow) => {
    let layer = arrow.querySelector('.how-v2__pipeline-motion');

    if (!layer) {
      layer = document.createElement('span');
      layer.className = 'how-v2__pipeline-motion';
      layer.setAttribute('aria-hidden', 'true');
      const chevronIcon = `
        <svg class="how-v2__pipeline-chevron-icon" viewBox="373 187 15 15" aria-hidden="true" focusable="false">
          <path d="M374.795 188.316a1.124 1.124 0 1 0-1.59 1.591l6 6c.435.435 1.14.44 1.581.01l6-5.854a1.126 1.126 0 0 0-1.572-1.611l-5.204 5.078-5.215-5.214Z"></path>
        </svg>
      `;
      layer.innerHTML = `
        <span class="how-v2__pipeline-track">
          <span class="how-v2__pipeline-chevrons">
            <span class="how-v2__pipeline-chevron is-opacity-3">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-5">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-7">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-3">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-5">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-7">${chevronIcon}</span>
          </span>
          <span class="how-v2__pipeline-chevrons" aria-hidden="true">
            <span class="how-v2__pipeline-chevron is-opacity-3">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-5">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-7">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-3">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-5">${chevronIcon}</span>
            <span class="how-v2__pipeline-chevron is-opacity-7">${chevronIcon}</span>
          </span>
        </span>
      `;
      arrow.append(layer);
    }

    return layer;
  };

  const buildChevronFlow = (arrow, delay = 0) => {
    const layer = createLayer(arrow);
    const track = layer.querySelector('.how-v2__pipeline-track');
    const firstGroup = layer.querySelector('.how-v2__pipeline-chevrons');

    if (!track || !firstGroup) {
      return;
    }

    const cycleShift = Math.round(firstGroup.getBoundingClientRect().width) || 120;

    animatedLayers.push(layer);
    gsap.set(layer, { autoAlpha: 0.96 });
    gsap.set(track, { x: -cycleShift });

    const tween = gsap.to(track, {
      x: 0,
      duration: flowDuration,
      ease: 'none',
      repeat: -1,
      delay
    });

    animatedTweens.push(tween);
  };

  buildChevronFlow(arrows[0], 0);
  buildChevronFlow(arrows[1], rightPhaseDelay);

  if (!animatedTweens.length) {
    return;
  }

  const setActiveIntensity = () => {
    gsap.to(animatedLayers, {
      autoAlpha: activeOpacity,
      duration: HOW_SECURITY_MOTION.pipeline.intensityTransition.active.duration,
      ease: HOW_SECURITY_MOTION.pipeline.intensityTransition.active.ease,
      overwrite: true
    });
    gsap.to(animatedTweens, {
      timeScale: HOW_SECURITY_MOTION.pipeline.timescale.active,
      duration: HOW_SECURITY_MOTION.pipeline.timescaleTransition.active.duration,
      ease: HOW_SECURITY_MOTION.pipeline.timescaleTransition.active.ease,
      overwrite: true
    });
  };

  const setIdleIntensity = () => {
    gsap.to(animatedLayers, {
      autoAlpha: idleOpacity,
      duration: HOW_SECURITY_MOTION.pipeline.intensityTransition.idle.duration,
      ease: HOW_SECURITY_MOTION.pipeline.intensityTransition.idle.ease,
      overwrite: true
    });
    gsap.to(animatedTweens, {
      timeScale: HOW_SECURITY_MOTION.pipeline.timescale.idle,
      duration: HOW_SECURITY_MOTION.pipeline.timescaleTransition.idle.duration,
      ease: HOW_SECURITY_MOTION.pipeline.timescaleTransition.idle.ease,
      overwrite: true
    });
  };

  ScrollTrigger.create({
    trigger: pipeline,
    start: 'top 92%',
    end: 'bottom 8%',
    onEnter: setActiveIntensity,
    onEnterBack: setActiveIntensity,
    onLeave: setIdleIntensity,
    onLeaveBack: setIdleIntensity
  });

  setIdleIntensity();
}

// Operations workflow arrows: animated chevron streams on horizontal and vertical links.
function initOperationsChevronFlow() {
  const scene = document.querySelector('.operations-visual__scene');
  const arrows = scene ? gsap.utils.toArray('.operations-visual__arrow', scene) : [];

  if (!scene || arrows.length < 4 || prefersReducedMotion) {
    return () => {};
  }

  const flowConfigs = [
    { key: 'operations-visual__arrow--top', axis: 'x', direction: 'right', delay: 0, mode: 'chevrons' },
    { key: 'operations-visual__arrow--right', axis: 'y', direction: 'up', delay: 0, mode: 'dash' },
    { key: 'operations-visual__arrow--bottom', axis: 'x', direction: 'left', delay: 0, mode: 'chevrons' },
    { key: 'operations-visual__arrow--left', axis: 'y', direction: 'down', delay: 0, mode: 'dash' }
  ];

  const chevronIcon = `
    <svg viewBox="373 187 15 15" aria-hidden="true" focusable="false">
      <path d="M374.795 188.316a1.124 1.124 0 1 0-1.59 1.591l6 6c.435.435 1.14.44 1.581.01l6-5.854a1.126 1.126 0 0 0-1.572-1.611l-5.204 5.078-5.215-5.214Z"></path>
    </svg>
  `;

  const flows = [];
  const tweens = [];
  const horizontalFlowDuration = isMobileViewport() ? 3.15 : 2.85;
  const verticalFlowDuration = isMobileViewport() ? 0.96 : 0.84;

  const createChevronGroup = (direction) => `
    <span class="operations-visual__arrow-flow-chevrons operations-visual__arrow-flow-chevrons--${direction}">
      <span class="operations-visual__arrow-flow-chevron is-opacity-3 is-dir-${direction}">${chevronIcon}</span>
      <span class="operations-visual__arrow-flow-chevron is-opacity-5 is-dir-${direction}">${chevronIcon}</span>
      <span class="operations-visual__arrow-flow-chevron is-opacity-7 is-dir-${direction}">${chevronIcon}</span>
      <span class="operations-visual__arrow-flow-chevron is-opacity-5 is-dir-${direction}">${chevronIcon}</span>
      <span class="operations-visual__arrow-flow-chevron is-opacity-3 is-dir-${direction}">${chevronIcon}</span>
    </span>
  `;

  const createFlow = (arrow, config) => {
    const flow = document.createElement('span');
    flow.className = `operations-visual__arrow-flow operations-visual__arrow-flow--${config.key.split('--')[1]} ${
      config.axis === 'y' ? 'is-vertical' : 'is-horizontal'
    } ${config.mode === 'dash' ? 'is-dash' : 'is-chevrons'}`;
    flow.setAttribute('aria-hidden', 'true');
    if (config.mode === 'dash') {
      flow.innerHTML = `
        <span class="operations-visual__arrow-flow-motion">
          <svg class="operations-visual__arrow-flow-dash-svg" viewBox="0 0 12 110" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path
              class="operations-visual__arrow-flow-dash-path"
              d="M6 0 V110"
              stroke="#ED585A"
              stroke-dasharray="2 6"
              stroke-linecap="round"
            ></path>
          </svg>
        </span>
      `;
    } else {
      flow.innerHTML = `
        <span class="operations-visual__arrow-flow-motion">
          <span class="operations-visual__arrow-flow-track operations-visual__arrow-flow-track--${config.axis}">
            ${createChevronGroup(config.direction)}
            ${createChevronGroup(config.direction)}
          </span>
        </span>
      `;
    }

    scene.append(flow);
    arrow.classList.add('is-motion-hidden');

    const track =
      config.mode === 'dash'
        ? flow.querySelector('.operations-visual__arrow-flow-dash-path')
        : flow.querySelector('.operations-visual__arrow-flow-track');
    const group = flow.querySelector('.operations-visual__arrow-flow-chevrons');
    if (!track) {
      return null;
    }

    return {
      arrow,
      flow,
      track,
      group,
      axis: config.axis,
      direction: config.direction,
      mode: config.mode,
      delay: config.delay,
      tween: null
    };
  };

  flowConfigs.forEach((config) => {
    const arrow = arrows.find((item) => item.classList.contains(config.key));
    if (!arrow) {
      return;
    }
    const flow = createFlow(arrow, config);
    if (flow) {
      flows.push(flow);
    }
  });

  if (!flows.length) {
    return () => {};
  }

  const buildTweens = () => {
    tweens.forEach((tween) => tween.kill());
    tweens.length = 0;

    flows.forEach((entry) => {
      if (entry.mode === 'dash') {
        const startOffset = entry.direction === 'up' ? 0 : 8;
        const endOffset = entry.direction === 'up' ? -8 : 0;
        gsap.set(entry.track, { attr: { 'stroke-dashoffset': startOffset } });
        const tween = gsap.to(entry.track, {
          attr: { 'stroke-dashoffset': endOffset },
          duration: verticalFlowDuration,
          ease: 'none',
          repeat: -1,
          delay: entry.delay
        });
        entry.tween = tween;
        tweens.push(tween);
        return;
      }

      const groupRect = entry.group.getBoundingClientRect();
      const cycleShift =
        Math.round(entry.axis === 'x' ? groupRect.width : groupRect.height) || 88;
      const startOffset =
        entry.direction === 'right' || entry.direction === 'down' ? -cycleShift : 0;
      const endOffset =
        entry.direction === 'right' || entry.direction === 'down' ? 0 : -cycleShift;
      const fromVars = entry.axis === 'x' ? { x: startOffset, y: 0 } : { y: startOffset, x: 0 };
      const toVars = entry.axis === 'x' ? { x: endOffset } : { y: endOffset };

      gsap.set(entry.track, fromVars);

      const tween = gsap.to(entry.track, {
        ...toVars,
        duration: horizontalFlowDuration,
        ease: 'none',
        repeat: -1,
        delay: entry.delay
      });
      entry.tween = tween;
      tweens.push(tween);
    });
  };

  const positionFlows = () => {
    const sceneRect = scene.getBoundingClientRect();

    flows.forEach((entry) => {
      const rect = entry.arrow.getBoundingClientRect();
      const cx = rect.left - sceneRect.left + rect.width / 2;
      const cy = rect.top - sceneRect.top + rect.height / 2;
      const length = Math.max(rect.width, rect.height);
      const thickness = Math.max(10, Math.min(rect.width, rect.height));
      const isVertical = entry.axis === 'y';
      const flowWidth = isVertical ? thickness : length;
      const flowHeight = isVertical ? length : thickness;

      entry.flow.style.width = `${Math.round(flowWidth)}px`;
      entry.flow.style.height = `${Math.round(flowHeight)}px`;
      entry.flow.style.left = `${Math.round(cx - flowWidth / 2)}px`;
      entry.flow.style.top = `${Math.round(cy - flowHeight / 2)}px`;
    });
  };

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      positionFlows();
      buildTweens();
    });
  };

  positionFlows();
  buildTweens();

  const trigger = ScrollTrigger.create({
    trigger: scene,
    start: 'top 90%',
    end: 'bottom 12%',
    onEnter: () => {
      gsap.to(flows.map((entry) => entry.flow), { autoAlpha: 0.98, duration: 0.35, ease: 'power2.out' });
      gsap.to(tweens, { timeScale: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
    },
    onEnterBack: () => {
      gsap.to(flows.map((entry) => entry.flow), { autoAlpha: 0.98, duration: 0.35, ease: 'power2.out' });
      gsap.to(tweens, { timeScale: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
    },
    onLeave: () => {
      gsap.to(flows.map((entry) => entry.flow), { autoAlpha: 0.65, duration: 0.35, ease: 'power2.out' });
      gsap.to(tweens, { timeScale: 0.45, duration: 0.4, ease: 'power2.out', overwrite: true });
    },
    onLeaveBack: () => {
      gsap.to(flows.map((entry) => entry.flow), { autoAlpha: 0.65, duration: 0.35, ease: 'power2.out' });
      gsap.to(tweens, { timeScale: 0.45, duration: 0.4, ease: 'power2.out', overwrite: true });
    }
  });

  window.addEventListener('resize', onResize, { passive: true });
  gsap.set(flows.map((entry) => entry.flow), { autoAlpha: 0.65 });
  gsap.to(tweens, { timeScale: 0.45, duration: 0.01 });

  return () => {
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('resize', onResize);
    trigger.kill();
    tweens.forEach((tween) => tween.kill());
    flows.forEach((entry) => {
      entry.arrow.classList.remove('is-motion-hidden');
      entry.flow.remove();
    });
  };
}

function initSecurityMetricCounter() {
  const metric = document.querySelector('.security-section__metric');
  const accent = metric?.querySelector('.security-section__metric-accent');

  if (!metric || !accent || prefersReducedMotion) {
    return;
  }

  const state = { value: HOW_SECURITY_MOTION.securityMetric.startValue };
  let played = false;

  gsap.set(accent, {
    filter: HOW_SECURITY_MOTION.securityMetric.initialBlur,
    autoAlpha: HOW_SECURITY_MOTION.securityMetric.initialAlpha
  });
  accent.textContent = `${HOW_SECURITY_MOTION.securityMetric.startValue}x`;

  ScrollTrigger.create({
    trigger: metric,
    start: 'top 82%',
    once: true,
    onEnter: () => {
      if (played) {
        return;
      }
      played = true;

      const timeline = gsap.timeline({ delay: HOW_SECURITY_MOTION.securityMetric.timelineDelay });

      timeline.to(state, {
        value: HOW_SECURITY_MOTION.securityMetric.endValue,
        duration: getResponsiveMotionValue(HOW_SECURITY_MOTION.securityMetric.counterDuration),
        ease: HOW_SECURITY_MOTION.securityMetric.counterEase,
        onUpdate: () => {
          accent.textContent = `${state.value.toFixed(1)}x`;
        },
        onComplete: () => {
          accent.textContent = `${HOW_SECURITY_MOTION.securityMetric.endValue}x`;
        }
      });

      timeline.to(
        accent,
        {
          filter: HOW_SECURITY_MOTION.securityMetric.finalBlur,
          autoAlpha: HOW_SECURITY_MOTION.securityMetric.finalAlpha,
          duration: getResponsiveMotionValue(HOW_SECURITY_MOTION.securityMetric.blurDuration),
          ease: HOW_SECURITY_MOTION.securityMetric.blurEase
        },
        0
      );
    }
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
    const chevronDelay = isMobileViewport() ? 0.12 : 0.18;
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
      delay: chevronDelay,
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
        delay: chevronDelay,
        force3D: true
      },
      0
    );
  });
}

function initSystemNodeApgImpulseFlow() {
  const wraps = gsap.utils.toArray('.how-section__node-apg-impulse');

  if (!wraps.length || prefersReducedMotion) {
    return;
  }

  wraps.forEach((wrap) => {
    if (wrap.closest('.how-v2__pipeline')) {
      return;
    }

    const orbitPaths = gsap.utils.toArray('.how-section__apg-impulse-runner', wrap);

    if (!orbitPaths.length) {
      return;
    }

    const guidePaths = orbitPaths.filter((path) => typeof path.getTotalLength === 'function');
    gsap.set(guidePaths, { autoAlpha: 0 });

    const dots = guidePaths.map(() => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'how-section__apg-impulse-dot');
      dot.setAttribute('r', isMobileViewport() ? '2.6' : '3.2');
      dot.setAttribute('cx', '0');
      dot.setAttribute('cy', '0');
      wrap.append(dot);
      return dot;
    });

    const tracks = guidePaths.map(() => ({ progress: 0 }));
    const tweens = guidePaths.map((path, index) => {
      const length = path.getTotalLength();

      return gsap.to(tracks[index], {
        progress: 1,
        duration: isMobileViewport() ? 2.8 : 3.25,
        ease: 'none',
        repeat: -1,
        paused: true,
        delay: index * 0.36,
        onUpdate: () => {
          const point = path.getPointAtLength((tracks[index].progress % 1) * length);
          dots[index].setAttribute('cx', `${point.x}`);
          dots[index].setAttribute('cy', `${point.y}`);
        }
      });
    });

    const trigger =
      wrap.closest('.how-section__visual, .solution-section__visual') ??
      wrap.parentElement ??
      wrap;

    ScrollTrigger.create({
      trigger,
      start: 'top 88%',
      end: 'bottom 12%',
      onEnter: () => {
        motionDebug('apg impulse trigger: enter');
        tweens.forEach((tween) => tween.play());
      },
      onEnterBack: () => {
        motionDebug('apg impulse trigger: enter-back');
        tweens.forEach((tween) => tween.play());
      },
      onLeave: () => {
        motionDebug('apg impulse trigger: leave');
        tweens.forEach((tween) => tween.pause());
      },
      onLeaveBack: () => {
        motionDebug('apg impulse trigger: leave-back');
        tweens.forEach((tween) => tween.pause());
      }
    });
  });
}

function initHowSystemNodeEllipsesFlow() {
  const containers = gsap.utils.toArray('.how-section__nodes-telemetry');

  if (!containers.length || prefersReducedMotion) {
    return;
  }

  containers.forEach((container) => {
    const indicators = gsap.utils.toArray('.how-section__node-telemetry-indicator', container);

    if (!indicators.length) {
      return;
    }

    gsap.set(indicators, {
      autoAlpha: 0.06,
      scale: 0.82,
      transformOrigin: '50% 50%'
    });

    const timeline = gsap.timeline({ paused: true, repeat: -1 });

    indicators.forEach((indicator, index) => {
      const startAt = index * 0.16;

      timeline.to(
        indicator,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        },
        startAt
      );

      timeline.to(
        indicator,
        {
          autoAlpha: 0.08,
          scale: 0.84,
          duration: 0.34,
          ease: 'power1.inOut'
        },
        startAt + 0.14
      );
    });

    timeline.to({}, { duration: 0.18 });

    const trigger =
      container.closest('.how-section__visual, .solution-section__visual') ??
      container.parentElement ??
      container;

    ScrollTrigger.create({
      trigger,
      start: 'top 88%',
      end: 'bottom 12%',
      onEnter: () => {
        motionDebug('how telemetry trigger: enter');
        timeline.play();
      },
      onEnterBack: () => {
        motionDebug('how telemetry trigger: enter-back');
        timeline.play();
      },
      onLeave: () => {
        motionDebug('how telemetry trigger: leave');
        timeline.pause();
      },
      onLeaveBack: () => {
        motionDebug('how telemetry trigger: leave-back');
        timeline.pause();
      }
    });
  });
}

function initHowLayerStackReveal({ reduced = false } = {}) {
  const groups = gsap.utils.toArray('.how-section__layer-group');

  if (!groups.length) {
    return;
  }

  groups.forEach((group) => {
    const layerNodes = gsap.utils.toArray('.how-section__layer-node', group);
    const telemetryNodes = gsap.utils.toArray('.how-section__node-telemetry', group);
    const visual =
      group.closest('.how-section__visual, .solution-section__visual') ??
      group.parentElement ??
      group;

    if (!layerNodes.length || !visual) {
      return;
    }

    if (reduced || prefersReducedMotion) {
      gsap.set([...layerNodes, ...telemetryNodes], { clearProps: 'transform' });
      return;
    }

    const compactGap = isMobileViewport() ? 44 : 52;
    const expandedGap = 73;
    const offsetStep = Math.max(0, expandedGap - compactGap);

    layerNodes.forEach((node, index) => {
      gsap.set(node, {
        y: -(index * offsetStep),
        transformOrigin: '50% 50%'
      });
    });

    telemetryNodes.forEach((node, index) => {
      gsap.set(node, {
        y: -(index * offsetStep),
        transformOrigin: '50% 50%'
      });
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: visual,
        start: 'top 78%',
        once: true
      }
    });

    timeline.to(layerNodes, {
      y: 0,
      duration: isMobileViewport() ? 0.84 : 1.06,
      ease: 'power3.out',
      delay: isMobileViewport() ? 0.12 : 0.16
    });

    if (telemetryNodes.length) {
      timeline.to(
        telemetryNodes,
        {
          y: 0,
          duration: isMobileViewport() ? 0.84 : 1.06,
          ease: 'power3.out',
          delay: isMobileViewport() ? 0.12 : 0.16
        },
        0
      );
    }
  });
}

function initGridLaserHover({ panelSelector, gridSelector = null, bindToken }) {
  const panel = document.querySelector(panelSelector);
  const grid = gridSelector ? panel?.querySelector(gridSelector) : panel;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (!panel || !grid || prefersReducedMotion || hasCoarsePointer) {
    return () => {};
  }
  if (bindToken && panel.dataset[bindToken] === '1') {
    return () => {};
  }
  if (bindToken) {
    panel.dataset[bindToken] = '1';
  }

  let overlay = grid.querySelector('.hero-section__grid-laser');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'hero-section__grid-laser';

    const vMain = document.createElement('span');
    vMain.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--v';
    const hMain = document.createElement('span');
    hMain.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--h';
    const vGhost = document.createElement('span');
    vGhost.className =
      'hero-section__grid-laser-line hero-section__grid-laser-line--v hero-section__grid-laser-line--ghost';
    const hGhost = document.createElement('span');
    hGhost.className =
      'hero-section__grid-laser-line hero-section__grid-laser-line--h hero-section__grid-laser-line--ghost';
    const dot = document.createElement('span');
    dot.className = 'hero-section__grid-laser-dot';

    overlay.append(vGhost, hGhost, vMain, hMain, dot);
    grid.append(overlay);
  }

  const vMain = overlay.querySelector(
    '.hero-section__grid-laser-line--v:not(.hero-section__grid-laser-line--ghost)'
  );
  const hMain = overlay.querySelector(
    '.hero-section__grid-laser-line--h:not(.hero-section__grid-laser-line--ghost)'
  );
  const vGhost = overlay.querySelector('.hero-section__grid-laser-line--v.hero-section__grid-laser-line--ghost');
  const hGhost = overlay.querySelector('.hero-section__grid-laser-line--h.hero-section__grid-laser-line--ghost');
  const dot = overlay.querySelector('.hero-section__grid-laser-dot');

  if (!vMain || !hMain || !vGhost || !hGhost || !dot) {
    return;
  }

  const gridStep = 100;
  const gridOffset = 99;
  const xToMainV = gsap.quickTo(vMain, 'x', { duration: 0.22, ease: 'power3.out' });
  const yToMainV = gsap.quickTo(vMain, 'y', { duration: 0.22, ease: 'power3.out' });
  const hToMainV = gsap.quickTo(vMain, 'height', { duration: 0.22, ease: 'power3.out' });
  const xToMainH = gsap.quickTo(hMain, 'x', { duration: 0.22, ease: 'power3.out' });
  const yToMainH = gsap.quickTo(hMain, 'y', { duration: 0.22, ease: 'power3.out' });
  const wToMainH = gsap.quickTo(hMain, 'width', { duration: 0.22, ease: 'power3.out' });
  const xToGhostV = gsap.quickTo(vGhost, 'x', { duration: 0.44, ease: 'power3.out' });
  const yToGhostV = gsap.quickTo(vGhost, 'y', { duration: 0.44, ease: 'power3.out' });
  const hToGhostV = gsap.quickTo(vGhost, 'height', { duration: 0.44, ease: 'power3.out' });
  const xToGhostH = gsap.quickTo(hGhost, 'x', { duration: 0.44, ease: 'power3.out' });
  const yToGhostH = gsap.quickTo(hGhost, 'y', { duration: 0.44, ease: 'power3.out' });
  const wToGhostH = gsap.quickTo(hGhost, 'width', { duration: 0.44, ease: 'power3.out' });
  const xToDot = gsap.quickTo(dot, 'x', { duration: 0.26, ease: 'power3.out' });
  const yToDot = gsap.quickTo(dot, 'y', { duration: 0.26, ease: 'power3.out' });
  const alphaToMainV = gsap.quickTo(vMain, 'opacity', { duration: 0.2, ease: 'power2.out' });
  const alphaToMainH = gsap.quickTo(hMain, 'opacity', { duration: 0.2, ease: 'power2.out' });
  const alphaToGhostV = gsap.quickTo(vGhost, 'opacity', { duration: 0.28, ease: 'power2.out' });
  const alphaToGhostH = gsap.quickTo(hGhost, 'opacity', { duration: 0.28, ease: 'power2.out' });
  const alphaToDot = gsap.quickTo(dot, 'opacity', { duration: 0.2, ease: 'power2.out' });
  const dotPulse = gsap.timeline({ repeat: -1, paused: true });

  const toNearestGridLine = (value, max) => {
    const snapped = gridOffset + Math.round((value - gridOffset) / gridStep) * gridStep;
    return gsap.utils.clamp(0, max, snapped);
  };

  dotPulse.to(dot, { scale: 1.22, duration: 0.18, ease: 'power2.out' });
  dotPulse.to(dot, { scale: 0.94, duration: 0.22, ease: 'power1.inOut' });
  dotPulse.to(dot, { scale: 1, duration: 0.18, ease: 'power2.out' });
  dotPulse.to({}, { duration: 0.12 });

  const updateLaser = (event) => {
    if (prefersReducedMotion) {
      return;
    }
    const rect = grid.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    if (localX < 0 || localX > rect.width || localY < 0 || localY > rect.height) {
      return;
    }
    document.body.classList.add('is-hero-laser-cursor');

    const lineX = toNearestGridLine(localX, rect.width);
    const lineY = toNearestGridLine(localY, rect.height);
    const left = gsap.utils.clamp(0, rect.width, lineX - gridStep);
    const right = gsap.utils.clamp(0, rect.width, lineX + gridStep);
    const top = gsap.utils.clamp(0, rect.height, lineY - gridStep);
    const bottom = gsap.utils.clamp(0, rect.height, lineY + gridStep);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    xToMainV(lineX);
    yToMainV(top);
    hToMainV(height);
    xToMainH(left);
    yToMainH(lineY);
    wToMainH(width);
    xToGhostV(lineX);
    yToGhostV(top);
    hToGhostV(height);
    xToGhostH(left);
    yToGhostH(lineY);
    wToGhostH(width);
    xToDot(lineX);
    yToDot(lineY);
    alphaToMainV(0.96);
    alphaToMainH(0.96);
    alphaToGhostV(0.52);
    alphaToGhostH(0.52);
    alphaToDot(0.88);
    if (!dotPulse.isActive()) {
      dotPulse.play();
    }
  };

  const hideLaser = () => {
    document.body.classList.remove('is-hero-laser-cursor');
    dotPulse.pause(0);
    gsap.set(dot, { scale: 1 });
    alphaToMainV(0);
    alphaToMainH(0);
    alphaToGhostV(0);
    alphaToGhostH(0);
    alphaToDot(0);
  };

  panel.addEventListener('pointerenter', updateLaser, { passive: true });
  panel.addEventListener('pointermove', updateLaser, { passive: true });
  panel.addEventListener('pointerleave', hideLaser, { passive: true });

  return () => {
    panel.removeEventListener('pointerenter', updateLaser);
    panel.removeEventListener('pointermove', updateLaser);
    panel.removeEventListener('pointerleave', hideLaser);
    hideLaser();
    if (bindToken) {
      delete panel.dataset[bindToken];
    }
  };
}

// Pointer-driven dual cross-lines with delayed ghost trail (Figma node 476:11902).
function initHeroGridLaserHover() {
  return initGridLaserHover({
    panelSelector: '.hero-section__panel',
    gridSelector: '.hero-section__grid-bg',
    bindToken: 'motionLaserHeroBound'
  });
}

// Reuse Hero laser-grid interaction for How v2 diagram grid.
function initHowV2GridLaserHover() {
  return initGridLaserHover({
    panelSelector: '.how-v2__diagram',
    gridSelector: '.how-v2__diagram-grid',
    bindToken: 'motionLaserHowBound'
  });
}

// Reuse Hero laser-grid interaction for Developers intro grid.
function initDevelopersGridLaserHover() {
  return initGridLaserHover({
    panelSelector: '.developers-section__intro',
    bindToken: 'motionLaserDevelopersBound'
  });
}

// Reuse Hero laser-grid interaction for Pricing hero grid.
function initPricingGridLaserHover() {
  return initGridLaserHover({
    panelSelector: '.pricing-section__hero',
    gridSelector: '.pricing-section__hero-grid',
    bindToken: 'motionLaserPricingBound'
  });
}

// Perspective data-beams over Developers center grid: exact SVG tracks, one-way to center.
function initDevelopersPerspectiveBeams() {
  const center = document.querySelector('.developers-highlights__center');
  if (!center || prefersReducedMotion) {
    return () => {};
  }

  let layer = center.querySelector('.developers-highlights__beams');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'developers-highlights__beams';
    layer.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'developers-highlights__beams-svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    layer.append(svg);
    center.append(layer);
  }

  const svg = layer.querySelector('.developers-highlights__beams-svg');
  if (!svg) {
    return () => {};
  }
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('shape-rendering', 'geometricPrecision');

  // Reduced track set: 2-3 rays per side to avoid visual noise.
  const beamTrackPaths = [
    // top side
    'M183.741 167.986L99.5441 0.125027',
    'M199.624 0.125462V167.986',
    'M215.453 167.986L299.347 0.125027',
    // bottom side
    'M183.731 231.257L99.755 399.116',
    'M199.624 231.257V399.116',
    'M215.293 231.257L298.981 399.116',
    // left side
    'M136.343 167.986L0.125231 99.8872',
    'M0.125231 149.934L136.343 183.883',
    'M136.343 231.257L0.125231 299.353',
    // right side
    'M262.818 168.03L399.125 99.8863',
    'M399.125 149.888L262.818 183.891',
    'M262.818 231.257L399.125 299.346'
  ];

  const viewBoxWidth = 399.25;
  const viewBoxHeight = 399.25;
  const centerX = 199.624;
  const centerY = 199.625;

  let beamTweens = [];
  let rebuildRaf = 0;
  const buildBeams = () => {
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
    svg.textContent = '';

    const tracks = [];
    beamTrackPaths.forEach((d) => {
      const sourcePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sourcePath.setAttribute('d', d);
      svg.append(sourcePath);

      const length = sourcePath.getTotalLength();
      if (length < 12) {
        sourcePath.remove();
        return;
      }

      const start = sourcePath.getPointAtLength(0);
      const end = sourcePath.getPointAtLength(length);
      sourcePath.remove();

      // Remove horizontal tracks; keep only perspective rays.
      if (Math.abs(end.y - start.y) <= 0.9) {
        return;
      }

      const distStart = Math.hypot(start.x - centerX, start.y - centerY);
      const distEnd = Math.hypot(end.x - centerX, end.y - centerY);
      const outer = distStart >= distEnd ? start : end;
      const inner = distStart >= distEnd ? end : start;

      const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainPath.setAttribute('class', 'developers-highlights__beam-path developers-highlights__beam-path--main');
      mainPath.setAttribute('d', `M${outer.x} ${outer.y}L${inner.x} ${inner.y}`);
      svg.append(mainPath);

      const ghostPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      ghostPath.setAttribute('class', 'developers-highlights__beam-path developers-highlights__beam-path--ghost');
      ghostPath.setAttribute('d', `M${outer.x} ${outer.y}L${inner.x} ${inner.y}`);
      svg.append(ghostPath);

      tracks.push({ mainPath, ghostPath });
    });

    return tracks;
  };

  const startAnimation = (tracks) => {
    beamTweens.forEach((tween) => tween.kill());
    beamTweens = tracks.flatMap(({ mainPath, ghostPath }, index) => {
      const length = Math.max(1, mainPath.getTotalLength());
      const segmentMain = Math.min(28, Math.max(10, length * 0.14));
      const segmentGhost = Math.min(44, Math.max(16, length * 0.22));
      const gap = length + 56;
      const startOffset = Math.max(0, length * 0.12);

      mainPath.setAttribute('stroke-dasharray', `${segmentMain} ${gap}`);
      ghostPath.setAttribute('stroke-dasharray', `${segmentGhost} ${gap}`);
      mainPath.setAttribute('stroke-dashoffset', `${startOffset}`);
      ghostPath.setAttribute('stroke-dashoffset', `${startOffset + 12}`);

      const duration = isMobileViewport() ? 2.35 : 2.0;
      const baseDelay = index * 0.05;

      return [
        gsap.to(mainPath, {
          attr: { 'stroke-dashoffset': -length },
          duration,
          ease: 'none',
          repeat: -1,
          delay: baseDelay
        }),
        gsap.to(ghostPath, {
          attr: { 'stroke-dashoffset': -length - 10 },
          duration,
          ease: 'none',
          repeat: -1,
          delay: baseDelay + 0.08
        })
      ];
    });
  };

  let tracks = buildBeams();
  startAnimation(tracks);
  let lastCenterWidth = center.clientWidth;
  let lastCenterHeight = center.clientHeight;

  const scheduleRebuild = () => {
    if (rebuildRaf) {
      cancelAnimationFrame(rebuildRaf);
    }
    rebuildRaf = requestAnimationFrame(() => {
      rebuildRaf = 0;
      const nextWidth = center.clientWidth;
      const nextHeight = center.clientHeight;

      if (nextWidth === lastCenterWidth && nextHeight === lastCenterHeight) {
        return;
      }

      lastCenterWidth = nextWidth;
      lastCenterHeight = nextHeight;
      tracks = buildBeams();
      startAnimation(tracks);
    });
  };

  const resizeObserver = new ResizeObserver(() => {
    scheduleRebuild();
  });
  resizeObserver.observe(center);

  const onRefresh = () => {
    scheduleRebuild();
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);

  const trigger = ScrollTrigger.create({
    trigger: center,
    start: 'top 85%',
    end: 'bottom 20%',
    onEnter: () => beamTweens.forEach((tween) => tween.play()),
    onEnterBack: () => beamTweens.forEach((tween) => tween.play()),
    onLeave: () => beamTweens.forEach((tween) => tween.pause()),
    onLeaveBack: () => beamTweens.forEach((tween) => tween.pause())
  });

  if (!trigger.isActive) {
    beamTweens.forEach((tween) => tween.pause());
  }

  return () => {
    trigger.kill();
    resizeObserver.disconnect();
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    if (rebuildRaf) {
      cancelAnimationFrame(rebuildRaf);
      rebuildRaf = 0;
    }
    beamTweens.forEach((tween) => tween.kill());
    beamTweens = [];
    layer?.remove();
  };
}

// Developers side bullets: sequential pulse in the same visual language as grid dots.
function initDevelopersHighlightDotsBlink() {
  const section = document.querySelector('.developers-section__highlights');
  const dots = Array.from(section?.querySelectorAll('.developers-highlight-card__dot') ?? []);

  if (!section || dots.length === 0 || prefersReducedMotion || isMobileViewport()) {
    return () => {};
  }

  gsap.set(dots, {
    transformOrigin: '50% 50%',
    autoAlpha: 0.82,
    scale: 1
  });

  const pulseTl = gsap.timeline({ repeat: -1, paused: true });

  dots.forEach((dot) => {
    pulseTl.to(dot, {
      autoAlpha: 1,
      scale: 1.22,
      duration: 0.26,
      ease: 'power2.out'
    }, '+=0.06');

    pulseTl.to(dot, {
      autoAlpha: 0.9,
      scale: 0.98,
      duration: 0.24,
      ease: 'power1.inOut'
    });

    pulseTl.to(dot, {
      autoAlpha: 0.82,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  });

  pulseTl.to({}, { duration: 0.34 });

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top 85%',
    end: 'bottom 20%',
    onEnter: () => pulseTl.play(),
    onEnterBack: () => pulseTl.play(),
    onLeave: () => pulseTl.pause(),
    onLeaveBack: () => pulseTl.pause()
  });

  if (trigger.isActive) {
    pulseTl.play();
  }

  return () => {
    trigger.kill();
    pulseTl.kill();
    gsap.set(dots, { clearProps: 'opacity,visibility,transform' });
  };
}

// Developers intro: cursor-driven glyph propagation on a 100x100 cell grid.
function initDevelopersIntroDissolveBurst() {
  // Interactive region must stay inside the white inner frame only.
  const frame = document.querySelector('.developers-section__intro-inner');
  if (!frame || prefersReducedMotion || frame.dataset.motionDissolveBound === '1') {
    return () => {};
  }
  frame.dataset.motionDissolveBound = '1';

  let layer = frame.querySelector('.developers-section__dissolve-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'developers-section__dissolve-layer';
    layer.setAttribute('aria-hidden', 'true');
    frame.append(layer);
  }

  const glyphChars = ['0', '1', '<', '>', '=', '-', '/'];
  const gridStep = 100;
  const gridOffset = 50;
  const switchHysteresis = isMobileViewport() ? 8 : 6;
  const glyphLocalLayout = (() => {
    const cols = 5;
    const rows = 4;
    const xStart = 14;
    const xStep = 18;
    const yStart = 20;
    const yStep = 20;
    return Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        x: xStart + col * xStep,
        y: yStart + row * yStep
      };
    });
  })();
  const glyphAccentIndexes = new Set([1, 4, 8, 12, 16, 19]);
  let ticker = 0;
  let isInViewport = false;
  let activeCellKey = '';
  let activeRevealTimeline = null;
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let pointerTargetX = Number.NaN;
  let pointerTargetY = Number.NaN;
  let pointerSmoothX = Number.NaN;
  let pointerSmoothY = Number.NaN;
  let pointerIsInside = false;
  let pointerRafId = 0;
  let gridCells = [];

  const pseudo = (value) => {
    const raw = Math.sin(value * 12.9898) * 43758.5453123;
    return raw - Math.floor(raw);
  };

  const hashKey = (text) => {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const clearParticles = () => {
    layer.querySelectorAll('.developers-section__dissolve-glyph--burst').forEach((node) => node.remove());
  };

  const clearGrid = () => {
    gridCells.forEach((cell) => {
      cell.glyphNodes.forEach((glyph) => glyph.remove());
    });
    gridCells = [];
    activeCellKey = '';
    activeRevealTimeline?.kill();
    activeRevealTimeline = null;
  };

  const buildCellKey = (x, y) => `${Math.round(x)}:${Math.round(y)}`;

  const createAxisPositions = (limit) => {
    const maxCenter = Math.max(gridOffset, limit - gridOffset);
    const positions = [];
    for (let value = gridOffset; value <= maxCenter + 0.5; value += gridStep) {
      positions.push(gsap.utils.clamp(gridOffset, maxCenter, value));
    }

    const last = positions[positions.length - 1];
    if (!Number.isFinite(last) || Math.abs(last - maxCenter) > 0.5) {
      positions.push(maxCenter);
    }

    return Array.from(new Set(positions.map((position) => Number(position.toFixed(3)))));
  };

  const getNearestCell = (x, y) => {
    if (!gridCells.length) {
      return null;
    }
    let nearest = gridCells[0];
    let minDistance = Math.hypot(nearest.x - x, nearest.y - y);
    for (let index = 1; index < gridCells.length; index += 1) {
      const cell = gridCells[index];
      const distance = Math.hypot(cell.x - x, cell.y - y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cell;
      }
    }
    return nearest;
  };

  const resolveRevealOrder = (dx, dy) => {
    const indexes = glyphLocalLayout.map((_, i) => i);
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || (dx === 0 && dy === 0)) {
      return indexes;
    }

    const byRowThenCol = (a, b) => {
      const ay = glyphLocalLayout[a].y;
      const by = glyphLocalLayout[b].y;
      if (ay !== by) {
        return ay - by;
      }
      return glyphLocalLayout[a].x - glyphLocalLayout[b].x;
    };

    const byColThenRow = (a, b) => {
      const ax = glyphLocalLayout[a].x;
      const bx = glyphLocalLayout[b].x;
      if (ax !== bx) {
        return ax - bx;
      }
      return glyphLocalLayout[a].y - glyphLocalLayout[b].y;
    };

    if (Math.abs(dx) >= Math.abs(dy)) {
      indexes.sort(byColThenRow);
      if (dx < 0) {
        indexes.reverse();
      }
      return indexes;
    }

    indexes.sort(byRowThenCol);
    if (dy < 0) {
      indexes.reverse();
    }
    return indexes;
  };

  const buildGrid = () => {
    clearGrid();
    const rect = frame.getBoundingClientRect();
    const xPositions = createAxisPositions(rect.width);
    const yPositions = createAxisPositions(rect.height);

    for (const cy of yPositions) {
      for (const cx of xPositions) {
        const key = buildCellKey(cx, cy);

        const glyphNodes = glyphLocalLayout.map((position, glyphIndex) => {
          const node = document.createElement('span');
          node.className = `developers-section__dissolve-glyph developers-section__dissolve-glyph--base${glyphAccentIndexes.has(glyphIndex) ? ' is-accent' : ''}`;
          node.textContent = glyphChars[(ticker + glyphIndex) % glyphChars.length];
          layer.append(node);
          gsap.set(node, {
            x: cx - 50 + position.x,
            y: cy - 50 + position.y,
            opacity: 0
          });
          return node;
        });

        const cell = {
          key,
          seed: hashKey(key),
          x: cx,
          y: cy,
          isActivated: false,
          charIndexes: glyphLocalLayout.map((_, glyphIndex) =>
            (hashKey(`${key}:${glyphIndex}`) + glyphIndex * 3) % glyphChars.length
          ),
          glyphNodes,
          glyphPositions: glyphLocalLayout.map((position) => ({
            x: cx - 50 + position.x,
            y: cy - 50 + position.y
          }))
        };

        cell.glyphNodes.forEach((glyph, glyphIndex) => {
          glyph.textContent = glyphChars[cell.charIndexes[glyphIndex]];
        });
        gridCells.push(cell);
      }
    }
    ticker += 1;
  };

  const burstAtCell = (cell, dx, dy) => {
    if (!cell) {
      return;
    }
    const dirLen = Math.hypot(dx, dy);
    const dirX = dirLen > 0.001 ? dx / dirLen : 0;
    const dirY = dirLen > 0.001 ? dy / dirLen : -1;
    const perpX = -dirY;
    const perpY = dirX;
    const glyphCount = 16;

    const glyphEntries = Array.from({ length: glyphCount }, (_, i) => {
      const sourceIndex = Math.floor(
        pseudo(cell.seed * 0.31 + ticker * 0.47 + i * 1.11) * cell.glyphPositions.length
      );
      const source = cell.glyphPositions[sourceIndex];
      const directionJitter = pseudo(cell.seed * 0.41 + i * 1.63 + ticker * 0.53) - 0.5;
      const sideOffset = (pseudo(cell.seed * 0.89 + i * 0.77 + ticker * 0.39) - 0.5) * 48;
      const nearDistance = 36 + pseudo(cell.seed * 0.52 + i * 0.93 + ticker * 0.45) * 28;
      const farDistance = 88 + pseudo(cell.seed * 0.73 + i * 1.29 + ticker * 0.59) * 74;
      const adjustedDirX = dirX + directionJitter * 0.24;
      const adjustedDirY = dirY + directionJitter * 0.24;
      const startX = source.x + (pseudo(cell.seed * 1.07 + i * 0.69 + ticker * 0.27) - 0.5) * 8;
      const startY = source.y + (pseudo(cell.seed * 0.97 + i * 0.57 + ticker * 0.33) - 0.5) * 8;
      const midX = startX + adjustedDirX * nearDistance + perpX * sideOffset * 0.35;
      const midY = startY + adjustedDirY * nearDistance + perpY * sideOffset * 0.35;
      const endX = startX + adjustedDirX * farDistance + perpX * sideOffset;
      const endY = startY + adjustedDirY * farDistance + perpY * sideOffset;
      const glyph = document.createElement('span');
      glyph.className = `developers-section__dissolve-glyph developers-section__dissolve-glyph--burst${i % 3 === 0 ? ' is-accent' : ''}`;
      glyph.textContent = glyphChars[(i + ticker) % glyphChars.length];
      layer.append(glyph);
      gsap.set(glyph, {
        x: startX,
        y: startY,
        opacity: 0
      });
      return { glyph, midX, midY, endX, endY };
    });
    const glyphs = glyphEntries.map((entry) => entry.glyph);
    ticker += 1;

    const tl = gsap.timeline({
      onComplete: () => {
        glyphs.forEach((item) => item.remove());
      }
    });

    tl.to(glyphs, {
      opacity: (_, el) => el.classList.contains('is-accent') ? 0.86 : 0.56,
      x: (i) => glyphEntries[i].midX,
      y: (i) => glyphEntries[i].midY,
      duration: 0.52,
      stagger: 0.022,
      ease: 'sine.out'
    }, '<');
    tl.to(glyphs, {
      opacity: 0,
      x: (i) => glyphEntries[i].endX,
      y: (i) => glyphEntries[i].endY,
      duration: 0.98,
      stagger: 0.022,
      ease: 'sine.inOut'
    }, '<+0.22');
  };

  const evolveCellChars = (cell, mutationRatio = 0.26) => {
    if (!cell) {
      return;
    }
    const nextTicker = ticker + 1;
    cell.charIndexes = cell.charIndexes.map((currentIndex, glyphIndex) => {
      const mutateScore = pseudo(cell.seed * 0.67 + nextTicker * 0.49 + glyphIndex * 1.37);
      if (mutateScore > mutationRatio) {
        return currentIndex;
      }
      const nextIndex = Math.floor(
        pseudo(cell.seed * 1.21 + nextTicker * 0.83 + glyphIndex * 2.17) * glyphChars.length
      );
      return nextIndex;
    });
  };

  const resetCellGlyphState = (cell) => {
    if (!cell) {
      return;
    }
    gsap.killTweensOf(cell.glyphNodes);
    cell.glyphNodes.forEach((glyph, index) => {
      glyph.textContent = glyphChars[cell.charIndexes[index]];
      gsap.set(glyph, {
        x: cell.glyphPositions[index].x,
        y: cell.glyphPositions[index].y + 2,
        opacity: 0
      });
    });
    ticker += 1;
  };

  const dissolveCell = (cell, dx, dy) => {
    if (!cell) {
      return;
    }
    burstAtCell(cell, dx, dy);
    const dissolveOrder = resolveRevealOrder(dx, dy).slice().reverse();
    const orderedGlyphs = dissolveOrder.map((index) => cell.glyphNodes[index]);
    gsap.to(orderedGlyphs, {
      opacity: 0,
      y: (index) => cell.glyphPositions[dissolveOrder[index]].y + 1.5,
      duration: 0.56,
      stagger: 0.02,
      ease: 'sine.inOut',
      overwrite: true
    });
  };

  const runPointerLoop = () => {
    if (!pointerIsInside || !isInViewport || !gridCells.length) {
      pointerRafId = 0;
      return;
    }
    if (!Number.isFinite(pointerTargetX) || !Number.isFinite(pointerTargetY)) {
      pointerRafId = requestAnimationFrame(runPointerLoop);
      return;
    }

    const lerpFactor = isMobileViewport() ? 0.2 : 0.24;
    if (!Number.isFinite(pointerSmoothX) || !Number.isFinite(pointerSmoothY)) {
      pointerSmoothX = pointerTargetX;
      pointerSmoothY = pointerTargetY;
    } else {
      pointerSmoothX += (pointerTargetX - pointerSmoothX) * lerpFactor;
      pointerSmoothY += (pointerTargetY - pointerSmoothY) * lerpFactor;
    }

    activateCellFromPoint(pointerSmoothX, pointerSmoothY);
    pointerRafId = requestAnimationFrame(runPointerLoop);
  };

  const revealCell = (cell, dx, dy) => {
    if (!cell) {
      return;
    }
    if (cell.isActivated) {
      evolveCellChars(cell, 0.28);
    }
    resetCellGlyphState(cell);
    activeRevealTimeline?.kill();

    const revealOrder = resolveRevealOrder(dx, dy);
    const orderedGlyphs = revealOrder.map((index) => cell.glyphNodes[index]);
    activeRevealTimeline = gsap.timeline();
    activeRevealTimeline.to(orderedGlyphs, {
      opacity: (_, element) => element.classList.contains('is-accent') ? 0.88 : 0.62,
      y: (index) => cell.glyphPositions[revealOrder[index]].y,
      duration: 0.62,
      stagger: 0.06,
      ease: 'power3.out'
    });
    cell.isActivated = true;
  };

  const activateCellFromPoint = (px, py) => {
    if (!isInViewport || !gridCells.length) {
      return;
    }
    const nextCell = getNearestCell(px, py);
    if (!nextCell) {
      return;
    }
    const nextKey = nextCell.key;
    if (nextKey === activeCellKey) {
      lastPointerX = px;
      lastPointerY = py;
      return;
    }

    const dx = Number.isFinite(lastPointerX) ? px - lastPointerX : 0;
    const dy = Number.isFinite(lastPointerY) ? py - lastPointerY : 0;
    const previousCell = activeCellKey ? gridCells.find((cell) => cell.key === activeCellKey) : null;
    if (previousCell) {
      const activeDistance = Math.hypot(previousCell.x - px, previousCell.y - py);
      const nextDistance = Math.hypot(nextCell.x - px, nextCell.y - py);
      if (activeDistance <= nextDistance + switchHysteresis) {
        lastPointerX = px;
        lastPointerY = py;
        return;
      }
    }

    if (previousCell) {
      dissolveCell(previousCell, dx, dy);
    }

    activeCellKey = nextKey;
    revealCell(nextCell, dx, dy);
    lastPointerX = px;
    lastPointerY = py;
  };

  const onPointerEnter = (event) => {
    const rect = frame.getBoundingClientRect();
    pointerIsInside = true;
    pointerTargetX = event.clientX - rect.left;
    pointerTargetY = event.clientY - rect.top;
    pointerSmoothX = pointerTargetX;
    pointerSmoothY = pointerTargetY;
    activateCellFromPoint(pointerTargetX, pointerTargetY);
    if (!pointerRafId) {
      pointerRafId = requestAnimationFrame(runPointerLoop);
    }
  };
  const onPointerMove = (event) => {
    const rect = frame.getBoundingClientRect();
    pointerTargetX = event.clientX - rect.left;
    pointerTargetY = event.clientY - rect.top;
    if (!pointerRafId && pointerIsInside) {
      pointerRafId = requestAnimationFrame(runPointerLoop);
    }
  };

  const onPointerLeave = () => {
    pointerIsInside = false;
    if (pointerRafId) {
      cancelAnimationFrame(pointerRafId);
      pointerRafId = 0;
    }
    const previousCell = activeCellKey ? gridCells.find((cell) => cell.key === activeCellKey) : null;
    if (previousCell) {
      dissolveCell(previousCell, lastPointerX - previousCell.x, lastPointerY - previousCell.y);
    }
    activeCellKey = '';
    lastPointerX = Number.NaN;
    lastPointerY = Number.NaN;
    pointerTargetX = Number.NaN;
    pointerTargetY = Number.NaN;
    pointerSmoothX = Number.NaN;
    pointerSmoothY = Number.NaN;
  };

  const onResize = () => {
    if (!isInViewport || !gridCells.length) {
      return;
    }
    activeCellKey = '';
    lastPointerX = Number.NaN;
    lastPointerY = Number.NaN;
    clearParticles();
    buildGrid();
  };

  const trigger = ScrollTrigger.create({
    trigger: frame,
    start: 'top 85%',
    end: 'bottom 20%',
    onEnter: () => {
      isInViewport = true;
      buildGrid();
    },
    onEnterBack: () => {
      isInViewport = true;
      buildGrid();
    },
    onLeave: () => {
      isInViewport = false;
      pointerIsInside = false;
      if (pointerRafId) {
        cancelAnimationFrame(pointerRafId);
        pointerRafId = 0;
      }
      activeCellKey = '';
      clearParticles();
      clearGrid();
    },
    onLeaveBack: () => {
      isInViewport = false;
      pointerIsInside = false;
      if (pointerRafId) {
        cancelAnimationFrame(pointerRafId);
        pointerRafId = 0;
      }
      activeCellKey = '';
      clearParticles();
      clearGrid();
    }
  });

  frame.addEventListener('pointerenter', onPointerEnter, { passive: true });
  frame.addEventListener('pointermove', onPointerMove, { passive: true });
  frame.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('resize', onResize);

  return () => {
    trigger.kill();
    pointerIsInside = false;
    if (pointerRafId) {
      cancelAnimationFrame(pointerRafId);
      pointerRafId = 0;
    }
    frame.removeEventListener('pointerenter', onPointerEnter);
    frame.removeEventListener('pointermove', onPointerMove);
    frame.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    clearParticles();
    clearGrid();
    layer?.remove();
    delete frame.dataset.motionDissolveBound;
  };
}

function prepareHeroIntroState() {
  if (!heroSection || heroSection.dataset.motionHeroPrepared === 'true') {
    return;
  }

  const motion = getMotion();
  const kicker = heroSection.querySelector('.hero-section__kicker');
  const title = heroSection.querySelector('.hero-section__title');
  const subtitle = heroSection.querySelector('.hero-section__lead');
  const leadWrap = heroSection.querySelector('.hero-section__lead-wrap');
  const ctaButtons = Array.from(heroSection.querySelectorAll('.hero-section__cta-row > *'));
  const primaryCta = ctaButtons[0];
  const secondaryCta = ctaButtons[1];
  const content = heroSection.querySelector('.hero-section__content');
  const visual = heroSection.querySelector('.hero-section__visual');
  const visualRevealYPercent = isMobileViewport() ? 8 : 10;
  let titleLines = [];

  if (title) {
    if (title.dataset.motionLinesReady !== 'true') {
      const rawLines = title.innerHTML
        .split(/<br\s*\/?>/gi)
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      if (rawLines.length > 1) {
        title.innerHTML = rawLines
          .map((line) => `<span class="hero-section__title-line">${line}</span>`)
          .join('');
      }

      title.dataset.motionLinesReady = 'true';
    }

    titleLines = Array.from(title.querySelectorAll('.hero-section__title-line'));
  }

  if (kicker) {
    gsap.set(kicker, { autoAlpha: 0, y: motion.distance * 0.5 });
  }
  if (titleLines.length) {
    gsap.set(titleLines, { autoAlpha: 0, y: motion.distance * 0.55 });
  } else if (title) {
    gsap.set(title, { autoAlpha: 0, y: motion.distance * 0.55 });
  }
  if (subtitle) {
    gsap.set(subtitle, { autoAlpha: 0, y: motion.distance * 0.65 });
  }
  if (leadWrap) {
    gsap.set(leadWrap, { autoAlpha: 1 });
  }
  if (primaryCta) {
    gsap.set(primaryCta, { autoAlpha: 0, y: motion.distance * 0.6 });
  }
  if (secondaryCta) {
    gsap.set(secondaryCta, { autoAlpha: 0, y: motion.distance * 0.6 });
  }
  if (content) {
    gsap.set(content, { scale: 0.995, transformOrigin: '50% 50%' });
  }
  if (visual) {
    gsap.set(visual, { autoAlpha: 0, yPercent: visualRevealYPercent });
  }

  heroSection.dataset.motionHeroPrepared = 'true';
}

// Hero intro stays timeline-driven so load order is intentional and premium.
function initHeroTimeline({ skipIntro = false } = {}) {
  if (!heroSection) {
    return;
  }
  if (heroSection.dataset.motionHeroInit === 'true') {
    return;
  }
  heroSection.dataset.motionHeroInit = 'true';

  const kicker = heroSection.querySelector('.hero-section__kicker');
  const title = heroSection.querySelector('.hero-section__title');
  const titleLines = Array.from(heroSection.querySelectorAll('.hero-section__title-line'));
  const subtitle = heroSection.querySelector('.hero-section__lead');
  const ctaButtons = Array.from(heroSection.querySelectorAll('.hero-section__cta-row > *'));
  const primaryCta = ctaButtons[0];
  const secondaryCta = ctaButtons[1];
  const content = heroSection.querySelector('.hero-section__content');
  const visual = heroSection.querySelector('.hero-section__visual');
  const visualRevealDuration = isMobileViewport() ? 0.56 : 0.64;

  if (!skipIntro) {
    const timeline = gsap.timeline({
      defaults: {
        duration: isMobileViewport() ? 0.48 : 0.56,
        ease: 'power3.out'
      }
    });

    if (visual) {
      timeline.to(
        visual,
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: visualRevealDuration,
          ease: 'power2.out'
        },
        0
      );
    }

    if (kicker) {
      timeline.to(
        kicker,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.44 : 0.48
        },
        0.02
      );
    }

    if (titleLines.length) {
      timeline.to(
        titleLines,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.5 : 0.58,
          stagger: isMobileViewport() ? 0.08 : 0.1
        },
        0.14
      );
    } else if (title) {
      timeline.to(
        title,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.5 : 0.58
        },
        0.14
      );
    }

    if (subtitle) {
      timeline.to(
        subtitle,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.46 : 0.52
        },
        0.58
      );
    }

    if (primaryCta) {
      timeline.to(
        primaryCta,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.44 : 0.5
        },
        0.74
      );
    }

    if (secondaryCta) {
      timeline.to(
        secondaryCta,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobileViewport() ? 0.44 : 0.5
        },
        0.86
      );
    }

    if (content) {
      timeline.to(
        content,
        {
          scale: 1,
          duration: isMobileViewport() ? 0.46 : 0.54,
          ease: 'power2.out'
        },
        0.1
      );
    }

  }

  // Mockup parallax disabled by request.
}

function initHeroMetricsCarousel() {
  const metricsWrap = heroSection?.querySelector('.hero-section__metrics-wrap');
  const sourceTrack = metricsWrap?.querySelector('.hero-section__metrics');

  if (
    !metricsWrap ||
    !sourceTrack ||
    prefersReducedMotion
  ) {
    return () => {};
  }

  const originalCards = Array.from(sourceTrack.children);

  if (originalCards.length === 0) {
    return () => {};
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
  let resizeTimeout = 0;
  let resizeObserver = null;
  let isHovered = false;
  let destroyed = false;
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
    if (destroyed) {
      return;
    }
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

  const handleMouseEnter = () => {
    if (destroyed) {
      return;
    }
    isHovered = true;
    setPlayback(0);
  };

  const handleMouseLeave = () => {
    if (destroyed) {
      return;
    }
    isHovered = false;
    setPlayback(1);
  };

  const handleResize = () => {
    if (destroyed) {
      return;
    }
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(applyMarqueeLayout);
    }, 96);
  };

  metricsWrap.addEventListener('mouseenter', handleMouseEnter);
  metricsWrap.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', handleResize, { passive: true });

  if (typeof window.ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(metricsWrap);
  }

  return () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    window.clearTimeout(resizeTimeout);
    cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', handleResize);
    metricsWrap.removeEventListener('mouseenter', handleMouseEnter);
    metricsWrap.removeEventListener('mouseleave', handleMouseLeave);
    tween?.kill();
    gsap.killTweensOf(playbackState);
  };
}

// Shared interactive motion for buttons and controls, including the BUILD scramble treatment.
function initInteractiveHoverStates() {
  if (prefersReducedMotion) {
    return () => {};
  }
  if (window[MOTION_HOVER_BIND_FLAG]) {
    return () => {};
  }
  window[MOTION_HOVER_BIND_FLAG] = true;
  const boundElements = [];

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

    scrambleStateMap.set(label, { tween });
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
    '.site-header-button-v1, .site-header-link-m2'
  );

  interactiveElements.forEach((element) => {
    if (element.dataset.motionHoverBound === '1') {
      return;
    }
    element.dataset.motionHoverBound = '1';

    const isBuildButton = element.classList.contains('site-header-link-m2');
    const isButtonV1 = element.classList.contains('site-header-button-v1');
    const buildLabel = isBuildButton ? element.querySelector('.site-header-link-m2__label') : null;
    const buttonV1Label = isButtonV1 ? element.querySelector('.site-header-button-v1__label') : null;
    const scrambleTarget = isBuildButton ? buildLabel : buttonV1Label;
    const originalScrambleText = scrambleTarget ? (scrambleTarget.textContent || '').trim() : '';
    const motion = getMotion();
    const scaleTo = gsap.quickTo(element, 'scale', {
      duration: motion.hoverDuration ?? 0.5,
      ease: motion.ease
    });
    const yTo = gsap.quickTo(element, 'y', {
      duration: motion.hoverDuration ?? 0.5,
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
      if (prefersReducedMotion) {
        return;
      }
      const nextMotion = getMotion();
      if ('disabled' in element && element.disabled) {
        return;
      }

      const targetScale = isBuildButton
        ? isMobileViewport()
          ? 1.008
          : 1.012
        : (nextMotion.buttonScale ?? 1);
      const targetY = 0;

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
    boundElements.push({ element, pointerEnter, pointerLeave });
  });

  return () => {
    boundElements.forEach(({ element, pointerEnter, pointerLeave }) => {
      element.removeEventListener('mouseenter', pointerEnter);
      element.removeEventListener('mouseleave', pointerLeave);
      delete element.dataset.motionHoverBound;
    });
    window[MOTION_HOVER_BIND_FLAG] = false;
  };
}

function initCustomCursor() {
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (hasCoarsePointer || !document.body || window[MOTION_CURSOR_BIND_FLAG]) {
    return () => {};
  }
  window[MOTION_CURSOR_BIND_FLAG] = true;

  const cursor = document.createElement('span');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const ringA = document.createElement('span');
  ringA.className = 'site-cursor__ring';
  ringA.setAttribute('aria-hidden', 'true');
  const ringB = document.createElement('span');
  ringB.className = 'site-cursor__ring';
  ringB.setAttribute('aria-hidden', 'true');
  cursor.append(ringA, ringB);
  document.body.append(cursor);
  document.body.classList.add('has-custom-cursor');

  gsap.set(cursor, {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    xPercent: -50,
    yPercent: -50,
    width: 16,
    height: 16,
    opacity: 1,
    visibility: 'visible',
    scale: 1
  });

  const xTo = gsap.quickTo(cursor, 'x', {
    duration: 0.16,
    ease: 'power3.out'
  });
  const yTo = gsap.quickTo(cursor, 'y', {
    duration: 0.16,
    ease: 'power3.out'
  });
  const widthTo = gsap.quickTo(cursor, 'width', {
    duration: 0.18,
    ease: 'power3.out'
  });
  const heightTo = gsap.quickTo(cursor, 'height', {
    duration: 0.18,
    ease: 'power3.out'
  });
  const alphaTo = gsap.quickTo(cursor, 'opacity', {
    duration: 0.2,
    ease: 'power2.out'
  });

  const createRingPulse = (ring, delay = 0) =>
    gsap
      .timeline({ repeat: -1, delay })
      .fromTo(
        ring,
        { scale: 1, opacity: 0.58 },
        {
          scale: 2.05,
          opacity: 0,
          duration: 2.4,
          ease: 'power2.out'
        }
      )
      .to(ring, {
        scale: 1,
        opacity: 0,
        duration: 0.01,
        ease: 'none'
      });

  const ringPulseA = createRingPulse(ringA, 0);
  const ringPulseB = createRingPulse(ringB, 1.2);

  const corePulse = gsap.timeline({ repeat: -1 });
  corePulse.to(cursor, {
    scale: 1.04,
    duration: 0.32,
    ease: 'power2.out'
  });
  corePulse.to(cursor, {
    scale: 1,
    duration: 0.44,
    ease: 'power1.inOut'
  });
  corePulse.to({}, { duration: 0.26 });

  const move = (event) => {
    const x = event.clientX ?? 0;
    const y = event.clientY ?? 0;
    xTo(x);
    yTo(y);
    alphaTo(1);
  };

  const onPress = () => {
    ringPulseA.pause();
    ringPulseB.pause();
    widthTo(12);
    heightTo(12);
  };

  const onRelease = () => {
    widthTo(16);
    heightTo(16);
    ringPulseA.play();
    ringPulseB.play();
  };

  const onPointerLeave = () => alphaTo(0);
  const onWindowBlur = () => alphaTo(0);
  const onPointerEnter = (event) => {
    move(event);
    alphaTo(1);
  };

  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', onPress, { passive: true });
  window.addEventListener('pointerup', onRelease, { passive: true });
  window.addEventListener('pointercancel', onRelease, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onWindowBlur, { passive: true });

  // Ensure cursor is visible even before first movement after tab focus.
  window.addEventListener('pointerenter', onPointerEnter, { passive: true });

  return () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', onPress);
    window.removeEventListener('pointerup', onRelease);
    window.removeEventListener('pointercancel', onRelease);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onWindowBlur);
    window.removeEventListener('pointerenter', onPointerEnter);
    ringPulseA.kill();
    ringPulseB.kill();
    corePulse.kill();
    cursor.remove();
    document.body.classList.remove('has-custom-cursor', 'is-hero-laser-cursor');
    window[MOTION_CURSOR_BIND_FLAG] = false;
  };
}

// One base motion system for the whole page.
async function initMotionSystem() {
  if (window[MOTION_BOOT_FLAG]) {
    return;
  }
  window[MOTION_BOOT_FLAG] = true;

  if (prefersReducedMotion) {
    await runInitialPreloader(null);
    mapRevealUtilities();
    setReducedMotionState();
    registerMotionCleanup(initNavbarMotion(null));
    initHowLayerStackReveal({ reduced: true });
    return;
  }

  ScrollTrigger.config({
    ignoreMobileResize: true
  });

  const lenisRuntime = initLenis();
  const lenis = lenisRuntime?.lenis ?? null;
  registerMotionCleanup(lenisRuntime?.destroy);
  prepareHeroIntroState();
  await runInitialPreloader(lenis);
  initHeroTimeline();
  mapRevealUtilities();
  initSolutionHeadlineMotion();
  initSolutionCardsMotion();
  initSolutionSummaryMotion();
  initHowV2StatsReveal();
  initHowV2PipelineChevronFlow();
  registerMotionCleanup(initOperationsChevronFlow());
  initSecurityMetricCounter();
  registerMotionCleanup(initNavbarMotion(lenis));
  const destroyHeroMetricsCarousel = initHeroMetricsCarousel();
  registerMotionCleanup(destroyHeroMetricsCarousel);
  createRevealSystem();
  initSectionLabelChevronMotion();
  initSystemNodeApgImpulseFlow();
  initHowLayerStackReveal();
  initHowSystemNodeEllipsesFlow();
  registerMotionCleanup(initHeroGridLaserHover());
  registerMotionCleanup(initHowV2GridLaserHover());
  registerMotionCleanup(initPricingGridLaserHover());
  registerMotionCleanup(initDevelopersPerspectiveBeams());
  registerMotionCleanup(initDevelopersIntroDissolveBurst());
  // Developers side red dots should stay static (no pulse animation).
  registerMotionCleanup(initInteractiveHoverStates());
  registerMotionCleanup(initCustomCursor());
  window.addEventListener('pagehide', destroyHeroMetricsCarousel, { once: true });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  ScrollTrigger.refresh();
}

initMotionSystem();
