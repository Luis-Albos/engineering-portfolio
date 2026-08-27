(() => {
  "use strict";

  const config = window.SITE_CONFIG;
  const resumePdf = document.querySelector("#resume-pdf");
  const drawer = document.querySelector("#mobile-drawer");
  const drawerBackdrop = document.querySelector("#drawer-backdrop");
  const menuButton = document.querySelector("#menu-button");
  const drawerClose = document.querySelector(".drawer-close");

  document.querySelectorAll(".resume-asset-link").forEach(link => { link.href = config.resumeAssetUrl; });
  document.querySelectorAll(".linkedin-link").forEach(link => { link.href = config.links.linkedin; });
  document.querySelectorAll(".email-link").forEach(link => { link.href = config.links.email; });
  document.querySelectorAll(".github-link").forEach(link => { link.href = config.links.github; });
  resumePdf.data = config.resumeAssetUrl;

  function openDrawer() {
    drawerBackdrop.hidden = false;
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    drawerClose.focus();
  }

  function closeDrawer() {
    if (drawer.getAttribute("aria-hidden") === "true") return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    window.setTimeout(() => { drawerBackdrop.hidden = true; }, 250);
  }

  menuButton.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  drawer.querySelectorAll("a").forEach(link => link.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });
})();
