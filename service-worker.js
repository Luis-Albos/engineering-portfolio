// Scope is the GitHub Pages project subpath; the version arrives in the registration URL.
const version=new URL(self.location.href).searchParams.get('v')||'unknown';
const prefix='luis-albos-engineering-portfolio-assets-';
const cacheName=prefix+version;
const scopePath=new URL(self.registration.scope).pathname;

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(event.data?.type!=='cleanup'||event.data.version!==version)return;
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(prefix)&&name!==cacheName).map(name=>caches.delete(name)));
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.mode==='navigate'||request.headers.has('range'))return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(scopePath))return;
  if(url.pathname.endsWith('/service-worker.js')||url.pathname.endsWith('/version.json'))return;
  if(!/\.(?:css|js|json|svg|webp|png|glb|glb\.gz|pdf|woff2?)$/i.test(url.pathname))return;
  event.respondWith((async()=>{
    let cache=null;
    try{cache=await caches.open(cacheName);const hit=await cache.match(request);if(hit)return hit;}catch(_){/* Denied storage uses the network. */}
    const response=await fetch(request);
    if(cache&&response.ok)event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
    return response;
  })());
});
