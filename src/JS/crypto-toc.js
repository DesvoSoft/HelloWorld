(() => {
  const toc = document.getElementById('toc');
  const toggle = document.getElementById('toc-toggle');
  const tocList = document.getElementById('toc-list');

  if (!toc || !toggle || !tocList) {
    console.warn('[crypto-toc] Marcado incompleto: no se inicializa el índice.');
    return;
  }

  // --- Init: cache selectors y normaliza atributos ---
  const collapseClass = 'toc-collapsed';
  const scrollThreshold = 32;
  const graceDuration = 300;
  const autoCollapseEnabled = toc.getAttribute('data-toc-collapsible') !== 'false';
  const parseMeasure = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const defaultWidth = parseMeasure(toc.dataset.tocDefaultWidth, 160);
  const collapsedWidth = parseMeasure(toc.dataset.tocCollapsedWidth, 56);
  toc.style.setProperty('--toc-default-width', `${defaultWidth}px`);
  toc.style.setProperty('--toc-collapsed-width', `${collapsedWidth}px`);

  const subToggles = Array.from(toc.querySelectorAll('.toc-sub-toggle'));
  const subMap = new Map();

  subToggles.forEach((btn) => {
    const subId = btn.getAttribute('aria-controls');
    const sub = subId ? document.getElementById(subId) : null;
    if (!sub) {
      return;
    }
    sub.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '▸';
    subMap.set(btn, sub);
  });

  let isCollapsed = toc.classList.contains(collapseClass);
  let graceActive = false;
  let graceTimer = null;
  let lastScrollY = window.scrollY;
  let ticking = false;
  const raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (cb) => window.setTimeout(cb, 16);

  const updateToggleAria = (collapsed) => {
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expandir índice' : 'Colapsar índice');
  };

  const setLinksFocusable = (collapsed) => {
    // --- Accessibility fixes: focus y visibilidad ---
    const links = tocList.querySelectorAll('a');
    links.forEach((link) => {
      if (collapsed) {
        link.setAttribute('tabindex', '-1');
        link.setAttribute('aria-hidden', 'true');
      } else {
        link.removeAttribute('tabindex');
        link.removeAttribute('aria-hidden');
      }
    });
    if (collapsed) {
      tocList.setAttribute('aria-hidden', 'true');
    } else {
      tocList.removeAttribute('aria-hidden');
    }
  };

  const closeAllSubLists = () => {
    subMap.forEach((sub, btn) => {
      sub.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '▸';
    });
  };

  const applyCollapseState = (collapsed) => {
    if (isCollapsed === collapsed) {
      return;
    }
    isCollapsed = collapsed;
    toc.classList.toggle(collapseClass, collapsed);
    updateToggleAria(collapsed);
    setLinksFocusable(collapsed);
    if (collapsed) {
      closeAllSubLists();
    }
  };

  updateToggleAria(isCollapsed);
  setLinksFocusable(isCollapsed);
  if (isCollapsed) {
    closeAllSubLists();
  }

  const startGracePeriod = () => {
    graceActive = true;
    if (graceTimer) {
      clearTimeout(graceTimer);
    }
    graceTimer = window.setTimeout(() => {
      graceActive = false;
    }, graceDuration);
  };

  const handlePrimaryToggle = () => {
    // --- Toggle handler principal ---
    applyCollapseState(!isCollapsed);
    lastScrollY = window.scrollY;
    startGracePeriod();
  };

  toggle.addEventListener('click', handlePrimaryToggle);
  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
      event.preventDefault();
      handlePrimaryToggle();
    }
  });

  subMap.forEach((sub, btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const willOpen = sub.style.display === 'none';
      sub.style.display = willOpen ? 'flex' : 'none';
      btn.setAttribute('aria-expanded', String(willOpen));
      btn.textContent = willOpen ? '▾' : '▸';
      startGracePeriod();
    });
  });

  const elementWithinToc = (element) => Boolean(element) && toc.contains(element);

  let tocScrollLock = false;
  let tocScrollTimer = null;
  let lastTocFocusTime = 0;

  const releaseTocScrollLock = () => {
    tocScrollLock = false;
    tocScrollTimer = null;
  };

  const markTocScroll = () => {
    tocScrollLock = true;
    if (tocScrollTimer) {
      clearTimeout(tocScrollTimer);
    }
    tocScrollTimer = window.setTimeout(releaseTocScrollLock, graceDuration);
  };

  toc.addEventListener('scroll', markTocScroll, { passive: true });
  toc.addEventListener('wheel', markTocScroll, { passive: true });
  toc.addEventListener('touchmove', markTocScroll, { passive: true });
  toc.addEventListener('focusin', () => {
    lastTocFocusTime = Date.now();
  });

  const handleScrollChange = (event) => {
    // --- Scroll handler para colapso automático ---
    if (event && event.target === toc) {
      return;
    }
    if (tocScrollLock) {
      return;
    }
    if (elementWithinToc(document.activeElement)) {
      const focusDelta = Date.now() - lastTocFocusTime;
      if (focusDelta < graceDuration) {
        return;
      }
    }
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    if (Math.abs(delta) < scrollThreshold) {
      return;
    }
    lastScrollY = currentY;
    if (!autoCollapseEnabled || graceActive) {
      return;
    }
    if (delta > 0) {
      applyCollapseState(true);
    } else {
      applyCollapseState(false);
    }
  };

  let lastScrollEvent = null;

  const onScroll = (event) => {
    if (ticking) {
      return;
    }
    lastScrollEvent = event;
    ticking = true;
    raf(() => {
      handleScrollChange(lastScrollEvent);
      ticking = false;
    });
  };

  if (autoCollapseEnabled) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
