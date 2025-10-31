/**
 * Author: OpenAI ChatGPT · Fecha: 2025-02-14
 * Defaults → mainThreshold: 32, smallThreshold: 8, graceWindowMs: 300, tocScrollLockMs: 200
 */
(() => {
  const DEBUG = false;
  const mainThreshold = 32;
  const smallThreshold = 8;
  const graceWindowMs = 300;
  const tocScrollLockMs = 200;
  const transitionDebounceMs = 120;

  const doc = document;
  const toc = doc.getElementById('toc');
  const toggle = doc.getElementById('toc-toggle');
  const tocList = doc.getElementById('toc-list');

  if (!toc || !toggle || !tocList) {
    console.warn('TOC: missing element');
    return;
  }

  const collapseClass = 'toc-collapsed';
  const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const raf = typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (cb) => window.setTimeout(cb, 16);

  const autoCollapseEnabled = toc.getAttribute('data-toc-collapsible') !== 'false';
  const defaultWidth = toc.getAttribute('data-toc-default-width');
  const collapsedWidth = toc.getAttribute('data-toc-collapsed-width');

  if (defaultWidth) {
    toc.style.setProperty('--toc-default-width', defaultWidth);
  }
  if (collapsedWidth) {
    toc.style.setProperty('--toc-collapsed-width', collapsedWidth);
  }

  const subRegistry = new Map();
  const subLists = Array.from(toc.querySelectorAll('.toc-sub'));
  const subToggles = Array.from(toc.querySelectorAll('.toc-sub-toggle'));

  const disableSubList = (sub) => {
    try {
      sub.style.setProperty('display', 'none', 'important');
    } catch (error) {
      sub.style.display = 'none';
    }
  };

  const enableSubList = (sub) => {
    try {
      sub.style.setProperty('display', 'block', 'important');
    } catch (error) {
      sub.style.display = 'block';
    }
  };

  subLists.forEach(disableSubList);

  const startGracePeriod = () => {
    lastInteractionTs = now();
  };

  subToggles.forEach((btn) => {
    const subId = btn.getAttribute('aria-controls');
    const sub = subId ? doc.getElementById(subId) : null;
    if (!sub) {
      return;
    }

    const entry = { button: btn, sub, expanded: false };

    const hide = () => {
      entry.expanded = false;
      disableSubList(sub);
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '▸';
    };

    const show = () => {
      entry.expanded = true;
      enableSubList(sub);
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = '▾';
    };

    entry.hide = hide;
    entry.show = show;
    hide();
    subRegistry.set(btn, entry);

    btn.addEventListener('click', (event) => {
      event.preventDefault();
      if (entry.expanded) {
        hide();
      } else {
        show();
      }
      startGracePeriod();
    });
  });

  const collapseAllSubLists = () => {
    subRegistry.forEach((entry) => {
      if (entry.hide) {
        entry.hide();
      }
    });
  };

  const isElementFocusedInside = (el) => {
    const active = doc.activeElement;
    return Boolean(active && el.contains(active));
  };

  const setLinksFocusable = (allow) => {
    const links = tocList.querySelectorAll('a');
    links.forEach((link) => {
      if (allow) {
        link.removeAttribute('tabindex');
        link.removeAttribute('aria-hidden');
      } else {
        link.setAttribute('tabindex', '-1');
        link.setAttribute('aria-hidden', 'true');
      }
    });

    if (allow) {
      tocList.removeAttribute('aria-hidden');
    } else {
      tocList.setAttribute('aria-hidden', 'true');
    }
  };

  let isCollapsed = toc.classList.contains(collapseClass);
  let lastInteractionTs = 0;
  let lastStateChangeTs = 0;
  let pendingScrollY = window.scrollY || window.pageYOffset || 0;
  let lastScrollY = pendingScrollY;
  let accumulatedDelta = 0;
  let lastDirection = 0;
  let frameRequested = false;
  let tocScrolling = false;
  let tocScrollTimer = null;

  const applyCollapseState = (collapse, source = 'manual') => {
    if (isCollapsed === collapse) {
      return;
    }

    const timestamp = now();
    if (timestamp - lastStateChangeTs < transitionDebounceMs && source !== 'manual') {
      if (DEBUG) {
        console.info('TOC: skip state change debounce');
      }
      return;
    }

    isCollapsed = collapse;
    lastStateChangeTs = timestamp;
    toc.classList.toggle(collapseClass, collapse);
    toggle.setAttribute('aria-expanded', String(!collapse));
    toggle.setAttribute('aria-label', collapse ? 'Expandir índice' : 'Colapsar índice');
    setLinksFocusable(!collapse);

    if (collapse) {
      collapseAllSubLists();
    }

    if (source === 'auto') {
      accumulatedDelta = 0;
      lastDirection = 0;
    }
  };

  const initializeState = () => {
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
    toggle.setAttribute('aria-label', isCollapsed ? 'Expandir índice' : 'Colapsar índice');
    toc.classList.toggle(collapseClass, isCollapsed);
    setLinksFocusable(!isCollapsed);
  };

  initializeState();

  const handleManualToggle = () => {
    applyCollapseState(!isCollapsed, 'manual');
    pendingScrollY = window.scrollY || window.pageYOffset || 0;
    lastScrollY = pendingScrollY;
    accumulatedDelta = 0;
    lastDirection = 0;
    startGracePeriod();
  };

  toggle.addEventListener('click', handleManualToggle);
  toggle.addEventListener('keydown', (event) => {
    const { key } = event;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      handleManualToggle();
    }
  });

  toc.addEventListener('focusin', () => {
    startGracePeriod();
  });

  const markTocScroll = () => {
    tocScrolling = true;
    if (tocScrollTimer) {
      window.clearTimeout(tocScrollTimer);
    }
    tocScrollTimer = window.setTimeout(() => {
      tocScrolling = false;
    }, tocScrollLockMs);
  };

  toc.addEventListener('wheel', markTocScroll, { passive: true });
  toc.addEventListener('touchstart', markTocScroll, { passive: true });
  toc.addEventListener('touchmove', markTocScroll, { passive: true });
  toc.addEventListener('scroll', markTocScroll, { passive: true });

  const shouldAutoCollapseReact = () => {
    if (!autoCollapseEnabled) {
      return false;
    }

    if (tocScrolling) {
      if (DEBUG) {
        console.info('TOC: auto-collapse skip tocScrolling');
      }
      return false;
    }

    const timestamp = now();
    if (timestamp - lastInteractionTs < graceWindowMs) {
      if (DEBUG) {
        console.info('TOC: auto-collapse skip grace window');
      }
      return false;
    }

    if (timestamp - lastStateChangeTs < transitionDebounceMs) {
      if (DEBUG) {
        console.info('TOC: auto-collapse skip transition debounce');
      }
      return false;
    }

    if (isElementFocusedInside(toc)) {
      if (DEBUG) {
        console.info('TOC: auto-collapse skip focused');
      }
      return false;
    }

    return true;
  };

  const processScrollFrame = () => {
    frameRequested = false;

    const currentY = pendingScrollY;
    const delta = currentY - lastScrollY;

    if (Math.abs(delta) < smallThreshold) {
      return;
    }

    const direction = delta > 0 ? 1 : -1;

    if (direction !== lastDirection) {
      lastDirection = direction;
      accumulatedDelta = delta;
    } else {
      accumulatedDelta += delta;
    }

    lastScrollY = currentY;

    if (Math.abs(accumulatedDelta) < mainThreshold) {
      return;
    }

    if (!shouldAutoCollapseReact()) {
      accumulatedDelta = 0;
      return;
    }

    if (direction > 0) {
      applyCollapseState(true, 'auto');
    } else {
      applyCollapseState(false, 'auto');
    }

    accumulatedDelta = 0;
    lastDirection = 0;
  };

  const scheduleScrollFrame = () => {
    if (frameRequested) {
      return;
    }
    frameRequested = true;
    raf(processScrollFrame);
  };

  if (autoCollapseEnabled) {
    window.addEventListener('scroll', () => {
      pendingScrollY = window.scrollY || window.pageYOffset || 0;
      scheduleScrollFrame();
    }, { passive: true });
  }
})();

/**
 * Tuning guide: ajusta mainThreshold para mayor/menor distancia de scroll antes de colapsar,
 * smallThreshold para filtrar micro-movimientos, graceWindowMs para alargar la ventana de interacción,
 * y tocScrollLockMs para controlar cuánto tiempo se ignoran los scrolls internos del TOC.
 */
