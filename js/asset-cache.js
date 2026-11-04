// Persistent, best-effort cache for large same-origin portfolio assets.
const build=document.documentElement.dataset.build;
const base=new URL('../',import.meta.url);
const cacheName=`luis-albos-engineering-portfolio-assets-${build}`;
let started=false,foregroundBusy=false,currentFetch=null;

const assetUrl=path=>{const url=new URL(path,base);url.searchParams.set('v',build);return url.href;};
async function openCache(){try{return 'caches' in window?await caches.open(cacheName):null;}catch(_){return null;}}

export async function fetchModel(url,{signal}={}){
  const cache=await openCache();
  const compressed=new URL(url);compressed.pathname+='.gz';
  async function load(candidate,gunzip){
    let response=null;
    try{response=await cache?.match(candidate.href);}catch(_){/* Storage denial uses the network. */}
    if(!response){
      response=await fetch(candidate.href,{signal,priority:'high'});
      if(!response.ok)throw new Error('Aircraft GLB unavailable');
      if(cache)void cache.put(candidate.href,response.clone()).catch(()=>{});
    }
    const buffer=gunzip
      ?await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      :await response.arrayBuffer();
    signal?.throwIfAborted();return buffer;
  }
  if(typeof DecompressionStream==='function'){
    try{return await load(compressed,true);}
    catch(error){if(signal?.aborted)throw error;try{await cache?.delete(compressed.href);}catch(_){} }
  }
  return load(new URL(url),false);
}

async function registerWorker(){
  if(!('serviceWorker' in navigator))return;
  try{
    const url=new URL('../service-worker.js',import.meta.url);url.searchParams.set('v',build);
    await navigator.serviceWorker.register(url,{scope:base.pathname});
    const registration=await navigator.serviceWorker.ready;
    registration.active?.postMessage({type:'cleanup',version:build});
  }catch(_){/* Direct network loading remains available. */}
}

async function preloadAsset(cache,url){
  if(await cache.match(url))return;
  currentFetch=new AbortController();
  try{
    const response=await fetch(url,{signal:currentFetch.signal,priority:'low'});
    if(response.ok)await cache.put(url,response);
  }finally{currentFetch=null;}
}

async function backgroundPreload(){
  const cache=await openCache();if(!cache)return;
  const queue=[];
  const pageCount=Number.parseInt(document.querySelector('#page-input')?.max,10)||31;
  for(let page=1;page<=pageCount;page++){
    const number=String(page).padStart(2,'0');
    queue.push(assetUrl(`assets/portfolio/page-${number}.webp`));
    queue.push(assetUrl(`assets/thumbnails/page-${number}.webp`));
  }
  queue.push(assetUrl('assets/portfolio/Luis_Albos_Resume.pdf'));
  const manifestUrl=assetUrl('assets/study-manifest.json');
  try{
    let response=await cache.match(manifestUrl);
    if(!response){
      const fetched=await fetch(manifestUrl,{priority:'low'});
      if(fetched.ok){response=fetched.clone();await cache.put(manifestUrl,fetched);}
    }
    if(response?.ok){
      const manifest=await response.json();
      for(const course of manifest.classes||[])for(const document of course.documents||[]){
        if(document.path)queue.push(assetUrl(document.path));
        if(document.thumbnailPath)queue.push(assetUrl(document.thumbnailPath));
      }
    }
  }catch(_){/* A future visit can retry the manifest. */}
  for(let index=0;index<queue.length;){
    if(foregroundBusy||document.hidden){await new Promise(resolve=>setTimeout(resolve,250));continue;}
    const url=queue[index];
    try{await preloadAsset(cache,url);index++;}
    catch(error){
      if(error.name==='AbortError')continue;
      if(error.name==='QuotaExceededError')break;
      index++;
    }
    await new Promise(resolve=>setTimeout(resolve,75));
  }
}

export function startAssetPreload(){
  if(started)return;started=true;
  window.addEventListener('portfolio:foreground-load',event=>{
    foregroundBusy=event.detail?.active===true;
    if(foregroundBusy)currentFetch?.abort();
  });
  void registerWorker();
  void backgroundPreload();
}
