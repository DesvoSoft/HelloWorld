(() => {
  const nav = document.querySelector('nav.toc[data-toc-scope="crypto"]');
  if (!nav) {
    return;
  }

  const track = nav.querySelector('.toc-track');
  const trackShell = nav.querySelector('.toc-track-shell');
  const scrollButtons = Array.from(nav.querySelectorAll('.toc-scroll-btn'));
  const tocLinks = Array.from(nav.querySelectorAll('.toc-link[data-toc-id]'));
  const sections = Array.from(document.querySelectorAll('.doc-section[id]'));

  if (!track || tocLinks.length === 0 || sections.length === 0) {
    return;
  }

  const linkMap = new Map();
  tocLinks.forEach((link) => {
    const id = link.dataset.tocId || link.getAttribute('href')?.replace('#', '');
    if (id) {
      linkMap.set(id, link);
    }
  });

  let activeId = null;
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

  const observerOptions = {
    rootMargin: '-45% 0px -45% 0px',
    threshold: [0.2, 0.4, 0.6],
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      let mostVisible = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!mostVisible || entry.intersectionRatio > mostVisible.intersectionRatio) {
            mostVisible = entry;
          }
        }
      });
      if (mostVisible?.target?.id) {
        setActiveLink(mostVisible.target.id);
      }
    }, observerOptions);
    sections.forEach((section) => observer.observe(section));
  } else {
    window.addEventListener('scroll', () => {
      const current = sections.reduce((closest, section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.15) {
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

  const applyScrollState = () => {
    if (!trackShell) {
      return;
    }
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 2 || maxScroll <= 0;
    const atEnd = track.scrollLeft >= maxScroll - 2 && maxScroll > 0;
    let state = 'middle';
    if (atStart && atEnd) {
      state = 'full';
    } else if (atStart) {
      state = 'start';
    } else if (atEnd) {
      state = 'end';
    }
    trackShell.dataset.scrollState = state;
    scrollButtons.forEach((btn) => {
      const dir = Number(btn.dataset.dir) || 0;
      const disable = (dir < 0 && (atStart || maxScroll <= 0)) || (dir > 0 && (atEnd || maxScroll <= 0));
      btn.toggleAttribute('disabled', disable);
    });
  };

  let scrollRaf = false;
  track.addEventListener('scroll', () => {
    if (!scrollRaf) {
      scrollRaf = true;
      window.requestAnimationFrame(() => {
        scrollRaf = false;
        applyScrollState();
      });
    }
  });

  window.addEventListener('resize', () => applyScrollState());
  applyScrollState();

  scrollButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) {
        return;
      }
      const dir = Number(btn.dataset.dir) || 1;
      const distance = track.clientWidth * 0.75 * Math.sign(dir || 1);
      track.scrollBy({ left: distance, behavior: 'smooth' });
    });
  });

  const subTriggers = Array.from(nav.querySelectorAll('.toc-sub-trigger'));
  let openTrigger = null;

  const getMenuFromTrigger = (trigger) => {
    const controls = trigger?.getAttribute('aria-controls');
    if (!controls) {
      return null;
    }
    return nav.querySelector(`#${CSS.escape(controls)}`);
  };

  const closeSubmenu = (trigger = openTrigger) => {
    if (!trigger) {
      return;
    }
    const menu = getMenuFromTrigger(trigger);
    if (menu) {
      menu.hidden = true;
    }
    trigger.setAttribute('aria-expanded', 'false');
    trigger.closest('.toc-item')?.removeAttribute('data-open');
    if (openTrigger === trigger) {
      openTrigger = null;
    }
  };

  const openSubmenu = (trigger) => {
    if (!trigger) {
      return;
    }
    const menu = getMenuFromTrigger(trigger);
    if (!menu) {
      return;
    }
    if (openTrigger && openTrigger !== trigger) {
      closeSubmenu(openTrigger);
    }
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    trigger.closest('.toc-item')?.setAttribute('data-open', 'true');
    openTrigger = trigger;
  };

  const toggleSubmenu = (trigger) => {
    if (trigger.getAttribute('aria-expanded') === 'true') {
      closeSubmenu(trigger);
    } else {
      openSubmenu(trigger);
    }
  };

  subTriggers.forEach((trigger) => {
    const menu = getMenuFromTrigger(trigger);
    if (menu) {
      menu.hidden = true;
    }
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSubmenu(trigger);
    });
  });

  document.addEventListener('click', (event) => {
    if (openTrigger && !nav.contains(event.target)) {
      closeSubmenu(openTrigger);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSubmenu(openTrigger);
    }
  });

  nav.addEventListener('click', (event) => {
    const link = event.target.closest('.toc-link');
    if (link) {
      window.requestAnimationFrame(() => closeSubmenu());
    }
  });
})();
