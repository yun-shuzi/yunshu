document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
    window.scrollTo(0, 0);
  });

  const galleryConfigs = [
    {
      railSelector: ".showcase--works .flow-rail",
      sources: [
        "./image/17.jpg",
        "./image/19.jpg",
        "./image/20.jpg",
        "./image/22.jpg",
        "./image/49.jpg",
        "./image/50.jpg",
      ],
    },
    {
      railSelector: ".showcase--blog .flow-rail",
      sources: [
        "./image/24.jpg",
        "./image/48.jpg",
        "./image/1.jpg",
        "./image/23.jpg",
        "./image/18.jpg",
        "./image/40.jpg",
      ],
    },
    {
      railSelector: ".showcase--travel .flow-rail",
      sources: [
        "./image/3.jpg",
        "./image/6.jpg",
        "./image/9.jpg",
        "./image/25.jpg",
        "./image/34.jpg",
        "./image/42.jpg",
      ],
    },
  ];

  galleryConfigs.forEach(({ railSelector, sources }) => {
    upgradeWorksEntries(railSelector, sources);
    enableDragScroll(railSelector);
    centerWorksRail(railSelector);
  });
  setupScrollOverlay(".showcase--works", ".works-overlay");
  setupScrollOverlay(".showcase--blog", ".blog-overlay");
  setupScrollOverlay(".showcase--travel", ".travel-overlay");

  const entries = Array.from(document.querySelectorAll("[data-entry]"));

  entries.forEach((entry) => {
    entry.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) {
        return;
      }

      const href = entry.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      event.preventDefault();

      if (document.body.classList.contains("is-transitioning")) {
        return;
      }

      startTransition(entry, href);
    });
  });
});

function setupScrollOverlay(sectionSelector, overlaySelector) {
  const section = document.querySelector(sectionSelector);
  const overlay = document.querySelector(overlaySelector);

  if (!section || !overlay) {
    return;
  }

  const readNumber = (name, fallback) => {
    const value = Number.parseFloat(getComputedStyle(overlay).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  let rafId = 0;

  const updateOverlay = () => {
    rafId = 0;

    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const startRatio = readNumber("--scroll-overlay-scroll-start", 1);
    const endRatio = readNumber("--scroll-overlay-scroll-end", 0.5);
    const shiftRatio = readNumber("--scroll-overlay-shift-ratio", 1);
    const direction = readNumber("--scroll-overlay-direction", -1) || -1;

    const start = viewportHeight * startRatio;
    const end = viewportHeight * endRatio - sectionRect.height * 0.5;
    const span = start - end || 1;
    const rawProgress = (start - sectionRect.top) / span;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // 用布局宽度而不是视觉宽度，避免 rotate 影响滚动位移计算
    const overlayWidth = overlay.offsetWidth || 1;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const targetShift = Math.max(0, viewportWidth / 2 + overlayWidth / 2) * shiftRatio;
    const shift = targetShift * progress * direction;

    overlay.style.setProperty("--scroll-overlay-shift", `${shift}px`);
  };

  const scheduleUpdate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(updateOverlay);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);

  updateOverlay();
}

function upgradeWorksEntries(railSelector, sources) {
  const rail = document.querySelector(railSelector);
  if (!rail) {
    return;
  }

  const artworks = rail.querySelectorAll(".entry .entry__face--front .entry__art");

  artworks.forEach((artwork, index) => {
    const source = sources[index];
    if (!source) {
      return;
    }

    const image = document.createElement("img");
    image.className = "entry__photo";
    image.src = source;
    image.alt = "";
    image.loading = "eager";
    image.decoding = "async";

    artwork.replaceWith(image);
  });
}

function centerWorksRail(railSelector) {
  const rail = document.querySelector(railSelector);
  if (!rail) {
    return;
  }

  const entries = Array.from(rail.querySelectorAll(".entry"));
  const leftCenterEntry = entries[2];
  const rightCenterEntry = entries[3];

  if (!leftCenterEntry || !rightCenterEntry) {
    return;
  }

  const midpoint =
    leftCenterEntry.offsetLeft +
    leftCenterEntry.offsetWidth +
    (rightCenterEntry.offsetLeft - (leftCenterEntry.offsetLeft + leftCenterEntry.offsetWidth)) / 2;

  rail.scrollLeft = Math.max(0, midpoint - rail.clientWidth / 2);
}

function enableDragScroll(railSelector) {
  const rail = document.querySelector(railSelector);
  if (!rail) {
    return;
  }

  let isDragging = false;
  let isPointerDown = false;
  let didDrag = false;
  let startX = 0;
  let startScrollLeft = 0;
  let activePointerId = null;
  let currentScrollLeft = 0;
  let targetScrollLeft = 0;
  let rafId = 0;
  let suppressClick = false;

  const tick = () => {
    rafId = 0;

    const delta = targetScrollLeft - currentScrollLeft;
    if (!isDragging && Math.abs(delta) < 0.25) {
      currentScrollLeft = targetScrollLeft;
      rail.scrollLeft = currentScrollLeft;
      return;
    }

    currentScrollLeft += delta * (isDragging ? 0.32 : 0.22);
    rail.scrollLeft = currentScrollLeft;

    rafId = window.requestAnimationFrame(tick);
  };

  const requestTick = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(tick);
  };

  const stopDragging = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    rail.classList.remove("is-dragging");

    if (suppressClick) {
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  };

  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isPointerDown = true;
    isDragging = false;
    didDrag = false;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    currentScrollLeft = rail.scrollLeft;
    targetScrollLeft = rail.scrollLeft;
    activePointerId = event.pointerId;
    requestTick();
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isPointerDown || event.pointerId !== activePointerId) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 4) {
      didDrag = true;
    }

    if (!isDragging && didDrag) {
      isDragging = true;
      rail.classList.add("is-dragging");
      rail.setPointerCapture(event.pointerId);
    }

    if (!isDragging) {
      return;
    }

    targetScrollLeft = startScrollLeft - deltaX;
    requestTick();
    event.preventDefault();
  });

  const endDrag = (event) => {
    if (!isPointerDown || (activePointerId !== null && event.pointerId !== activePointerId)) {
      return;
    }

    if (isDragging) {
      stopDragging();
    }

    if (rail.hasPointerCapture?.(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    isPointerDown = false;
    isDragging = false;
    activePointerId = null;

    if (didDrag) {
      suppressClick = true;
    }
  };

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  rail.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true,
  );

  rail.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  window.addEventListener("load", () => centerWorksRail(railSelector));
  window.addEventListener("resize", () => centerWorksRail(railSelector));
}

function startTransition(activeEntry, targetHref) {
  const body = document.body;
  body.classList.add("is-transitioning");
  activeEntry.classList.add("is-active");

  window.setTimeout(() => {
    body.classList.add("is-flipping");
  }, 80);

  window.setTimeout(() => {
    body.classList.add("is-darkening");
  }, 280);

  window.setTimeout(() => {
    body.classList.add("is-cutting");
  }, 760);

  window.setTimeout(() => {
    window.location.href = targetHref;
  }, 1080);
}
