# Cold aircraft delivery check

Profile: local Chrome headless, fresh browser context and empty Cache Storage;
CDP network emulation at 2.5 MB/s down, 0.5 MB/s up, 180 ms latency;
4× CPU throttling. Static site served under `/engineering-portfolio/`.
`landing-scene.js` was instrumented in the test response for parse and first
render timestamps; the repository source was unchanged by that instrumentation.
Times are from navigation start except the transfer and parse durations.

| Model transfer | Bytes | Transfer | GLTF parse | First valid frame | Landing reveal |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original `CP1_2024.glb` | 36,105,032 | 19.31 s | 0.226 s | 39.28 s | 15 s ceiling |
| Gzip `CP1_2024.glb.gz` | 13,959,440 | 10.41 s | 0.214 s | 30.67 s | 15.27 s, timeout |

The gzip saves 61.3% of model transfer bytes and 8.61 s to the first frame
in this paired local profile. The 15-second reveal stays usable while the
scene continues to build. The decoded gzip and original GLB have identical
SHA-256 `7ccc5f7e728c4c8780f15e1c5e4add07020f7f9e6f3f3991462b2428f6ae537f`.
GLTFLoader receives identical bytes, so the propeller node and sketch geometry
are unchanged. The uncompressed URL is retained as a browser/transfer fallback.

This is a representative local simulation, not a measurement on an actual
managed corporate VPN, device, or production Pages CDN. The remaining
~19-second gap after compressed transfer is primarily scene preparation and
GPU work under 4× CPU throttling; gzip does not remove that cost.
