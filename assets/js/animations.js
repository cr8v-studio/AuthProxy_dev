import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/ScrollTrigger/+esm';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/+esm';

// Base motion stack: GSAP + ScrollTrigger + Lenis.
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileViewport = window.matchMedia('(max-width: 767px)');
const isMobileViewport = () => mobileViewport.matches;
const MOTION_BOOT_FLAG = '__apMotionBooted';
const rootStyles = getComputedStyle(document.documentElement);
const accentAlertRgbToken = rootStyles.getPropertyValue('--figma-color-extra-2-rgb').trim();
const ACCENT_ALERT_RGB = accentAlertRgbToken || '237 88 90';
const accentAlert = (alpha) => `rgb(${ACCENT_ALERT_RGB} / ${alpha})`;

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
  ['.how-section__title-row, .how-section__intro', 'fade-up'],
  ['.how-v2__intro > *', 'fade-up'],
  ['.how-step-card', 'fade-up'],
  ['.how-section__visual', 'scale-in'],
  ['#auth .auth-section__intro', 'fade-up'],
  ['#auth .auth-acc__group', 'fade-up'],
  ['#auth .auth-section__technical', 'fade-up'],
  ['#auth .auth-detail-card', 'fade-up']
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
      const isHeaderLogo = link.classList.contains('site-header-logo');
      const scrollTarget = isHeaderLogo ? 0 : target;
      const scrollDuration = isHeaderLogo
        ? (isMobileViewport() ? 1.15 : 1.45)
        : (isMobileViewport() ? 0.9 : 1.05);
      const scrollEasing = isHeaderLogo
        ? (value) => 1 - Math.pow(1 - value, 4)
        : (value) => 1 - Math.pow(1 - value, 3);
      lenis.scrollTo(scrollTarget, {
        offset: isHeaderLogo ? 0 : -24,
        duration: scrollDuration,
        easing: scrollEasing
      });

      if (isHeaderLogo && window.location.hash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    });
  });

  return lenis;
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

