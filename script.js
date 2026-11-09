/*
 * PORTFOLIO CONFIGURATION
 * Edit this object to change pages, chapters, file locations, and links.
 * All page numbers here are the same one-based numbers visitors see.
 */
const pageAssetPath = (folder, page) => `${folder}/page-${String(page).padStart(2, "0")}.webp?v=${encodeURIComponent(SITE_CONFIG.build)}`;

const portfolioConfig = {
  totalPages: 31,
  initialPage: 1,
  pagePath: page => pageAssetPath("assets/portfolio", page),
  thumbnailPath: page => pageAssetPath("assets/thumbnails", page),
  resumePageUrl: SITE_CONFIG.resumePageUrl,
  chapters: [
    { roman: "", title: "Cover", fullTitle: "Luis Albos Engineering Portfolio", startPage: 1, endPage: 1, isFrontMatter: true },
    { roman: "", title: "Contents", fullTitle: "Table of Contents", startPage: 2, endPage: 2, isFrontMatter: true },
    { roman: "I", title: "SAE Aero Design East 1", startPage: 3, endPage: 7, season: "2023–2024", location: "Van Nuys, California", role: "Structures and Material Science Engineering Apprentice" },
    { roman: "II", title: "SAE Aero Design West 1", startPage: 8, endPage: 14, season: "2024–2025", location: "Fort Worth, Texas", role: "Structures and Material Science Engineer & Flight Test Photographer" },
    { roman: "III", title: "SAE Aero Design East II", startPage: 15, endPage: 20, season: "2025–2026", location: "Lakeland, Florida", role: "Structures and Material Science Engineer & Flight Test Photographer" },
    { roman: "IV", title: "NASA L’SPACE NPWEE", startPage: 21, endPage: 22, season: "2023–2024", role: "Principal Investigator" },
    { roman: "V", title: "AIAA CanSat", fullTitle: "AIAA CanSat Competition", startPage: 23, endPage: 23, season: "2022–2023", role: "Mechanical Team Leader" },
    { roman: "VI", title: "Coursework Projects", fullTitle: "Mechatronics Engineering Coursework Projects", startPage: 24, endPage: 25, organization: "Texas A&M University", role: "Mixed Individual & Group Work" },
    { roman: "VII", title: "Engineering Capstone", fullTitle: "Interference Resilient Robot", startPage: 26, endPage: 26, season: "2025–2026", role: "Project Manager", distinction: "1st Place in the Mechatronics Engineering Technology major" },
    { roman: "VIII", title: "X-02S Strike Wyvern", startPage: 27, endPage: 28, projectType: "Personal Project", tools: "SolidWorks / SAE Aero Outer Mold Line CAD Training" },
    { roman: "IX", title: "Golden Winged Monarch", startPage: 29, endPage: 31, projectType: "Personal Project", tools: "SolidWorks / Blender / Minecraft workflow" }
  ],
  links: SITE_CONFIG.links
};

