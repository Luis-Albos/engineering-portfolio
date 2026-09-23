/* Shared Study Archive paths, session state, and access-sequence timing. */
const archiveBuild = document.documentElement.dataset.build;
window.RESOURCE_ARCHIVE_CONFIG = Object.freeze({
  build: archiveBuild,
  manifestUrl: `../assets/study-manifest.json?v=${encodeURIComponent(archiveBuild)}`,
  sessionKey: "luis-albos-study-archive-access",
  requestDuration: 1800,
  grantedDuration: 800,
  fadeDuration: 190
});