// Prevent double-thick seam between Solution bottom and the next section.
function normalizeSolutionToAuthSeam() {
  const solutionBottom = document.querySelector('.solution-section .solution-section__bottom');
  const authLabelBar = document.querySelector('#auth .section-label-bar');

  if (!solutionBottom || !authLabelBar) {
    return;
  }

  solutionBottom.style.borderBottom = '0';
  authLabelBar.style.borderTop = '1px solid var(--site-section-border)';
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

function initSystemNodeBDataFlow() {
  const flowWrap = document.querySelector('.system-node-b-flow');
  const lights = gsap.utils.toArray('.system-node-b-flow__light');

  if (!flowWrap || lights.length === 0 || prefersReducedMotion) {
    return;
  }

  gsap.set(lights, {
    autoAlpha: 1,
    scale: 1,
    transformOrigin: '50% 50%',
    backgroundColor: accentAlert(0),
    borderColor: '#1f1f1f'
  });

  const flowTimeline = gsap.timeline({
    paused: true,
    repeat: -1,
    defaults: { ease: 'power2.out' }
  });

  lights.forEach((light, index) => {
    const startAt = index * 0.2;

    flowTimeline.to(
      light,
      {
        scale: 0.9,
        backgroundColor: accentAlert(1),
        boxShadow: 'none',
        duration: 0.2
      },
      startAt
    );

    flowTimeline.to(
      light,
      {
        scale: 1,
        backgroundColor: accentAlert(0),
        boxShadow: 'none',
        duration: 0.34,
        ease: 'power1.inOut'
      },
      startAt + 0.16
    );
  });

  flowTimeline.to({}, { duration: 0.22 });

  ScrollTrigger.create({
    trigger: flowWrap,
    start: 'top 90%',
    end: 'bottom 10%',
    onEnter: () => flowTimeline.play(),
    onEnterBack: () => flowTimeline.play(),
    onLeave: () => flowTimeline.pause(),
    onLeaveBack: () => flowTimeline.pause()
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
        tweens.forEach((tween) => tween.play());
      },
      onEnterBack: () => {
        tweens.forEach((tween) => tween.play());
      },
      onLeave: () => {
        tweens.forEach((tween) => tween.pause());
      },
      onLeaveBack: () => {
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
      onEnter: () => timeline.play(),
      onEnterBack: () => timeline.play(),
      onLeave: () => timeline.pause(),
      onLeaveBack: () => timeline.pause()
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

function initProblemGridImpulseFlow() {
  const wrap = document.querySelector('.problem-grid__impulse');
  const dot = wrap?.querySelector('.problem-grid__impulse-dot');
  const nodes = wrap ? gsap.utils.toArray('.problem-grid__impulse-node', wrap) : [];

  if (!wrap || !dot || nodes.length === 0 || prefersReducedMotion) {
    return;
  }

  const nodeById = (id) => wrap.querySelector(`.problem-grid__impulse-node--${id}`);
  const points = [
    { x: 95, y: 96, node: 1 },
    { x: 191, y: 96 },
    { x: 191, y: 192 },
    { x: 383, y: 192, node: 2 },
    { x: 383, y: 288, node: 3 },
    { x: 287, y: 288 },
    { x: 287, y: 384, node: 4 }
  ];
  const segmentDuration = isMobileViewport() ? 0.36 : 0.42;

  gsap.set(dot, { x: 0, y: 0, autoAlpha: 0 });
  gsap.set(nodes, { autoAlpha: 0, scale: 0.72 });

  const pulseNode = (timeline, nodeId, at) => {
    const node = nodeById(nodeId);

    if (!node) {
      return;
    }

    timeline.to(
      node,
      {
        autoAlpha: 1,
        scale: 1.18,
        boxShadow: `0 0 10px ${accentAlert(0.56)}, 0 0 18px ${accentAlert(0.32)}`,
        duration: 0.14,
        ease: 'power2.out'
      },
      at
    );
    timeline.to(
      node,
      {
        autoAlpha: 0,
        scale: 0.85,
        boxShadow: `0 0 0 ${accentAlert(0)}`,
        duration: 0.22,
        ease: 'power1.inOut'
      },
      at + 0.14
    );
  };

  const timeline = gsap.timeline({ paused: true, repeat: -1 });
  timeline.set(dot, { x: points[0].x, y: points[0].y, autoAlpha: 1 }, 0);
  pulseNode(timeline, 1, 0);

  let currentTime = 0.05;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    timeline.to(
      dot,
      {
        x: point.x,
        y: point.y,
        duration: segmentDuration,
        ease: 'none'
      },
      currentTime
    );

    if (point.node) {
      pulseNode(timeline, point.node, currentTime + 0.08);
    }

    currentTime += segmentDuration;
  }

  timeline.to(dot, { autoAlpha: 0, duration: 0.12, ease: 'power1.out' }, currentTime + 0.02);
  timeline.to({}, { duration: isMobileViewport() ? 0.38 : 0.5 }, currentTime + 0.16);

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top 88%',
    end: 'bottom 12%',
    onEnter: () => timeline.play(),
    onEnterBack: () => timeline.play(),
    onLeave: () => timeline.pause(),
    onLeaveBack: () => timeline.pause()
  });
}

function initHeroGridImpulseFlow() {
  const wrap = document.querySelector('.hero-section__impulse');
  const dot = wrap?.querySelector('.hero-section__impulse-dot');
  const nodes = wrap ? gsap.utils.toArray('.hero-section__impulse-node', wrap) : [];

  if (!wrap || !dot || nodes.length === 0 || prefersReducedMotion) {
    return;
  }

  const nodeById = (id) => wrap.querySelector(`.hero-section__impulse-node--${id}`);
  const points = [
    { x: 95, y: 96, node: 1 },
    { x: 191, y: 96 },
    { x: 191, y: 192 },
    { x: 287, y: 192 },
    { x: 287, y: 96, node: 2 },
    { x: 287, y: 192 },
    { x: 383, y: 192, node: 3 },
    { x: 383, y: 288, node: 4 },
    { x: 287, y: 288 },
    { x: 191, y: 288 },
    { x: 191, y: 384 },
    { x: 95, y: 384, node: 5 }
  ];
  const segmentDuration = isMobileViewport() ? 0.34 : 0.4;

  gsap.set(dot, { x: 0, y: 0, autoAlpha: 0 });
  gsap.set(nodes, { autoAlpha: 0, scale: 0.72 });

  const pulseNode = (timeline, nodeId, at) => {
    const node = nodeById(nodeId);

    if (!node) {
      return;
    }

    timeline.to(
      node,
      {
        autoAlpha: 1,
        scale: 1.18,
        boxShadow: `0 0 10px ${accentAlert(0.56)}, 0 0 18px ${accentAlert(0.32)}`,
        duration: 0.14,
        ease: 'power2.out'
      },
      at
    );
    timeline.to(
      node,
      {
        autoAlpha: 0,
        scale: 0.85,
        boxShadow: `0 0 0 ${accentAlert(0)}`,
        duration: 0.22,
        ease: 'power1.inOut'
      },
      at + 0.14
    );
  };

  const timeline = gsap.timeline({ paused: true, repeat: -1 });
  timeline.set(dot, { x: points[0].x, y: points[0].y, autoAlpha: 1 }, 0);
  pulseNode(timeline, 1, 0);

  let currentTime = 0.05;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    timeline.to(
      dot,
      {
        x: point.x,
        y: point.y,
        duration: segmentDuration,
        ease: 'none'
      },
      currentTime
    );

    if (point.node) {
      pulseNode(timeline, point.node, currentTime + 0.08);
    }

    currentTime += segmentDuration;
  }

  timeline.to(dot, { autoAlpha: 0, duration: 0.12, ease: 'power1.out' }, currentTime + 0.02);
  timeline.to({}, { duration: isMobileViewport() ? 0.34 : 0.46 }, currentTime + 0.16);

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top 92%',
    end: 'bottom 8%',
    onEnter: () => timeline.play(),
    onEnterBack: () => timeline.play(),
    onLeave: () => timeline.pause(),
    onLeaveBack: () => timeline.pause()
  });
}

