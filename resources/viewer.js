(() => {
  "use strict";

  const config = window.RESOURCE_ARCHIVE_CONFIG;
  const elements = {
    title: document.querySelector("#viewer-title"),
    className: document.querySelector("#viewer-class"),
    pdf: document.querySelector("#study-pdf"),
    message: document.querySelector("#viewer-message"),
    open: document.querySelector("#viewer-open"),
    fallbackOpen: document.querySelector("#viewer-fallback-open")
  };

  function hasSessionAccess() {
    try { return sessionStorage.getItem(config.sessionKey) === "true"; }
    catch { return false; }
  }

  if (!hasSessionAccess()) {
    window.location.replace("./");
    return;
  }

  const documentId = new URLSearchParams(window.location.search).get("doc");
  if (!documentId) {
    showError("No study document was selected.");
    return;
  }

  fetch(config.manifestUrl, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`Manifest request failed (${response.status})`);
      return response.json();
    })
    .then(manifest => {
      for (const classItem of manifest.classes || []) {
        const document = (classItem.documents || []).find(item => item.id === documentId);
        if (!document) continue;
        const pdfUrl = new URL(`../${document.path}`, window.location.href).href;
        documentTitle(document.title);
        elements.className.textContent = classItem.displayName;
        elements.pdf.data = pdfUrl;
        elements.pdf.setAttribute("aria-label", `${document.title} PDF`);
        elements.open.href = pdfUrl;
        elements.fallbackOpen.href = pdfUrl;
        elements.message.hidden = true;
        elements.pdf.hidden = false;
        return;
      }
      showError("This document is no longer present in the archive manifest.");
    })
    .catch(error => {
      console.error(error);
      showError("The study document could not be loaded.");
    });

  function documentTitle(title) {
    elements.title.textContent = title;
    window.document.title = `${title} - Study Archive`;
  }

  function showError(message) {
    elements.message.textContent = message;
    elements.message.classList.add("is-error");
    elements.open.hidden = true;
  }
})();
