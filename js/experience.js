const build=document.documentElement.dataset.build;
const versioned=path=>{const url=new URL(path,import.meta.url);url.searchParams.set('v',build);return url.href;};
const {LANDING_TRANSITION,AIRCRAFT_CONFIG}=await import(versioned('./experience-config.js'));
const {fetchModel,startAssetPreload}=await import(versioned('./asset-cache.js'));
const SCENE_STARTUP_TIMEOUT=6000;
const root=document.documentElement;
const shell=document.querySelector('.portfolio-layout');
const viewer=document.querySelector('#portfolio-viewer');
const sidebar=document.querySelector('.portfolio-sidebar');
const rail=document.querySelector('.landing-rail');
const stage=document.querySelector('.landing-stage');
const bootOverlay=document.querySelector('.boot-cinematic');
const header=document.querySelector('.site-header');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let scene=null,scenePromise=null,sceneAbort=null,sceneGeneration=0,sceneTimeout=0,transitionTimer=0,returnTimer=0,boot=window.alephonBoot;
const isDeep=()=>/^#(?:page=|portfolio-viewer$|work$|about$|contact$)/i.test(location.hash);
function setMode(mode){
  root.dataset.view=mode;
  const landing=mode==='landing';
  rail.inert=!landing;stage.inert=!landing;viewer.inert=landing;sidebar.inert=landing;
}
function stopScene(){clearTimeout(sceneTimeout);sceneGeneration++;sceneAbort?.abort();sceneAbort=null;scenePromise=null;scene?.dispose();scene=null;}
function setSceneState(state){
  stage.dataset.scene=state;
  if(state==='ready')return;
  const title=stage.querySelector('.scene-loading-title');
  const detail=stage.querySelector('.scene-loading-detail');
  if(state==='unavailable') {
    title.textContent='Scene unavailable';detail.textContent='3D view disabled';
  } else {
    title.textContent='Scene initializing';detail.textContent=state==='delayed'?'Still loading...':'Loading assets...';
  }
}
function maybePreloadAssets(){
  if(root.dataset.boot!=='playing'&&root.dataset.view==='landing')startAssetPreload();
}
function startScene(){
  if(root.dataset.view!=='landing')return;
  if(scenePromise)return scenePromise;
  const generation=++sceneGeneration;
  const controller=sceneAbort=new AbortController(),{signal}=controller;
  setSceneState('loading');
  scenePromise=(async()=>{
    let timeout;
    try {
      // Paint the loader before expensive scene work begins.
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      signal.throwIfAborted();
      timeout=sceneTimeout=setTimeout(()=>{if(generation===sceneGeneration)setSceneState('delayed');},SCENE_STARTUP_TIMEOUT);
      // Fetch once, alongside imports (not after the Three.js dependency graph).
      const modelUrl=versioned(AIRCRAFT_CONFIG.model);
      const [module,buffer]=await Promise.all([
        import(versioned('./landing-scene.js')),
        fetchModel(modelUrl,{signal})
      ]);
      signal.throwIfAborted();
      let sliceStart=performance.now();
      const yieldWork=async()=>{
        signal.throwIfAborted();
        const hidden=root.dataset.boot==='playing';
        if(performance.now()-sliceStart<(hidden?5:10))return;
        await new Promise(resolve=>setTimeout(resolve,hidden?8:0));
        signal.throwIfAborted();sliceStart=performance.now();
      };
      const startupReduced=media.matches;
      const result=await module.createLandingScene(document.querySelector('.scene-canvas'),{
        signal,reducedMotion:startupReduced,buffer,modelUrl,
        yieldWork,
        isActive:()=>root.dataset.boot!=='playing',
        onUnavailable:()=>{if(generation===sceneGeneration){scene=null;scenePromise=null;setSceneState('unavailable');boot?.fail();maybePreloadAssets();}}
      });
      if(generation!==sceneGeneration||root.dataset.view!=='landing'){result.dispose();return;}
      scene=result;if(media.matches!==startupReduced)scene.setReduced(media.matches);scene.setActive(root.dataset.boot!=='playing');setSceneState('ready');boot?.ready();maybePreloadAssets();
    } catch (_) {
      if(generation===sceneGeneration){controller.abort();scenePromise=null;setSceneState('unavailable');boot?.fail();maybePreloadAssets();}
    } finally {clearTimeout(timeout);if(generation===sceneGeneration)sceneAbort=null;}
  })();
  return scenePromise;
}
function closeMobileMenu(){
  document.querySelector('.drawer-close')?.click();
}
function finishBoot(event){
  bootOverlay.inert=true;
  for(const el of [header,shell,document.querySelector('#contact'),document.querySelector('.skip-link')])el.inert=false;
  setMode(root.dataset.view||'landing');
  boot=null;
  scene?.setActive(true);
  if(!['navigation','pagehide'].includes(event?.detail?.reason))maybePreloadAssets();
}
function openPortfolio({historyEntry=true,immediate=false,selectionFollows=false}={}){
  if(root.dataset.view==='opening'&&!immediate)return;
  if(root.dataset.view==='viewer') {
    if(historyEntry) {
      closeMobileMenu();
      if(location.hash!=='#portfolio-viewer')history.pushState(null,'','#portfolio-viewer');
      window.scrollTo({top:0,behavior:media.matches?'instant':'smooth'});
    }
    return;
  }
  boot?.finish('navigation');clearTimeout(returnTimer);root.classList.remove('home-return');
  closeMobileMenu();
  if(historyEntry)history.pushState(null,'','#portfolio-viewer');
  // Keep the header at its current position; there is no scroll jump or duplicate viewer.
  if(window.scrollY>header.offsetHeight)window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('.open-portfolio > span').textContent='Opening Archive';
  setMode(immediate?'viewer':'opening');
  if(!selectionFollows)window.dispatchEvent(new Event('portfolio:open'));
  rail.inert=true;stage.inert=true;viewer.inert=!immediate;sidebar.inert=!immediate;
  if(scene)scene.dismiss();else stopScene();
  const finish=()=>{
    setMode('viewer');scene?.setActive(false);viewer.focus({preventScroll:true});
    document.querySelector('.open-portfolio > span').textContent='Open Portfolio';
  };
  clearTimeout(transitionTimer);
  if(immediate)finish();else transitionTimer=setTimeout(finish,media.matches?LANDING_TRANSITION.reducedDuration:LANDING_TRANSITION.duration);
}
function showLanding({historyEntry=true}={}){
  boot?.finish('navigation');clearTimeout(transitionTimer);closeMobileMenu();
  if(historyEntry)history.pushState(null,'','#home');
  setMode('landing');root.classList.add('home-return');
  window.scrollTo({top:0,behavior:'instant'});
  if(scene)scene.resume();else startScene();
  document.querySelector('.open-portfolio > span').textContent='Open Portfolio';
  clearTimeout(returnTimer);returnTimer=setTimeout(()=>root.classList.remove('home-return'),LANDING_TRANSITION.returnDuration);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('[data-open-portfolio], [data-home], .skip-link, .chapter-link, .thumbnail-button, .search-result, .thumbnails-button');
  if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(link.matches('.chapter-link, .thumbnail-button, .search-result, .thumbnails-button')) {
    if(root.dataset.view==='landing')openPortfolio({historyEntry:false,selectionFollows:!link.matches('.thumbnails-button')});
    return;
  }
  event.preventDefault();
  if(link.hasAttribute('data-home'))showLanding();else openPortfolio();
},true);
window.addEventListener('hashchange',()=>{
  if(/^#about$/i.test(location.hash))history.replaceState(history.state,'','#portfolio-viewer');
  if(isDeep()) {
    clearTimeout(transitionTimer);openPortfolio({historyEntry:false,immediate:true});
    if(location.hash==='#contact')document.querySelector(location.hash)?.scrollIntoView({behavior:'instant'});
  } else showLanding({historyEntry:false});
});
media.addEventListener('change',()=>{scene?.setReduced(media.matches);});
window.addEventListener('pagehide',()=>{clearTimeout(transitionTimer);clearTimeout(returnTimer);boot?.finish('pagehide');stopScene();if(root.dataset.view==='opening')setMode('viewer');});
window.addEventListener('pageshow',event=>{if(event.persisted&&root.dataset.view==='landing')startScene();});
bootOverlay.inert=root.dataset.boot!=='playing';
setMode(isDeep()?'viewer':'landing');
if(!isDeep()) {
  startScene();
  if(root.dataset.boot==='playing') {
    for(const el of [header,shell,document.querySelector('#contact'),document.querySelector('.skip-link')])el.inert=true;
    window.addEventListener('alephon:complete',finishBoot,{once:true});
  } else {root.classList.add('home-return');returnTimer=setTimeout(()=>root.classList.remove('home-return'),450);}
}