// Pointer-driven dual cross-lines with delayed ghost trail (Figma node 476:11902).
function initHeroGridLaserHover() {
  const panel = document.querySelector('.hero-section__panel');
  const grid = panel?.querySelector('.hero-section__grid-bg');
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (!panel || !grid || prefersReducedMotion || hasCoarsePointer) {
    return;
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
    vGhost.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--v hero-section__grid-laser-line--ghost';
    const hGhost = document.createElement('span');
    hGhost.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--h hero-section__grid-laser-line--ghost';

    const dot = document.createElement('span');
    dot.className = 'hero-section__grid-laser-dot';

    overlay.append(vGhost, hGhost, vMain, hMain, dot);
    grid.append(overlay);
  }

  const vMain = overlay.querySelector('.hero-section__grid-laser-line--v:not(.hero-section__grid-laser-line--ghost)');
  const hMain = overlay.querySelector('.hero-section__grid-laser-line--h:not(.hero-section__grid-laser-line--ghost)');
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
}

// Reuse Hero laser-grid interaction for Solution grid (same motion language).
function initSolutionGridLaserHover() {
  const panel = document.querySelector('.solution-section__visual');
  const grid = panel?.querySelector('.solution-section__visual-grid');
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (!panel || !grid || prefersReducedMotion || hasCoarsePointer) {
    return;
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
    vGhost.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--v hero-section__grid-laser-line--ghost';
    const hGhost = document.createElement('span');
    hGhost.className = 'hero-section__grid-laser-line hero-section__grid-laser-line--h hero-section__grid-laser-line--ghost';

    const dot = document.createElement('span');
    dot.className = 'hero-section__grid-laser-dot';

    overlay.append(vGhost, hGhost, vMain, hMain, dot);
    grid.append(overlay);
  }

  const vMain = overlay.querySelector('.hero-section__grid-laser-line--v:not(.hero-section__grid-laser-line--ghost)');
  const hMain = overlay.querySelector('.hero-section__grid-laser-line--h:not(.hero-section__grid-laser-line--ghost)');
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
}

