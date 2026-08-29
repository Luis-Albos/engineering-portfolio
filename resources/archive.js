(() => {
  "use strict";

  const config = window.RESOURCE_ARCHIVE_CONFIG;
  const state = { manifest: null, activeClass: "all", query: "", selectedId: null, accessPending: false };
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const elements = {
    lock: document.querySelector("#archive-lock"),
    lockPanel: document.querySelector(".lock-panel"),
    shell: document.querySelector("#archive-shell"),
    requestAccess: document.querySelector("#request-access"),
    accessLabel: document.querySelector("#access-button-label"),
    accessSymbol: document.querySelector("#access-symbol"),
    accessAnnouncement: document.querySelector("#access-announcement"),
    search: document.querySelector("#resource-search"),
    filters: document.querySelector("#class-filters"),
    mobileFilter: document.querySelector("#mobile-class-filter"),
    library: document.querySelector("#resource-library"),
    loading: document.querySelector("#library-loading"),
    visibleCount: document.querySelector("#visible-count"),
    libraryTitle: document.querySelector("#resource-library-title"),
    selectedEmpty: document.querySelector("#selected-empty"),
    selectedDocument: document.querySelector("#selected-document"),
    selectedPreview: document.querySelector("#selected-preview"),
    selectedClass: document.querySelector("#selected-class"),
    selectedTitle: document.querySelector("#selected-title"),
    selectedPages: document.querySelector("#selected-pages"),
    selectedSize: document.querySelector("#selected-size"),
    selectedOpen: document.querySelector("#selected-open"),
    drawer: document.querySelector("#mobile-drawer"),
    drawerBackdrop: document.querySelector("#drawer-backdrop"),
    menuButton: document.querySelector("#menu-button"),
    drawerClose: document.querySelector(".drawer-close")
  };

  function hasSessionAccess() {
    try { return sessionStorage.getItem(config.sessionKey) === "true"; }
    catch { return false; }
  }

  function grantSessionAccess() {
    try { sessionStorage.setItem(config.sessionKey, "true"); }
    catch { /* The current page remains unlocked even if storage is unavailable. */ }
  }

  function delay(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
  }

  function showArchive({ animate = true } = {}) {
    const shouldAnimate = animate && !motionQuery.matches;
    const fadeDuration = shouldAnimate ? config.fadeDuration : 0;
    if (shouldAnimate) elements.lock.classList.add("is-exiting");
    window.setTimeout(() => {
      elements.lock.hidden = true;
      elements.shell.hidden = false;
      if (shouldAnimate) elements.shell.classList.add("is-entering");
      document.querySelector("#archive-library").focus({ preventScroll: true });
      window.setTimeout(() => elements.shell.classList.remove("is-entering"), config.fadeDuration);
    }, fadeDuration);
  }

  async function requestArchiveAccess() {
    if (state.accessPending) return;
    state.accessPending = true;
    elements.requestAccess.disabled = true;
    elements.lockPanel.classList.add("is-requesting");
    elements.accessLabel.textContent = "Requesting...";
    elements.accessSymbol.textContent = "";
    elements.accessAnnouncement.textContent = "Requesting access";

    const manifestReady = loadManifest();
    await delay(motionQuery.matches ? 160 : config.requestDuration);

    elements.lockPanel.classList.remove("is-requesting");
    elements.lockPanel.classList.add("is-granted");
    elements.accessLabel.textContent = "Access Granted";
    elements.accessSymbol.textContent = "✓";
    elements.accessAnnouncement.textContent = "Access granted";
    grantSessionAccess();

    await Promise.all([manifestReady, delay(motionQuery.matches ? 160 : config.grantedDuration)]);
    showArchive();
  }

  function assetUrl(path) {
    return new URL(`../${path}`, window.location.href).href;
  }

  function viewerUrl(documentId) {
    return `viewer.html?doc=${encodeURIComponent(documentId)}`;
  }

  function formatSize(bytes) {
    if (!Number.isFinite(bytes)) return "Unavailable";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
    return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
  }

  function pageLabel(pageCount) {
    if (!Number.isFinite(pageCount)) return "Pages unavailable";
    return `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
  }

  function makeThumbnail(document, large = false) {
    const frame = documentCreate("div", `document-thumbnail${large ? " is-large" : ""}`);
    if (document.thumbnailPath) {
      const image = new Image();
      image.loading = "lazy";
      image.alt = `First page of ${document.title}`;
      image.src = assetUrl(document.thumbnailPath);
      image.addEventListener("error", () => frame.classList.add("is-placeholder"), { once: true });
      frame.append(image);
    } else {
      frame.classList.add("is-placeholder");
    }
    const placeholder = documentCreate("span", "pdf-placeholder", "PDF");
    placeholder.setAttribute("aria-hidden", "true");
    frame.append(placeholder);
    return frame;
  }

  function documentCreate(tag, className, text) {
    const node = window.document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function allDocuments() {
    return (state.manifest?.classes || []).flatMap(classItem =>
      classItem.documents.map(document => ({ ...document, classItem }))
    );
  }

  function matches(document, classItem) {
    const query = state.query.trim().toLocaleLowerCase();
    if (state.activeClass !== "all" && classItem.id !== state.activeClass) return false;
    if (!query) return true;
    return `${classItem.folderName} ${classItem.displayName} ${classItem.description} ${classItem.semester || ""} ${(classItem.tags || []).join(" ")} ${document.title}`
      .toLocaleLowerCase()
      .includes(query);
  }

  function buildFilters() {
    elements.filters.replaceChildren();
    elements.mobileFilter.replaceChildren();
    const options = [{ id: "all", label: "All Classes", count: state.manifest.resourceCount }]
      .concat(state.manifest.classes.map(item => ({ id: item.id, label: item.displayName, count: item.resourceCount })));

    options.forEach(option => {
      const button = documentCreate("button", "class-filter");
      button.type = "button";
      button.dataset.classId = option.id;
      button.setAttribute("aria-pressed", String(option.id === state.activeClass));
      button.append(documentCreate("span", "class-filter-label", option.label), documentCreate("span", "class-filter-count", String(option.count)));
      elements.filters.append(button);

      const selectOption = documentCreate("option", "", `${option.label} (${option.count})`);
      selectOption.value = option.id;
      elements.mobileFilter.append(selectOption);
    });
  }

  function createDocumentCard(document, classItem) {
    const card = documentCreate("article", "resource-card");
    card.tabIndex = 0;
    card.dataset.documentId = document.id;
    if (document.id === state.selectedId) card.classList.add("is-selected");
    card.setAttribute("aria-label", `${document.title}, ${classItem.displayName}, ${pageLabel(document.pageCount)}`);
    card.append(makeThumbnail(document));

    const body = documentCreate("div", "resource-card-body");
    body.append(documentCreate("p", "resource-type", "PDF / Reference"), documentCreate("h3", "", document.title));
    const footer = documentCreate("div", "resource-card-footer");
    footer.append(documentCreate("span", "", pageLabel(document.pageCount)), documentCreate("span", "", formatSize(document.fileSizeBytes)));
    const open = documentCreate("a", "card-open", "Open PDF ↗");
    open.href = viewerUrl(document.id);
    open.setAttribute("aria-label", `Open ${document.title}`);
    footer.append(open);
    body.append(footer);
    card.append(body);

    const select = () => mobileQuery.matches ? window.location.assign(open.href) : selectDocument(document.id);
    card.addEventListener("click", event => { if (!event.target.closest("a")) select(); });
    card.addEventListener("keydown", event => {
      if (event.target.closest("a")) return;
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }
    });
    return card;
  }

  function renderLibrary() {
    if (!state.manifest) return;
    elements.library.replaceChildren();
    let visibleCount = 0;

    state.manifest.classes.forEach(classItem => {
      const documents = classItem.documents.filter(document => matches(document, classItem));
      if (!documents.length) return;
      visibleCount += documents.length;

      const section = documentCreate("details", "class-section");
      section.open = true;
      const summary = documentCreate("summary", "class-section-header");
      const heading = documentCreate("div");
      heading.append(documentCreate("p", "archive-kicker", "Class / Reference Set"), documentCreate("h2", "", classItem.displayName));
      if (classItem.description) heading.append(documentCreate("p", "class-description", classItem.description));
      const count = documentCreate("span", "section-count", `${documents.length} ${documents.length === 1 ? "Resource" : "Resources"}`);
      summary.append(heading, count);
      section.append(summary);

      const grid = documentCreate("div", "resource-grid");
      documents.forEach(document => grid.append(createDocumentCard(document, classItem)));
      section.append(grid);
      elements.library.append(section);
    });

    elements.visibleCount.textContent = String(visibleCount);
    const active = state.manifest.classes.find(item => item.id === state.activeClass);
    elements.libraryTitle.textContent = active?.displayName || "All Classes";

    if (!visibleCount) {
      const empty = documentCreate("div", "archive-empty");
      empty.append(
        documentCreate("p", "archive-kicker", state.manifest.resourceCount ? "No Matches" : "Archive Ready"),
        documentCreate("h2", "", state.manifest.resourceCount ? "No resources match this search." : "The library is currently empty."),
        documentCreate("p", "", state.manifest.resourceCount
          ? "Try another class filter or a broader search term."
          : "Create a class folder under assets/study and add PDFs. The next build will populate this page automatically.")
      );
      elements.library.append(empty);
    }
  }

  function selectDocument(documentId) {
    const record = allDocuments().find(document => document.id === documentId);
    if (!record) return;
    state.selectedId = documentId;
    document.querySelectorAll(".resource-card").forEach(card => card.classList.toggle("is-selected", card.dataset.documentId === documentId));
    elements.selectedEmpty.hidden = true;
    elements.selectedDocument.hidden = false;
    elements.selectedPreview.replaceChildren(makeThumbnail(record, true));
    elements.selectedClass.textContent = record.classItem.displayName;
    elements.selectedTitle.textContent = record.title;
    elements.selectedPages.textContent = pageLabel(record.pageCount);
    elements.selectedSize.textContent = formatSize(record.fileSizeBytes);
    elements.selectedOpen.href = viewerUrl(record.id);
  }

  function setClassFilter(classId) {
    state.activeClass = classId;
    elements.mobileFilter.value = classId;
    elements.filters.querySelectorAll(".class-filter").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.classId === classId));
    });
    renderLibrary();
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

  async function loadManifest() {
    elements.loading.hidden = false;
    try {
      const response = await fetch(config.manifestUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Manifest request failed (${response.status})`);
      state.manifest = await response.json();
      if (!Array.isArray(state.manifest.classes)) throw new Error("Manifest is missing its classes list");
      buildFilters();
      renderLibrary();
    } catch (error) {
      console.error(error);
      elements.library.replaceChildren();
      const failure = documentCreate("div", "archive-empty");
      failure.append(
        documentCreate("p", "archive-kicker", "Manifest Unavailable"),
        documentCreate("h2", "", "The study library could not be loaded."),
        documentCreate("p", "", "Run the archive build script, then reload this page from a local web server.")
      );
      elements.library.append(failure);
    } finally {
      elements.loading.hidden = true;
    }
  }

  elements.requestAccess.addEventListener("click", requestArchiveAccess);
  elements.search.addEventListener("input", () => { state.query = elements.search.value; renderLibrary(); });
  elements.filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-class-id]");
    if (button) setClassFilter(button.dataset.classId);
  });
  elements.mobileFilter.addEventListener("change", () => setClassFilter(elements.mobileFilter.value));
  elements.menuButton.addEventListener("click", openDrawer);
  elements.drawerClose.addEventListener("click", closeDrawer);
  elements.drawerBackdrop.addEventListener("click", closeDrawer);
  elements.drawer.querySelectorAll("a").forEach(link => link.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });

  if (hasSessionAccess()) {
    showArchive({ animate: false });
    loadManifest();
  } else {
    elements.requestAccess.focus();
  }
})();
