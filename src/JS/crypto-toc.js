(() => {
  const doc = document;
  const toc = doc.getElementById('toc');
  const toggle = doc.getElementById('toc-toggle');
  const tocList = doc.getElementById('toc-list');

  if (!toc || !toggle || !tocList) {
    console.warn('TOC: elemento faltante');
    return;
  }

  // init
  const collapseClass = 'toc-collapsed';
  const scrollThreshold = 32;
  const graceDuration = 300;
  const tocScrollIgnoreDuration = 200;
  const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const raf = window.requestAnimationFrame
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

  const subLists = Array.from(toc.querySelectorAll('.toc-sub'));
  subLists.forEach((sub) => {
    try {
      sub.style.setProperty('display', 'none', 'important');
    } catch (error) {
      sub.style.display = 'none';
    }
  });

  const subRegistry = new Map();
  const subToggles = Array.from(toc.querySelectorAll('.toc-sub-toggle'));

  subToggles.forEach((btn) => {
    const subId = btn.getAttribute('aria-controls');
    const sub = subId ? doc.getElementById(subId) : null;
    if (!sub) {
      return;
    }

    const entry = { button: btn, sub, expanded: false };

    const hide = () => {
      entry.expanded = false;
      try {
        sub.style.setProperty('display', 'none', 'important');
      } catch (error) {
        sub.style.display = 'none';
      }
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '▸';
    };

    const show = () => {
      entry.expanded = true;
      try {
        sub.style.setProperty('display', 'block', 'important');
      } catch (error) {
        sub.style.display = 'block';
      }
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

  let isCollapsed = toc.classList.contains(collapseClass);
  let graceActiveUntil = 0;
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let ticking = false;
  let tocScrolling = false;
  let tocScrollTimer = null;
  let lastFocusTs = 0;

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

  const applyCollapseState = (collapse) => {
    if (isCollapsed === collapse) {
      return;
    }
    isCollapsed = collapse;
    toc.classList.toggle(collapseClass, collapse);
    toggle.setAttribute('aria-expanded', String(!collapse));
    toggle.setAttribute('aria-label', collapse ? 'Expandir índice' : 'Colapsar índice');
    setLinksFocusable(!collapse);
    if (collapse) {
      collapseAllSubLists();
    }
  };

  const startGracePeriod = () => {
    graceActiveUntil = now() + graceDuration;
  };

  toggle.setAttribute('aria-expanded', String(!isCollapsed));
  toggle.setAttribute('aria-label', isCollapsed ? 'Expandir índice' : 'Colapsar índice');
  toc.classList.toggle(collapseClass, isCollapsed);
  setLinksFocusable(!isCollapsed);

  const handleManualToggle = () => {
    applyCollapseState(!isCollapsed);
    lastScrollY = window.scrollY || window.pageYOffset || 0;
    startGracePeriod();
  };

  // toggle handler
  toggle.addEventListener('click', handleManualToggle);
  toggle.addEventListener('keydown', (event) => {
    const { key } = event;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      handleManualToggle();
    }
  });

  // accessibility helpers
  toc.addEventListener('focusin', () => {
    lastFocusTs = now();
  });

  const markTocScroll = () => {
    tocScrolling = true;
    if (tocScrollTimer) {
      window.clearTimeout(tocScrollTimer);
    }
    tocScrollTimer = window.setTimeout(() => {
      tocScrolling = false;
    }, tocScrollIgnoreDuration);
  };

  // Auto-collapse ignorado cuando el usuario scrollea dentro del aside
  toc.addEventListener('wheel', markTocScroll, { passive: true });
  toc.addEventListener('touchstart', markTocScroll, { passive: true });
  toc.addEventListener('touchmove', markTocScroll, { passive: true });
  toc.addEventListener('scroll', markTocScroll, { passive: true });

  // scroll handler
  const handleScrollDelta = () => {
    if (!autoCollapseEnabled) {
      return;
    }
    if (tocScrolling) {
      return;
    }

    const currentTs = now();
    if (currentTs < graceActiveUntil) {
      return;
    }

    const activeElement = doc.activeElement;
    if (activeElement && toc.contains(activeElement) && currentTs - lastFocusTs < graceDuration) {
      return;
    }

    const currentY = window.scrollY || window.pageYOffset || 0;
    const delta = currentY - lastScrollY;

    if (Math.abs(delta) < scrollThreshold) {
      return;
    }

    lastScrollY = currentY;

    if (delta > 0) {
      applyCollapseState(true);
    } else if (delta < 0) {
      applyCollapseState(false);
    }
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    raf(() => {
      ticking = false;
      handleScrollDelta();
    });
  };

  if (autoCollapseEnabled) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