function prepareHeroIntroState() {
  if (!heroSection || heroSection.dataset.motionHeroPrepared === 'true') {
    return;
  }

  const motion = getMotion();
  const subtitle = heroSection.querySelector('.hero-section__lead');
  const ctaButtons = Array.from(heroSection.querySelectorAll('.hero-section__cta-row > *'));
  const primaryCta = ctaButtons[0];
  const secondaryCta = ctaButtons[1];
  const visual = heroSection.querySelector('.hero-section__visual');
  const visualRevealYPercent = isMobileViewport() ? 8 : 10;

  if (subtitle) {
    gsap.set(subtitle, { autoAlpha: 0, y: motion.distance * 0.65 });
  }
  if (primaryCta) {
    gsap.set(primaryCta, { autoAlpha: 0, y: motion.distance * 0.6 });
  }
  if (secondaryCta) {
    gsap.set(secondaryCta, { autoAlpha: 0, y: motion.distance * 0.6 });
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

  const subtitle = heroSection.querySelector('.hero-section__lead');
  const ctaButtons = Array.from(heroSection.querySelectorAll('.hero-section__cta-row > *'));
  const primaryCta = ctaButtons[0];
  const secondaryCta = ctaButtons[1];
  const visual = heroSection.querySelector('.hero-section__visual');
  const visualRevealDuration = isMobileViewport() ? 0.56 : 0.64;

  if (!skipIntro) {
    const heroIntroDuration = isMobileViewport() ? 0.46 : 0.54;
    const timelineOffsets = isMobileViewport()
      ? { subtitle: 0.2, primary: 0.34, secondary: 0.46 }
      : { subtitle: 0.24, primary: 0.4, secondary: 0.54 };
    const timeline = gsap.timeline({
      defaults: {
        duration: heroIntroDuration,
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

    if (subtitle) {
      timeline.to(
        subtitle,
        {
          autoAlpha: 1,
          y: 0
        },
        timelineOffsets.subtitle
      );
    }

    if (primaryCta) {
      timeline.to(
        primaryCta,
        {
          autoAlpha: 1,
          y: 0
        },
        timelineOffsets.primary
      );
    }

    if (secondaryCta) {
      timeline.to(
        secondaryCta,
        {
          autoAlpha: 1,
          y: 0
        },
        timelineOffsets.secondary
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
    cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(applyMarqueeLayout);
  };

  metricsWrap.addEventListener('mouseenter', handleMouseEnter);
  metricsWrap.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cancelAnimationFrame(resizeFrame);
    window.removeEventListener('resize', handleResize);
    metricsWrap.removeEventListener('mouseenter', handleMouseEnter);
    metricsWrap.removeEventListener('mouseleave', handleMouseLeave);
    tween?.kill();
    gsap.killTweensOf(playbackState);
  };
}

function initAuthAccordionMotion({ reduced = false } = {}) {
  const groups = gsap.utils.toArray('.auth-acc__group');

  if (!groups.length) {
    return;
  }

  const itemState = groups
    .map((group) => {
      const header = group.querySelector('.auth-acc__header');
      const table = group.querySelector('.auth-acc__table');
      const chevron = group.querySelector('.auth-acc__chevron');
      const title = group.querySelector('.auth-acc__title');
      const topCorner = group.querySelector('.auth-acc__icon-corner--tr');
      const bottomCorner = group.querySelector('.auth-acc__icon-corner--bl');
      const revealItems = table
        ? gsap.utils.toArray('.auth-acc__head, .auth-acc__row', table)
        : [];

      if (!header || !table || !chevron || !title) {
        return null;
      }

      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      const contentId = table.id || `auth-acc-panel-${Math.random().toString(36).slice(2, 8)}`;
      table.id = contentId;
      header.setAttribute('aria-controls', contentId);

      return {
        group,
        header,
        table,
        chevron,
        title,
        titleText: (title.textContent || '').trim(),
        topCorner,
        bottomCorner,
        revealItems
      };
    })
    .filter(Boolean);

  if (!itemState.length) {
    return;
  }

  const scrambleStateMap = new WeakMap();
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomScrambleChar = () =>
    scrambleChars[Math.floor(Math.random() * scrambleChars.length)];

  const playHeaderScramble = (label, finalText) => {
    if (!label || !finalText || reduced) {
      return;
    }

    const previousState = scrambleStateMap.get(label);
    if (previousState?.tween) {
      previousState.tween.kill();
    }

    const state = { progress: 0 };
    const revealDelay = 0.08;
    const totalFrames = Math.max(1, finalText.length);

    const renderFrame = () => {
      const normalized = gsap.utils.clamp(0, 1, state.progress);
      const revealProgress =
        normalized <= revealDelay ? 0 : (normalized - revealDelay) / (1 - revealDelay);
      const revealCount = Math.floor(revealProgress * totalFrames);

      label.textContent = finalText
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

  const setOpenState = (item, isOpen) => {
    item.group.classList.toggle('is-open', isOpen);
    item.header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (reduced) {
      item.table.hidden = !isOpen;
      item.table.style.height = '';
      item.table.style.opacity = '';
      gsap.set(item.chevron, { rotate: isOpen ? 180 : 0 });
      return;
    }

    gsap.killTweensOf(item.chevron);
    gsap.to(item.chevron, {
      rotate: isOpen ? 180 : 0,
      duration: 0.46,
      ease: 'power3.out',
      overwrite: true
    });
  };

  const animateOpen = (item) => {
    if (reduced) {
      item.table.hidden = false;
      setOpenState(item, true);
      return;
    }

    item.table.hidden = false;
    gsap.killTweensOf(item.table);
    gsap.set(item.table, { height: item.table.offsetHeight, opacity: 1 });

    const targetHeight = item.table.scrollHeight;
    gsap.to(item.table, {
      height: targetHeight,
      opacity: 1,
      duration: isMobileViewport() ? 0.44 : 0.52,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => {
        item.table.style.height = 'auto';
      }
    });

    if (item.revealItems.length) {
      gsap.fromTo(
        item.revealItems,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.05,
          overwrite: true
        }
      );
    }
  };

  const animateClose = (item) => {
    if (reduced) {
      item.table.hidden = true;
      setOpenState(item, false);
      return;
    }

    gsap.killTweensOf(item.table);
    gsap.set(item.table, { height: item.table.scrollHeight, opacity: 1 });
    gsap.to(item.table, {
      height: 0,
      opacity: 0,
      duration: isMobileViewport() ? 0.36 : 0.44,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => {
        item.table.hidden = true;
        item.table.style.height = '';
      }
    });
  };

  const closeItem = (item) => {
    setOpenState(item, false);
    animateClose(item);
  };

  const openItem = (nextItem) => {
    itemState.forEach((item) => {
      if (item === nextItem) {
        return;
      }
      closeItem(item);
    });

    setOpenState(nextItem, true);
    animateOpen(nextItem);
  };

  itemState.forEach((item, index) => {
    const isInitiallyOpen = item.group.classList.contains('is-open');
    item.group.classList.toggle('is-open', isInitiallyOpen);
    item.header.setAttribute('aria-expanded', isInitiallyOpen ? 'true' : 'false');
    gsap.set(item.chevron, { rotate: isInitiallyOpen ? 180 : 0 });
    item.table.hidden = !isInitiallyOpen;
    if (!isInitiallyOpen && !reduced) {
      gsap.set(item.table, { height: 0, opacity: 0 });
    } else if (!reduced) {
      gsap.set(item.table, { height: 'auto', opacity: 1 });
    }

    item.header.addEventListener('click', () => {
      const isOpen = item.header.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeItem(item);
        return;
      }
      openItem(item);
    });

    item.header.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      const isOpen = item.header.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeItem(item);
        return;
      }
      openItem(item);
    });

    if (!reduced) {
      gsap.set(item.chevron, {
        transformOrigin: '50% 50%',
        willChange: 'transform'
      });

      const trX = item.topCorner
        ? gsap.quickTo(item.topCorner, 'x', { duration: 0.42, ease: 'power3.out' })
        : null;
      const trY = item.topCorner
        ? gsap.quickTo(item.topCorner, 'y', { duration: 0.42, ease: 'power3.out' })
        : null;
      const blX = item.bottomCorner
        ? gsap.quickTo(item.bottomCorner, 'x', { duration: 0.42, ease: 'power3.out' })
        : null;
      const blY = item.bottomCorner
        ? gsap.quickTo(item.bottomCorner, 'y', { duration: 0.42, ease: 'power3.out' })
        : null;

      const onEnter = () => {
        trX?.(3);
        trY?.(-3);
        blX?.(-3);
        blY?.(3);
        const isOpen = item.header.getAttribute('aria-expanded') === 'true';
        if (!isOpen) {
          playHeaderScramble(item.title, item.titleText);
        } else {
          item.title.textContent = item.titleText;
        }

        gsap.to(item.chevron, {
          rotate: 180,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: true
        });
      };

      const onLeave = () => {
        trX?.(0);
        trY?.(0);
        blX?.(0);
        blY?.(0);

        const isOpen = item.header.getAttribute('aria-expanded') === 'true';
        gsap.to(item.chevron, {
          rotate: isOpen ? 180 : 0,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: true
        });
      };

      item.header.addEventListener('mouseenter', onEnter);
      item.header.addEventListener('mouseleave', onLeave);
    }
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
    '.site-header-button-v1, .site-header-link-m2, .site-header-dropdown'
  );

  interactiveElements.forEach((element) => {
    const isBuildButton = element.classList.contains('site-header-link-m2');
    const isButtonV1 = element.classList.contains('site-header-button-v1');
    const isDropdownTrigger = element.classList.contains('site-header-dropdown');
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
      const nextMotion = getMotion();
      if ('disabled' in element && element.disabled) {
        return;
      }

      const targetScale = isBuildButton
        ? isMobileViewport()
          ? 1.008
          : 1.012
        : isDropdownTrigger
          ? 1
          : (nextMotion.buttonScale ?? 1);
      const targetY = isBuildButton || isButtonV1
        ? 0
        : isDropdownTrigger
          ? 0
          : 0;

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

function initCustomCursor() {
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (hasCoarsePointer || !document.body) {
    return;
  }

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

  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', onPress, { passive: true });
  window.addEventListener('pointerup', onRelease, { passive: true });
  window.addEventListener('pointercancel', onRelease, { passive: true });
  window.addEventListener('pointerleave', () => alphaTo(0), { passive: true });
  window.addEventListener('blur', () => alphaTo(0), { passive: true });

  // Ensure cursor is visible even before first movement after tab focus.
  window.addEventListener(
    'pointerenter',
    (event) => {
      move(event);
      alphaTo(1);
    },
    { passive: true }
  );
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
    initNavbarMotion(null);
    initHowLayerStackReveal({ reduced: true });
    initAuthAccordionMotion({ reduced: true });
    initCustomCursor();
    return;
  }

  ScrollTrigger.config({
    ignoreMobileResize: true
  });

  const lenis = initLenis();
  prepareHeroIntroState();
  await runInitialPreloader(lenis);
  initHeroTimeline();
  mapRevealUtilities();
  normalizeSolutionToAuthSeam();
  initSolutionHeadlineMotion();
  initSolutionCardsMotion();
  initSolutionSummaryMotion();
  initNavbarMotion(lenis);
  const destroyHeroMetricsCarousel = initHeroMetricsCarousel();
  createRevealSystem();
  initSectionLabelChevronMotion();
  initSystemNodeApgImpulseFlow();
  initHowLayerStackReveal();
  initHowSystemNodeEllipsesFlow();
  initHeroGridLaserHover();
  initSolutionGridLaserHover();
  initAuthAccordionMotion();
  initInteractiveHoverStates();
  initCustomCursor();
  window.addEventListener('pagehide', destroyHeroMetricsCarousel, { once: true });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  ScrollTrigger.refresh();
}

initMotionSystem();
