/* Shared paths and external links. Keep project assets relative for subdirectory hosting. */
window.SITE_CONFIG = Object.freeze({
  build: document.documentElement.dataset.build,
  resumePageUrl: "resume.html",
  resumeAssetUrl: `assets/portfolio/Luis_Albos_Resume.pdf?v=${encodeURIComponent(document.documentElement.dataset.build)}`,
  links: Object.freeze({
    linkedin: "https://www.linkedin.com/in/luis-albos",
    email: "mailto:luis.e.albos@gmail.com"
  })
});
