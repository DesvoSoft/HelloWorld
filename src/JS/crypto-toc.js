/**
 * Crypto TOC module
 * - Accessible, responsive table of contents with scroll collapse, off-canvas mobile drawer and scrollspy.
 * - Vanilla JS, no globals exposed.
 */
(() => {
  const nav = document.querySelector('nav.toc[data-toc-scope="crypto"]');
  if (!nav) {
    return;
  }

  const toggleBtn = nav.querySelector('#toc-toggle');
  const list = nav.querySelector('#toc-list');
  const panel = nav.querySelector('.toc-panel');
  const inner = nav.querySelector('.toc-inner');
  const overlay = nav.querySelector('[data-toc-overlay]');
  const STORAGE_KEY = 'crypto.toc.state';
  const SCROLL_THRESHOLD = 120;
  const MOBILE_MEDIA = window.matchMedia('(max-width: 768px)');

  const tocLinks = Array.from(nav.querySelectorAll('.toc-link[data-toc-id]'));
  const sections = Array.from(document.querySelectorAll('.doc-section[id]'));

  if (!toggleBtn || !list || !panel || tocLinks.length === 0) {
    return;
  }

  const linkMap = new Map();
  tocLinks.forEach((link) => {
    linkMap.set(link.getAttribute('href').replace('#', ''), link);
  });

  const subToggles = Array.from(nav.querySelectorAll('.toc-sub-toggle'));
  const labelEl = toggleBtn.querySelector('.toc-toggle-label');

  const safeStorage = {
    get() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (error) {
        return null;
      }
    },
    set(value) {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch (error) {
        /* noop */
      }
    },
    remove() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* noop */
      }
    },
  };

  let manualPreference = safeStorage.get();
  let collapsed = false;
  let tickingScroll = false;
  let tickingResize = false;
  let lastKnownScrollY = window.scrollY || 0;
  let activeId = null;

  const emit = (name, detail) => {
    const event = new CustomEvent(name, {
      detail,
      bubbles: true,
    });
    nav.dispatchEvent(event);
  };

  const setLinksFocusable = (allow) => {
    tocLinks.forEach((link) => {
      if (allow) {
        link.removeAttribute('tabindex');
        link.removeAttribute('aria-hidden');
      } else {
        link.setAttribute('tabindex', '-1');
        link.setAttribute('aria-hidden', 'true');
      }
    });
    if (allow) {
      list.removeAttribute('aria-hidden');
    } else {
      list.setAttribute('aria-hidden', 'true');
    }
  };

  const applyToggleLabel = (isCollapsed) => {
    if (!labelEl) {
      return;
    }
    const expandedLabel = labelEl.dataset.labelExpanded || 'Ocultar índice';
    const collapsedLabel = labelEl.dataset.labelCollapsed || 'Mostrar índice';
    labelEl.textContent = isCollapsed ? collapsedLabel : expandedLabel;
  };

  const lockScroll = (shouldLock) => {
    document.body.classList.toggle('toc-lock-scroll', shouldLock);
    if (!shouldLock) {
      document.body.style.removeProperty('touch-action');
    } else {
      document.body.style.setProperty('touch-action', 'none');
    }
  };

  const setCollapsed = (shouldCollapse, source = 'auto') => {
    if (collapsed === shouldCollapse) {
      return;
    }
    collapsed = shouldCollapse;

    nav.classList.toggle('toc-collapsed', shouldCollapse);
    toggleBtn.setAttribute('aria-expanded', String(!shouldCollapse));
    applyToggleLabel(shouldCollapse);

    if (MOBILE_MEDIA.matches) {
      nav.classList.toggle('toc-open', !shouldCollapse);
      if (overlay) {
        overlay.hidden = shouldCollapse;
      }
      lockScroll(!shouldCollapse);
    } else {
      nav.classList.remove('toc-open');
      if (overlay) {
        overlay.hidden = true;
      }
      lockScroll(false);
    }

    setLinksFocusable(!shouldCollapse);
    emit('toc:toggle', { collapsed: shouldCollapse, source });
  };

  const storedPreference = manualPreference === 'collapsed' || manualPreference === 'expanded'
    ? manualPreference
    : null;

  if (storedPreference) {
    setCollapsed(storedPreference === 'collapsed', 'restore');
  } else {
    setCollapsed(MOBILE_MEDIA.matches, 'init');
  }

  const persistManualPreference = (state) => {
    manualPreference = state;
    if (state) {
      safeStorage.set(state);
    } else {
      safeStorage.remove();
    }
  };

  const closeOnMobile = () => {
    if (MOBILE_MEDIA.matches) {
      setCollapsed(true, 'manual');
    }
  };

  toggleBtn.addEventListener('click', () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed, 'manual');
    persistManualPreference(nextCollapsed ? 'collapsed' : 'expanded');
  });

  toggleBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      toggleBtn.click();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', closeOnMobile);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOnMobile();
    }
  });

  const handleSubToggle = (btn) => {
    const controls = btn.getAttribute('aria-controls');
    if (!controls) {
      return;
    }
    const subList = nav.querySelector(`#${CSS.escape(controls)}`);
    if (!subList) {
      return;
    }
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', String(next));
    subList.toggleAttribute('hidden', !next);
  };

  subToggles.forEach((btn) => {
    const controls = btn.getAttribute('aria-controls');
    if (controls) {
      const subList = nav.querySelector(`#${CSS.escape(controls)}`);
      if (subList) {
        subList.setAttribute('hidden', '');
      }
    }
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      handleSubToggle(btn);
    });
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        handleSubToggle(btn);
      }
    });
  });

  const updatePanelMaxHeight = () => {
    if (!inner || !panel) {
      return;
    }
    if (MOBILE_MEDIA.matches) {
      panel.style.removeProperty('max-height');
      return;
    }
    const rect = inner.getBoundingClientRect();
    const available = window.innerHeight - rect.top - 24;
    const maxHeight = Math.max(160, Math.round(available));
    panel.style.maxHeight = `${maxHeight}px`;
  };

  const onResize = () => {
    if (!tickingResize) {
      tickingResize = true;
      window.requestAnimationFrame(() => {
        tickingResize = false;
        if (!MOBILE_MEDIA.matches && collapsed && manualPreference !== 'collapsed') {
          setCollapsed(false, 'resize');
        }
        if (MOBILE_MEDIA.matches && !collapsed) {
          nav.classList.add('toc-open');
          if (overlay) {
            overlay.hidden = false;
          }
        } else if (!MOBILE_MEDIA.matches) {
          nav.classList.remove('toc-open');
          if (overlay) {
            overlay.hidden = true;
          }
          lockScroll(false);
        }
        updatePanelMaxHeight();
      });
    }
  };

  const autoToggleOnScroll = () => {
    if (manualPreference) {
      return;
    }
    if (MOBILE_MEDIA.matches) {
      return;
    }
    const currentY = window.scrollY || 0;
    const delta = currentY - lastKnownScrollY;
    const scrollingDown = delta > 12;
    const scrollingUp = delta < -12;

    if (currentY > SCROLL_THRESHOLD && scrollingDown && !collapsed) {
      setCollapsed(true, 'auto');
    } else if (scrollingUp && collapsed) {
      setCollapsed(false, 'auto');
    }

    lastKnownScrollY = currentY;
  };

  const onScroll = () => {
    if (!tickingScroll) {
      tickingScroll = true;
      window.requestAnimationFrame(() => {
        tickingScroll = false;
        autoToggleOnScroll();
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  if (typeof MOBILE_MEDIA.addEventListener === 'function') {
    MOBILE_MEDIA.addEventListener('change', onResize);
  } else if (typeof MOBILE_MEDIA.addListener === 'function') {
    MOBILE_MEDIA.addListener(onResize);
  }

  const setActiveLink = (id) => {
    if (activeId === id) {
      return;
    }
    if (activeId && linkMap.has(activeId)) {
      linkMap.get(activeId).classList.remove('toc-link-active');
    }
    if (id && linkMap.has(id)) {
      linkMap.get(id).classList.add('toc-link-active');
    }
    activeId = id;
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      let visibleEntry = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!visibleEntry || entry.intersectionRatio > visibleEntry.intersectionRatio) {
            visibleEntry = entry;
          }
        }
      });
      if (visibleEntry && visibleEntry.target.id) {
        setActiveLink(visibleEntry.target.id);
      }
    }, {
      rootMargin: '-40% 0px -50% 0px',
      threshold: [0.2, 0.4, 0.6],
    });
    sections.forEach((section) => observer.observe(section));
  } else {
    window.addEventListener('scroll', () => {
      const current = sections.reduce((closest, section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4 && rect.top > -rect.height) {
          const distance = Math.abs(rect.top);
          if (!closest || distance < closest.distance) {
            return { id: section.id, distance };
          }
        }
        return closest;
      }, null);
      if (current) {
        setActiveLink(current.id);
      }
    }, { passive: true });
  }

  nav.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const link = target.closest('.toc-link');
    if (link) {
      emit('toc:click', {
        id: link.dataset.tocId,
        href: link.getAttribute('href'),
      });
      if (MOBILE_MEDIA.matches) {
        setTimeout(() => {
          setCollapsed(true, 'manual');
        }, 200);
      }
    }
  });

  updatePanelMaxHeight();
})();
