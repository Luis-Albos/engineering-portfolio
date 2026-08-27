(() => {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionDuration = 190;
  let navigationPending = false;
  let sectionTimer;

  function reducedMotion() {
    return motionQuery.matches;
  }

  function clearTransitionState() {
    navigationPending = false;
    document.body.classList.remove("is-leaving", "is-section-transitioning");
  }

  function pulseSectionTransition() {
    if (reducedMotion()) return;
    window.clearTimeout(sectionTimer);
    document.body.classList.add("is-section-transitioning");
    sectionTimer = window.setTimeout(() => document.body.classList.remove("is-section-transitioning"), transitionDuration);
  }

  document.body.addEventListener("animationend", event => {
    if (event.animationName === "page-enter") document.body.classList.remove("page-enter");
  }, { once: true });

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.target === "_blank") return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    const sameDocument = destination.pathname === window.location.pathname && destination.search === window.location.search;
    if (sameDocument) {
      if (destination.hash === window.location.hash) event.preventDefault();
      pulseSectionTransition();
      return;
    }

    if (navigationPending) {
      event.preventDefault();
      return;
    }

    if (reducedMotion()) return;

    event.preventDefault();
    navigationPending = true;
    document.body.classList.add("is-leaving");
    window.setTimeout(() => window.location.assign(destination.href), transitionDuration);
  });

  window.addEventListener("pageshow", event => {
    clearTransitionState();
    if (event.persisted && !reducedMotion()) {
      document.body.classList.remove("page-enter");
      requestAnimationFrame(() => document.body.classList.add("page-enter"));
    }
  });
})();