(() => {
  "use strict";

  const config = normalizeConfig(portfolioConfig);
  const state = {
    currentPage: config.initialPage,
    requestToken: 0,
    initialized: false,
    imageReady: false,
    mode: "auto",
    layout: "single",
    displayedPages: [],
    renderer: null,
    rendererPromise: null,
    rendererFailed: false,
    keepPages: new Set(),
    detailScale: 1,
    preloadTimer: null,
    thumbnailsBuilt: false
  };

  // Share both pending loads and decoded images between navigation and prefetch.
  const pageCache = new Map();

  const elements = {
    surface: document.querySelector(".page-turn-surface"),
    sheetSpace: document.querySelector(".sheet-space"),
    viewer: document.querySelector("#portfolio-viewer"),
    status: document.querySelector("#viewer-status"),
    retry: document.querySelector("#retry-page"),
    chapters: document.querySelector("#chapters-dialog"),
    detail: document.querySelector("#detail-dialog"),
    detailImage: document.querySelector(".detail-image"),
    imageFrame: document.querySelector("#image-frame"),
    pageInput: document.querySelector("#page-input"),
    previous: document.querySelector(".previous-button"),
    next: document.querySelector(".next-button"),
    chapterNavs: document.querySelectorAll(".chapter-nav"),
    thumbnailGrid: document.querySelector(".thumbnail-grid"),
    drawer: document.querySelector("#mobile-drawer"),
    drawerBackdrop: document.querySelector("#drawer-backdrop"),
    menuButton: document.querySelector("#menu-button"),
    drawerClose: document.querySelector(".drawer-close"),
    searchDialog: document.querySelector("#search-dialog"),
    searchInput: document.querySelector("#search-input"),
    searchResults: document.querySelector(".search-results")
  };

  function normalizeConfig(source) {
    const totalPages = Math.max(1, Number.parseInt(source.totalPages, 10) || 1);
    const initialPage = clamp(Number.parseInt(source.initialPage, 10) || 1, 1, totalPages);
    const chapters = [...(source.chapters || [])]
      .map((chapter, index) => ({
        ...chapter,
        roman: chapter.roman ?? toRoman(index + 1),
        title: chapter.title || `Chapter ${index + 1}`,
        startPage: clamp(Number.parseInt(chapter.startPage, 10) || 1, 1, totalPages),
        endPage: clamp(Number.parseInt(chapter.endPage, 10) || Number.parseInt(chapter.startPage, 10) || 1, 1, totalPages)
      }))
      .sort((a, b) => a.startPage - b.startPage);

    if (!chapters.length || chapters[0].startPage !== 1) {
      chapters.unshift({ roman: "", title: "Cover", fullTitle: "Luis Albos Engineering Portfolio", startPage: 1, endPage: 1, isFrontMatter: true });
    }

    return { ...source, totalPages, initialPage, chapters };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function toRoman(number) {
    const values = [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let result = "";
    values.forEach(([value, numeral]) => {
      while (number >= value) { result += numeral; number -= value; }
    });
    return result;
  }

  function formatVisiblePage(page) {
    return String(page).padStart(Math.max(2, String(config.totalPages).length), "0");
  }

  function formatPageRange(chapter) {
    const start = formatVisiblePage(chapter.startPage);
    return chapter.startPage === chapter.endPage ? start : `${start}–${formatVisiblePage(chapter.endPage)}`;
  }

  function getPageFromHash() {
    const match = window.location.hash.match(/(?:^#|[?&])page=([^&]+)/i);
    if (!match) return null;
    const parsed = Number.parseInt(match[1], 10);
    return clamp(Number.isFinite(parsed) ? parsed : 1, 1, config.totalPages);
  }

  function getActiveChapter(page) {
    return config.chapters.reduce((active, chapter) => page >= chapter.startPage ? chapter : active, config.chapters[0]);
  }

  function applyConfiguration() {
    document.querySelectorAll(".total-pages-display").forEach(node => { node.textContent = config.totalPages; });
    document.querySelectorAll(".resume-link").forEach(link => { link.href = config.resumePageUrl; });
    document.querySelectorAll(".linkedin-link").forEach(link => { link.href = config.links.linkedin; });
    document.querySelectorAll(".email-link").forEach(link => { link.href = config.links.email; });
    elements.pageInput.max = config.totalPages;
  }

  function buildChapterNavigation() {
    elements.chapterNavs.forEach(nav => {
      const fragment = document.createDocumentFragment();
      config.chapters.forEach(chapter => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `chapter-link${chapter.isFrontMatter ? " is-frontmatter" : ""}`;
        button.dataset.page = chapter.startPage;
        const chapterPrefix = chapter.roman ? `Chapter ${chapter.roman}, ` : "";
        button.setAttribute("aria-label", `${chapterPrefix}${chapter.title}, ${chapter.startPage === chapter.endPage ? `page ${chapter.startPage}` : `pages ${chapter.startPage} through ${chapter.endPage}`}`);

        const roman = document.createElement("span");
        roman.className = "chapter-roman";
        roman.textContent = chapter.roman;
        const title = document.createElement("span");
        title.className = "chapter-title";
        title.textContent = chapter.title;
        const page = document.createElement("span");
        page.className = "chapter-page";
        page.textContent = formatPageRange(chapter);

        button.append(roman, title, page);
        button.addEventListener("click", () => {
          navigateTo(chapter.startPage);
          closeDrawer();
          elements.chapters.close();
          document.querySelector("#portfolio-viewer").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
        });
        fragment.append(button);
      });
      nav.replaceChildren(fragment);
    });
  }

  function buildThumbnails() {
    if (state.thumbnailsBuilt) return;
    const fragment = document.createDocumentFragment();

    for (let page = 1; page <= config.totalPages; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "thumbnail-button";
      button.dataset.page = page;
      button.setAttribute("aria-label", `Go to page ${page}`);

      const media = document.createElement("span");
      media.className = "thumbnail-media";
      media.dataset.page = formatVisiblePage(page);
      const image = new Image();
      image.loading = "lazy";
      image.alt = "";
      loadThumbnailImage(image, page, () => {
        media.classList.add("is-missing");
        image.remove();
      });
      media.append(image);

      const number = document.createElement("span");
      number.className = "thumbnail-number";
      number.textContent = `Page ${formatVisiblePage(page)}`;
      button.append(media, number);
      button.addEventListener("click", () => { navigateTo(page); elements.chapters.close(); });
      fragment.append(button);
    }

    elements.thumbnailGrid.append(fragment);
    state.thumbnailsBuilt = true;
  }

  function toggleThumbnails(force) {
    buildThumbnails();
    const shouldShow = typeof force === "boolean" ? force : elements.thumbnailGrid.hidden;
    elements.thumbnailGrid.hidden = !shouldShow;
    document.querySelectorAll(".thumbnails-button").forEach(button => button.setAttribute("aria-expanded", String(shouldShow)));
    document.querySelector(".portfolio-sidebar .chapter-nav").hidden = shouldShow;
    if (shouldShow) updateThumbnailSelection();
    if (!elements.chapters.open) elements.chapters.showModal();
  }

  function navigateTo(page, options = {}) {
    const target = clamp(Number.parseInt(page, 10) || 1, 1, config.totalPages);
    const pageChanged = target !== state.currentPage;
    const canonicalHash = `#page=${target}`;
    const hasPageHash = /^#page=/i.test(window.location.hash);

    if (state.initialized && !pageChanged) {
      if (options.fromHash && hasPageHash && window.location.hash !== canonicalHash) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}${canonicalHash}`);
      }
      return;
    }

    state.currentPage = target;
    state.initialized = true;
    renderPage({ animate: !options.fromHash && !options.fromGesture, previous: options.previous ?? null });

    if (!options.fromHash && pageChanged) {
      history.pushState(null, "", `${window.location.pathname}${window.location.search}${canonicalHash}`);
    } else if (options.fromHash && hasPageHash && window.location.hash !== canonicalHash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${canonicalHash}`);
    }
  }

  function pagesFor(page = state.currentPage, layout = state.layout) {
    if (layout === "single" || page === 1) return [page];
    const first = page % 2 === 0 ? page : page - 1;
    return [first, first + 1].filter(value => value <= config.totalPages);
  }

  function stepPage(direction) {
    const pages = pagesFor();
    if (direction > 0 && pages.at(-1) >= config.totalPages || direction < 0 && pages[0] <= 1) return state.currentPage;
    if (state.layout === "single") return clamp(state.currentPage + direction, 1, config.totalPages);
    return clamp(direction > 0 ? pages.at(-1) + 1 : pages[0] === 2 ? 1 : pages[0] - 2, 1, config.totalPages);
  }

  function getFit() {
    const rect = elements.sheetSpace.getBoundingClientRect();
    const width = Math.max(1, rect.width || innerWidth - 32);
    const height = Math.max(1, rect.height || innerHeight - 310);
    const ratio = 3507 / 2481;
    const doubleWidth = Math.min(width / 2, height * ratio);
    const layout = state.mode === "auto" ? (doubleWidth >= 680 ? "double" : "single") : state.mode;
    return { layout, width: Math.floor(Math.min(width / (layout === "double" ? 2 : 1), height * ratio)), ratio };
  }

  function settleImageTransition() {
    state.renderer?.settle();
  }

  async function getRenderer() {
    if (state.rendererFailed) return null;
    if (!state.rendererPromise) {
      const url = new URL("js/page-turn-renderer.js", document.baseURI);
      url.searchParams.set("v", SITE_CONFIG.build);
      state.rendererPromise = import(url.href).then(module => {
        state.renderer = module.createPageTurnRenderer({
          container: elements.surface,
          totalPages: config.totalPages,
          onTurn: page => navigateTo(page, { fromGesture: true }),
          canTurn: direction => pagesFor(stepPage(direction)).every(page => pageCache.get(page)?.loaded),
          onUnavailable: () => { state.rendererFailed = true; state.renderer = null; renderPage({ animate: false }); }
        });
        return state.renderer;
      }).catch(() => { state.rendererFailed = true; return null; });
    }
    return state.rendererPromise;
  }

  function trimCache() {
    for (const [page, entry] of pageCache) {
      if (entry.loaded && !state.keepPages.has(page) && !state.displayedPages.includes(page)) pageCache.delete(page);
    }
    elements.viewer.dataset.retainedPages = String(pageCache.size);
  }

  function fallbackSheets(pages) {
    const group = document.createElement("div");
    group.className = "page-turn-fallback";
    for (const page of pages) {
      const sheet = document.createElement("div");
      sheet.className = "portfolio-sheet";
      sheet.dataset.page = page;
      sheet.append(pageCache.get(page).image);
      group.append(sheet);
    }
    elements.surface.style.cssText = "width:100%;height:100%;left:0";
    elements.surface.replaceChildren(group);
    elements.viewer.dataset.renderer = "fallback";
  }

  function loadPageImage(page, priority = "low") {
    if (pageCache.has(page)) {
      const entry = pageCache.get(page);
      if (priority === "high") entry.image.fetchPriority = "high";
      return entry.ready;
    }
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.className = "portfolio-page-image";
    image.dataset.page = page;
    image.draggable = false;
    image.alt = "";
    const ready = new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          if (typeof image.decode === "function") await image.decode();
        } catch (_) { /* A successfully loaded image can still be displayed. */ }
        image.onload = image.onerror = null;
        if (image.naturalWidth) resolve(image);
        else reject(new Error("Image unavailable"));
      };
      image.onerror = () => {
        image.onload = image.onerror = null;
        reject(new Error("Image unavailable"));
      };
    }).catch(error => {
      pageCache.delete(page); // Failed pages can be retried.
      throw error;
    });
    const entry = { image, ready, loaded: false };
    ready.then(() => { entry.loaded = true; trimCache(); }).catch(() => {});
    pageCache.set(page, entry);
    image.src = config.pagePath(page);
    return ready;
  }

  async function renderPage({ animate = false } = {}) {
    const page = state.currentPage;
    const token = ++state.requestToken;
    const fit = getFit();
    state.layout = fit.layout;
    const pages = pagesFor(page);
    const nearby = state.layout === "double"
      ? Array.from({ length: 6 }, (_, index) => pages[0] - 2 + index)
      : Array.from({ length: 7 }, (_, index) => page - 3 + index);
    state.keepPages = new Set(nearby.filter(value => value >= 1 && value <= config.totalPages));
    pages.forEach(value => state.keepPages.add(value));
    window.dispatchEvent(new CustomEvent("portfolio:foreground-load", { detail: { active: true } }));
    settleImageTransition();
    elements.retry.hidden = true;
    elements.viewer.setAttribute("aria-busy", "true");
    elements.status.textContent = `Loading ${pages.length > 1 ? "pages" : "page"} ${pages.map(formatVisiblePage).join("–")}${state.displayedPages.length ? ` · still showing ${state.displayedPages.map(formatVisiblePage).join("–")}` : ""}…`;
    updateInterface(page);
    try {
      await Promise.all(pages.map(value => loadPageImage(value, "high").catch(error => { error.page = value; throw error; })));
      if (token !== state.requestToken) return;
      const renderer = await getRenderer();
      if (token !== state.requestToken) return;
      const previous = state.displayedPages;
      const sameLayout = elements.imageFrame.dataset.layout === state.layout;
      elements.imageFrame.style.width = `${fit.width * pages.length}px`;
      elements.imageFrame.style.height = `${fit.width / fit.ratio}px`;
      for (const [value, entry] of pageCache) {
        entry.image.className = "portfolio-page-image";
        entry.image.dataset.page = value;
        entry.image.draggable = false;
        entry.image.alt = "";
      }
      if (renderer) {
        try {
          renderer.render({ page, double: state.layout === "double", width: fit.width, height: fit.width / fit.ratio,
            images: new Map([...pageCache].filter(([, entry]) => entry.loaded).map(([value, entry]) => [value, entry.image])),
            animate: animate && sameLayout && !prefersReducedMotion() && previous.length > 0 && Math.abs(pages[0] - previous[0]) <= 2 });
          elements.viewer.dataset.renderer = "page-flip";
          renderer.setActive(document.documentElement.dataset.view !== "landing" && !document.hidden);
        } catch (_) {
          renderer.dispose(); state.renderer = null; state.rendererFailed = true;
          fallbackSheets(pages);
        }
      } else fallbackSheets(pages);
      state.displayedPages = pages;
      state.imageReady = true;
      elements.imageFrame.dataset.layout = state.layout;
      elements.imageFrame.dataset.displayedPages = pages.join(",");
      for (const entry of pageCache.values()) entry.image.classList.toggle("is-loaded", pages.includes(Number(entry.image.dataset.page)));
      elements.imageFrame.querySelector(".sheet-seam")?.remove();
      if (pages.length === 2) {
        const seam = document.createElement("span"); seam.className = "sheet-seam";
        elements.imageFrame.append(seam);
      } else elements.imageFrame.querySelector(".sheet-seam")?.remove();
      document.querySelector(".sheet-descriptions").replaceChildren(...pages.map(value => {
        const node = document.createElement("span"); node.setAttribute("role", "img");
        node.setAttribute("aria-label", `Luis Albos Engineering Portfolio, page ${value} of ${config.totalPages}: ${getActiveChapter(value).fullTitle || getActiveChapter(value).title}`);
        return node;
      }));
      document.querySelector(".visible-page-range").textContent = `${pages.map(formatVisiblePage).join("–")} / ${config.totalPages}`;
      elements.status.textContent = `Page ${formatVisiblePage(page)} selected${pages.length > 1 ? ` · showing ${pages.map(formatVisiblePage).join("–")}` : ""}`;
      trimCache();
      preloadAdjacent(page);
    } catch (error) {
      if (token !== state.requestToken) return;
      elements.status.textContent = `Page ${formatVisiblePage(error.page || page)} could not load.${state.displayedPages.length ? ` Still showing ${state.displayedPages.map(formatVisiblePage).join("–")}.` : ""}`;
      elements.retry.hidden = false;
    } finally {
      if (token === state.requestToken) {
        elements.viewer.setAttribute("aria-busy", "false");
        window.dispatchEvent(new CustomEvent("portfolio:foreground-load", { detail: { active: false } }));
      }
    }
  }

  function updateInterface(page) {
    document.querySelectorAll(".current-page-display").forEach(node => { node.textContent = formatVisiblePage(page); });
    document.querySelectorAll(".progress-bar").forEach(bar => { bar.style.width = `${(page / config.totalPages) * 100}%`; });
    elements.pageInput.value = page;
    elements.previous.disabled = pagesFor(page)[0] <= 1;
    elements.next.disabled = pagesFor(page).at(-1) >= config.totalPages;
    elements.viewer.dataset.mode = state.mode;
    elements.viewer.dataset.layout = state.layout;
    document.querySelectorAll("[data-view-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.viewMode === state.mode)));
    document.querySelector("#mode-caption").textContent = state.layout === "double" ? "Two-page view" : "Single-page view";

    const active = getActiveChapter(page);
    document.querySelectorAll(".chapter-link").forEach(link => {
      const isActive = Number(link.dataset.page) === active.startPage;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    updateThumbnailSelection();
    document.title = `${active.fullTitle || active.title} · Page ${formatVisiblePage(page)} — Luis Albos Engineering Portfolio`;
  }

  function loadThumbnailImage(image, page, onMissing) {
    let triedFullSize = false;
    image.addEventListener("error", () => {
      if (!triedFullSize) {
        triedFullSize = true;
        image.src = config.pagePath(page);
        return;
      }
      onMissing();
    });
    image.src = config.thumbnailPath(page);
  }

  function updateThumbnailSelection() {
    if (!state.thumbnailsBuilt) return;
    elements.thumbnailGrid.querySelectorAll(".thumbnail-button").forEach(button => {
      const isActive = Number(button.dataset.page) === state.currentPage;
      button.classList.toggle("is-active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function preloadAdjacent(page) {
    clearTimeout(state.preloadTimer);
    state.preloadTimer = setTimeout(async () => {
      if (page !== state.currentPage || document.documentElement.dataset.view === "landing") return;
      const token = state.requestToken;
      await Promise.all([...state.keepPages].map(value => loadPageImage(value).catch(() => null)));
      if (token !== state.requestToken) return;
      trimCache();
      if (state.renderer && !state.rendererFailed) {
        state.renderer.syncImages(new Map([...pageCache].filter(([, entry]) => entry.loaded).map(([value, entry]) => [value, entry.image])));
      }
    }, 150);
  }

  function openSearch() {
    closeDrawer();
    if (elements.chapters.open) elements.chapters.close();
    renderSearchResults("");
    if (typeof elements.searchDialog.showModal === "function") elements.searchDialog.showModal();
    else elements.searchDialog.setAttribute("open", "");
    requestAnimationFrame(() => elements.searchInput.focus());
    closeDrawer();
  }

  function renderSearchResults(query) {
    const normalized = query.trim().toLowerCase();
    const matches = [];

    config.chapters.forEach(chapter => {
      if (!normalized || chapter.title.toLowerCase().includes(normalized) || chapter.fullTitle?.toLowerCase().includes(normalized) || chapter.roman.toLowerCase() === normalized || String(chapter.startPage) === normalized) {
        matches.push(chapter);
      }
    });

    const pageQuery = Number.parseInt(normalized, 10);
    if (normalized && Number.isInteger(pageQuery) && pageQuery >= 1 && pageQuery <= config.totalPages && !matches.some(item => item.startPage === pageQuery)) {
      const active = getActiveChapter(pageQuery);
      matches.unshift({ roman: active.roman, title: `Page ${formatVisiblePage(pageQuery)} — ${active.fullTitle || active.title}`, startPage: pageQuery, endPage: pageQuery });
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-result";
      button.setAttribute("role", "option");
      const rangeLabel = item.startPage === item.endPage ? `Page ${formatVisiblePage(item.startPage)}` : `Pages ${formatPageRange(item)}`;
      button.innerHTML = `<span>${item.roman}</span><span>${escapeHtml(item.title)}</span><small>${rangeLabel}</small>`;
      button.addEventListener("click", () => {
        navigateTo(item.startPage);
        elements.searchDialog.close();
      });
      fragment.append(button);
    });

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "No matching chapter or page.";
      fragment.append(empty);
    }
    elements.searchResults.replaceChildren(fragment);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  }

  function openDrawer() {
    elements.drawerBackdrop.hidden = false;
    elements.drawer.removeAttribute("inert");
    elements.drawer.setAttribute("aria-hidden", "false");
    elements.menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => elements.drawer.classList.add("is-open"));
    elements.drawerClose.focus();
  }

  function closeDrawer() {
    if (elements.drawer.getAttribute("aria-hidden") === "true") return;
    elements.drawer.classList.remove("is-open");
    elements.drawer.setAttribute("inert", "");
    elements.drawer.setAttribute("aria-hidden", "true");
    elements.menuButton.setAttribute("aria-expanded", "false");
    elements.menuButton.focus({ preventScroll: true });
    document.body.classList.remove("drawer-open");
    window.setTimeout(() => { elements.drawerBackdrop.hidden = true; }, 250);
  }

  async function toggleFullscreen() {
    try {
      closeDrawer();
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      // Some embedded browsers do not allow fullscreen; the viewer remains usable.
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function bindEvents() {
    elements.retry.addEventListener("click", () => renderPage());
    elements.previous.addEventListener("click", () => navigateTo(stepPage(-1)));
    elements.next.addEventListener("click", () => navigateTo(stepPage(1)));
    document.querySelectorAll("[data-view-mode]").forEach(button => button.addEventListener("click", () => {
      if (state.mode === button.dataset.viewMode) return;
      state.mode = button.dataset.viewMode;
      renderPage();
    }));
    document.querySelector(".chapters-button").addEventListener("click", () => elements.chapters.showModal());
    document.querySelector(".chapters-close").addEventListener("click", () => elements.chapters.close());
    elements.chapters.addEventListener("close", () => document.querySelector(".chapters-button").focus({ preventScroll: true }));
    let resizeTimer;
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!state.initialized || document.documentElement.dataset.view === "landing") return;
        const fit = getFit();
        if (fit.layout !== state.layout || Math.abs(parseFloat(elements.imageFrame.style.height || "0") - fit.width / fit.ratio) > 1) renderPage();
      }, 80);
    }).observe(elements.sheetSpace);
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", () => { if (state.initialized) renderPage(); });
    const detailButton = document.querySelector(".detail-button");
    function setDetailScale(value) {
      state.detailScale = clamp(value, 1, 8);
      elements.detailImage.style.width = `${state.detailScale * 100}%`;
      document.querySelector("#detail-out").disabled = state.detailScale === 1;
      document.querySelector("#detail-in").disabled = state.detailScale === 8;
    }
    detailButton.addEventListener("click", async () => {
      const page = state.currentPage;
      try {
        const image = await loadPageImage(page, "high");
        if (page !== state.currentPage) return;
        elements.detailImage.src = image.src;
        elements.detailImage.alt = `Page ${page}: ${getActiveChapter(page).fullTitle || getActiveChapter(page).title}`;
        document.querySelector("#detail-title").textContent = `Page ${formatVisiblePage(page)} detail`;
        setDetailScale(1); elements.detail.showModal();
      } catch (_) { elements.status.textContent = `Page ${formatVisiblePage(page)} could not load. Use Retry or choose another page.`; elements.retry.hidden = false; }
    });
    document.querySelector("#detail-in").addEventListener("click", () => setDetailScale(state.detailScale * 2));
    document.querySelector("#detail-out").addEventListener("click", () => setDetailScale(state.detailScale / 2));
    document.querySelector("#detail-reset").addEventListener("click", () => setDetailScale(1));
    document.querySelector("#detail-close").addEventListener("click", () => elements.detail.close());
    elements.detail.addEventListener("close", () => { elements.detailImage.removeAttribute("src"); detailButton.focus({ preventScroll: true }); });
    elements.searchDialog.addEventListener("close", () => document.querySelector(".chapters-button").focus({ preventScroll: true }));
    elements.pageInput.closest("form").addEventListener("submit", event => {
      event.preventDefault();
      navigateTo(elements.pageInput.value);
      elements.pageInput.blur();
    });
    elements.pageInput.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      navigateTo(elements.pageInput.value);
      elements.pageInput.blur();
    });
    elements.pageInput.addEventListener("change", () => navigateTo(elements.pageInput.value));

    document.querySelectorAll(".thumbnails-button").forEach(button => button.addEventListener("click", () => toggleThumbnails()));
    document.querySelectorAll(".search-button").forEach(button => button.addEventListener("click", openSearch));
    document.querySelectorAll(".fullscreen-button").forEach(button => button.addEventListener("click", toggleFullscreen));
    elements.searchInput.addEventListener("input", event => renderSearchResults(event.target.value));

    elements.menuButton.addEventListener("click", openDrawer);
    elements.drawerClose.addEventListener("click", closeDrawer);
    elements.drawerBackdrop.addEventListener("click", closeDrawer);
    elements.drawer.querySelectorAll("a").forEach(link => link.addEventListener("click", closeDrawer));

    window.addEventListener("hashchange", () => {
      const page = getPageFromHash();
      if (page !== null) navigateTo(page, { fromHash: true });
      else if (!window.location.hash) navigateTo(config.initialPage, { fromHash: true });
    });

    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (!isTyping && !elements.searchDialog.open && !elements.chapters.open && !elements.detail.open && elements.drawer.getAttribute("aria-hidden") !== "false" && !document.querySelector("#portfolio-viewer").inert) {
        if (event.key === "ArrowLeft") { event.preventDefault(); navigateTo(stepPage(-1)); }
        if (event.key === "ArrowRight") { event.preventDefault(); navigateTo(stepPage(1)); }
      }
      if (event.key === "Escape") closeDrawer();
    });

    document.addEventListener("fullscreenchange", () => {
      document.querySelectorAll(".fullscreen-button").forEach(button => {
        button.setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
      });
    });
    let fallbackPointer;
    elements.imageFrame.addEventListener("pointerdown", event => {
      if (state.rendererFailed) fallbackPointer = { x: event.clientX, y: event.clientY };
    });
    elements.imageFrame.addEventListener("pointerup", event => {
      if (!fallbackPointer) return;
      const dx = event.clientX - fallbackPointer.x, dy = event.clientY - fallbackPointer.y;
      fallbackPointer = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) navigateTo(stepPage(dx < 0 ? 1 : -1));
    });
    elements.imageFrame.addEventListener("pointercancel", () => { fallbackPointer = null; });
  }

  applyConfiguration();
  buildChapterNavigation();
  bindEvents();
  window.addEventListener('portfolio:open',()=>{
    if(!state.initialized)navigateTo(getPageFromHash()||config.initialPage,{fromHash:true});
    else renderPage();
  });
  new MutationObserver(() => {
    const active = document.documentElement.dataset.view !== 'landing' && !document.hidden;
    state.renderer?.setActive(active);
    if (!active) clearTimeout(state.preloadTimer);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-view'] });
  document.addEventListener('visibilitychange', () => state.renderer?.setActive(!document.hidden && document.documentElement.dataset.view !== 'landing'));
  window.addEventListener('pagehide', () => state.renderer?.setActive(false));
  if(document.documentElement.dataset.view==='viewer')navigateTo(getPageFromHash()||config.initialPage,{fromHash:true});
})();
