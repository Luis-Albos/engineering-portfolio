# Independent packaged-artifact verification

**PASS. Open:** http://127.0.0.1:8767/engineering-portfolio/

Artifact: `C:/Users/Letzel/AppData/Local/Temp/portfolio-flipbook-build-20261109-03-r2/engineering-portfolio`.

Build `20261109-03`; product VERSION `1.2.1`. Receipt SHA-256: `db884ed7229567a21f617f924c51e6ddda6114f174459df882b96c490c76f809`.

- Recomputed all **147 listed public-file hashes**: zero mismatches. Disk contains those 147 files plus `_artifact.json`. No unlisted files, Node dependencies, Git, tests, OpenSpec, development scripts, source CAD, or video payloads were present. Local HTML src/href/data/poster references resolved with zero missing targets.
- Fresh headless Chrome **156.0.8078.80** exercised the actual packaged server. Desktop 1920x1080 Auto showed the centered cover and 4-5. Selected 5 survived Single/Double/Auto, resize to 390x844, and forced narrow Double without overflow or new history. Detail zoom/Escape restored focus; search selected 23; final 30-31 rendered with Next disabled. Packaged screenshots were visually inspected.
- Home reused the same aircraft canvas, with model requests unchanged 1->1. Resume initialized its PDF URL. Its real byte-range request returned **206**, `Content-Range: bytes 0-31/99985`, with a valid `%PDF-` signature.
- Resources access opened the generated **10 classes / 21 document cards**. A real selected study PDF returned **206**, `Content-Range: bytes 0-31/950608`, exactly 32 bytes, beginning `%PDF-`.
- **121 HTTP runtime requests**, zero outside the preview origin, and zero uncaught page errors in the completed final run. Measured test stage: **13.450 seconds**.

The first artifact omitted `resume.js` although `resume.html` referenced it; independent smoke caught the broken Resume initialization. The packager correction was verified in r2 through both the static-reference scan and real Resume navigation/PDF request. The original receipt hash was `e9261f79475b96ea0aa9afe581819b9c9eb9d4db8fbce88578c3082a14b7a435`.

Ports 8765/8766 used a Python development server that ignored Range headers and returned 200. This was a preview-server limitation. Final port 8767 uses the existing browser-test-server.cjs with the artifact root and passed both range checks. Artifact runtime bytes and receipt hash were unchanged by that server switch.

Evidence: `packaged-artifact-report.json`; `packaged-desktop-spread-4-5.png`; `packaged-phone-forced-double.png`; `packaged-resources-21-documents.png`. The executable temporary smoke is `C:/Users/Letzel/AppData/Local/Temp/portfolio-packaged-review.cjs`.

This verifies the local prepared artifact, not production publication or a merge. Physical hidden-tab throttling remains unobserved; the earlier independent source report documents its synthetic visibility-handler check and other browser/device limits. No repository or artifact files were modified by this reviewer.
