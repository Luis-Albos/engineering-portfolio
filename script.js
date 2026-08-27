/*
 * PORTFOLIO CONFIGURATION
 * Edit this object to change pages, chapters, file locations, and links.
 * All page numbers here are the same one-based numbers visitors see.
 */
const pageAssetPath = (folder, page) => `${folder}/page-${String(page).padStart(2, "0")}.webp`;

const portfolioConfig = {
  totalPages: 31,
  initialPage: 1,
  pagePath: page => pageAssetPath("assets/portfolio", page),
  thumbnailPath: page => pageAssetPath("assets/thumbnails", page),
  pdfUrl: "assets/Luis_Albos_Engineering_Portfolio.pdf",
  resumeUrl: "assets/Luis_Albos_Resume.pdf",
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
  links: {
    linkedin: "https://www.linkedin.com/in/luis-albos",
    email: "mailto:luis.e.albos@gmail.com",
    github: "https://github.com/YOUR-USERNAME" // Replace when a GitHub profile is available.
  }
};

(() => {
  "use strict";

  const config = normalizeConfig(portfolioConfig);
  const state = {
    currentPage: getPageFromHash() || config.initialPage,
    requestToken: 0,
    thumbnailsBuilt: false,
    touchStartX: 0,
    touchStartY: 0
  };

  const elements = {
    pageImage: document.querySelector("#portfolio-page"),
    imageFrame: document.querySelector("#image-frame"),
    fallback: document.querySelector("#page-fallback"),
    fallbackNumber: document.querySelector(".fallback-page-number"),
    fallbackCode: document.querySelector(".fallback-copy code"),
    fallbackIndex: document.querySelector(".fallback-index"),
    pageInput: document.querySelector("#page-input"),
    previous: document.querySelector(".previous-button"),
    next: document.querySelector(".next-button"),
    chapterNavs: document.querySelectorAll(".chapter-nav"),
    thumbnailGrid: document.querySelector(".thumbnail-grid"),
    currentThumbnail: document.querySelector(".current-thumbnail"),
    thumbnailMedia: document.querySelector(".current-thumbnail .thumbnail-media"),
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
    document.querySelectorAll(".pdf-link").forEach(link => { link.href = config.pdfUrl; });
    document.querySelectorAll(".resume-link").forEach(link => { link.href = config.resumeUrl; });
    document.querySelectorAll(".linkedin-link").forEach(link => { link.href = config.links.linkedin; });
    document.querySelectorAll(".email-link").forEach(link => { link.href = config.links.email; });
    document.querySelectorAll(".github-link").forEach(link => { link.href = config.links.github; });
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
      button.addEventListener("click", () => navigateTo(page));
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
  }

  function navigateTo(page, options = {}) {
    const target = clamp(Number.parseInt(page, 10) || 1, 1, config.totalPages);
    state.currentPage = target;
    renderPage();
    const canonicalHash = `#page=${target}`;
    if (!options.fromHash || window.location.hash !== canonicalHash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${canonicalHash}`);
    }
  }

  function renderPage() {
    const page = state.currentPage;
    const pagePath = config.pagePath(page);
    const token = ++state.requestToken;

    elements.imageFrame.classList.add("is-loading");
    elements.imageFrame.style.setProperty("--page-ratio", "1.6");
    elements.pageImage.classList.remove("is-loaded");
    elements.fallback.hidden = true;
    elements.pageImage.removeAttribute("src");

    updateInterface(page);

    const loader = new Image();
    loader.decoding = "async";
    loader.onload = async () => {
      if (token !== state.requestToken) return;
      try { await loader.decode(); } catch (_) { /* The image is still usable. */ }
      if (token !== state.requestToken) return;
      elements.pageImage.src = pagePath;
      elements.pageImage.alt = `Luis Albos Engineering Portfolio, page ${formatVisiblePage(page)} of ${config.totalPages}: ${getActiveChapter(page).fullTitle || getActiveChapter(page).title}`;
      elements.imageFrame.style.setProperty("--page-ratio", String(loader.naturalWidth / loader.naturalHeight));
      requestAnimationFrame(() => elements.pageImage.classList.add("is-loaded"));
      elements.imageFrame.classList.remove("is-loading");
      updateCurrentThumbnail(page);
      preloadAdjacent(page);
    };
    loader.onerror = () => {
      if (token !== state.requestToken) return;
      showFallback(page, pagePath);
      preloadAdjacent(page);
    };
    loader.src = pagePath;
  }

  function showFallback(page, pagePath) {
    elements.pageImage.removeAttribute("src");
    elements.pageImage.alt = "";
    elements.fallback.hidden = false;
    elements.fallbackNumber.textContent = page;
    elements.fallbackIndex.textContent = getActiveChapter(page).roman || formatVisiblePage(page);
    elements.fallbackCode.textContent = pagePath.split("/").pop();
    elements.imageFrame.style.setProperty("--page-ratio", "1.6");
    elements.imageFrame.classList.remove("is-loading");
    updateCurrentThumbnail(page);
  }

  function updateInterface(page) {
    document.querySelectorAll(".current-page-display").forEach(node => { node.textContent = formatVisiblePage(page); });
    document.querySelectorAll(".current-page-padded").forEach(node => { node.textContent = formatVisiblePage(page); });
    document.querySelectorAll(".progress-bar").forEach(bar => { bar.style.width = `${(page / config.totalPages) * 100}%`; });
    elements.pageInput.value = page;
    elements.previous.disabled = page <= 1;
    elements.next.disabled = page >= config.totalPages;

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

  function updateCurrentThumbnail(page) {
    elements.thumbnailMedia.replaceChildren();
    elements.thumbnailMedia.classList.remove("is-missing");
    elements.thumbnailMedia.dataset.page = formatVisiblePage(page);

    const image = new Image();
    image.alt = "";
    loadThumbnailImage(image, page, () => {
      elements.thumbnailMedia.classList.add("is-missing");
      image.remove();
    });
    elements.thumbnailMedia.append(image);
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
    [page - 1, page + 1].filter(value => value >= 1 && value <= config.totalPages).forEach(value => {
      const image = new Image();
      image.src = config.pagePath(value);
    });
  }

  function openSearch() {
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
    elements.previous.addEventListener("click", () => navigateTo(state.currentPage - 1));
    elements.next.addEventListener("click", () => navigateTo(state.currentPage + 1));
    elements.pageInput.closest("form").addEventListener("submit", event => {
      event.preventDefault();
      navigateTo(elements.pageInput.value);
      elements.pageInput.blur();
    });
    elements.pageInput.addEventListener("change", () => navigateTo(elements.pageInput.value));

    document.querySelectorAll(".thumbnails-button").forEach(button => button.addEventListener("click", () => toggleThumbnails()));
    elements.currentThumbnail.addEventListener("click", () => toggleThumbnails(true));
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
    });

    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (!isTyping && !elements.searchDialog.open) {
        if (event.key === "ArrowLeft") { event.preventDefault(); navigateTo(state.currentPage - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); navigateTo(state.currentPage + 1); }
      }
      if (event.key === "Escape") closeDrawer();
    });

    elements.imageFrame.addEventListener("touchstart", event => {
      state.touchStartX = event.changedTouches[0].clientX;
      state.touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });
    elements.imageFrame.addEventListener("touchend", event => {
      const deltaX = event.changedTouches[0].clientX - state.touchStartX;
      const deltaY = event.changedTouches[0].clientY - state.touchStartY;
      if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        navigateTo(state.currentPage + (deltaX < 0 ? 1 : -1));
      }
    }, { passive: true });

    document.addEventListener("fullscreenchange", () => {
      document.querySelectorAll(".fullscreen-button").forEach(button => {
        button.setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
      });
    });
  }

  applyConfiguration();
  buildChapterNavigation();
  bindEvents();
  navigateTo(state.currentPage, { fromHash: true });
})();
