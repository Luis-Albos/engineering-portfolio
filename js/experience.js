const build=document.documentElement.dataset.build;
const versioned=path=>{const url=new URL(path,import.meta.url);url.searchParams.set('v',build);return url.href;};
const {LANDING_TRANSITION}=await import(versioned('./experience-config.js'));
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
let scene=null,sceneAbort=null,sceneGeneration=0,sceneTimeout=0,transitionTimer=0,returnTimer=0,boot=window.alephonBoot;
const isDeep=()=>/^#(?:page=|portfolio-viewer$|work$|about$|contact$)/i.test(location.hash);
function setMode(mode){
  root.dataset.view=mode;
  const landing=mode==='landing';
  rail.inert=!landing;stage.inert=!landing;viewer.inert=landing;sidebar.inert=landing;
}
function stopScene(){clearTimeout(sceneTimeout);sceneGeneration++;sceneAbort?.abort();sceneAbort=null;scene?.dispose();scene=null;}
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
async function startScene(){
  if(root.dataset.boot==='playing'||root.dataset.view!=='landing')return;
  if(scene||sceneAbort)return;
  const generation=++sceneGeneration;sceneAbort=new AbortController();
  setSceneState('loading');
  const timeout=sceneTimeout=setTimeout(()=>{if(generation===sceneGeneration)setSceneState('delayed');},SCENE_STARTUP_TIMEOUT);
  try {
    // Allow the usable static landing to paint before imports or GPU work.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(generation!==sceneGeneration)return;
    const {createLandingScene}=await import(versioned('./landing-scene.js'));
    if(generation!==sceneGeneration)return;
    const result=await createLandingScene(document.querySelector('.scene-canvas'),{signal:sceneAbort.signal,reducedMotion:media.matches});
    if(generation!==sceneGeneration||root.dataset.view!=='landing'){result.dispose();return;}
    scene=result;setSceneState('ready');
  } catch (_) {
    if(generation===sceneGeneration)setSceneState('unavailable');
    // The lightweight viewport state and every HTML control remain available.
  } finally {clearTimeout(timeout);if(generation===sceneGeneration)sceneAbort=null;}
}
function closeMobileMenu(){
  document.querySelector('.drawer-close')?.click();
}
function finishBoot(){
  bootOverlay.inert=true;
  try{sessionStorage.setItem('alephonIntroSeen','1');sessionStorage.removeItem('portfolioIntroSeen');}catch(_){}
  for(const el of [header,shell,document.querySelector('#about'),document.querySelector('#contact'),document.querySelector('.skip-link')])el.inert=false;
  setMode(root.dataset.view||'landing');
  if(document.activeElement?.classList.contains('boot-skip'))document.querySelector('.open-portfolio').focus({preventScroll:true});
  boot=null;
  startScene();
}
function openPortfolio({historyEntry=true,immediate=false}={}){
  if(root.dataset.view==='opening'&&!immediate)return;
  if(root.dataset.view==='viewer') {
    if(historyEntry) {
      closeMobileMenu();
      if(location.hash!=='#portfolio-viewer')history.pushState(null,'','#portfolio-viewer');
      window.scrollTo({top:0,behavior:media.matches?'instant':'smooth'});
    }
    return;
  }
  boot?.skip();clearTimeout(returnTimer);root.classList.remove('home-return');
  closeMobileMenu();
  if(historyEntry)history.pushState(null,'','#portfolio-viewer');
  // Keep the header at its current position; there is no scroll jump or duplicate viewer.
  if(window.scrollY>header.offsetHeight)window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('.open-portfolio > span').textContent='Opening Archive';
  setMode(immediate?'viewer':'opening');
  rail.inert=true;stage.inert=true;viewer.inert=!immediate;sidebar.inert=!immediate;
  if(scene)scene.dismiss();else stopScene();
  const finish=()=>{
    setMode('viewer');stopScene();viewer.focus({preventScroll:true});
    document.querySelector('.open-portfolio > span').textContent='Open Portfolio';
  };
  clearTimeout(transitionTimer);
  if(immediate)finish();else transitionTimer=setTimeout(finish,media.matches?LANDING_TRANSITION.reducedDuration:LANDING_TRANSITION.duration);
}
function showLanding({historyEntry=true}={}){
  boot?.skip();clearTimeout(transitionTimer);closeMobileMenu();
  // Reversing during dismissal must not reuse a scene whose edges are fading out.
  stopScene();
  if(historyEntry)history.pushState(null,'','#home');
  setMode('landing');root.classList.add('home-return');
  window.scrollTo({top:0,behavior:'instant'});startScene();
  document.querySelector('.open-portfolio > span').textContent='Open Portfolio';
  clearTimeout(returnTimer);returnTimer=setTimeout(()=>root.classList.remove('home-return'),LANDING_TRANSITION.returnDuration);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('[data-open-portfolio], [data-home], .skip-link, .chapter-link, .thumbnail-button, .search-result, .thumbnails-button');
  if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(link.matches('.chapter-link, .thumbnail-button, .search-result, .thumbnails-button')) {
    if(root.dataset.view==='landing')openPortfolio({historyEntry:false});
    return;
  }
  event.preventDefault();
  if(link.hasAttribute('data-home'))showLanding();else openPortfolio();
},true);
window.addEventListener('hashchange',()=>{
  if(isDeep()) {
    clearTimeout(transitionTimer);openPortfolio({historyEntry:false,immediate:true});
    if(/^#(?:about|contact)$/.test(location.hash))document.querySelector(location.hash)?.scrollIntoView({behavior:'instant'});
  } else showLanding({historyEntry:false});
});
media.addEventListener('change',()=>{if(media.matches)boot?.skip();scene?.setReduced(media.matches);});
window.addEventListener('pagehide',()=>{clearTimeout(transitionTimer);clearTimeout(returnTimer);boot?.skip();stopScene();if(root.dataset.view==='opening')setMode('viewer');});
window.addEventListener('pageshow',event=>{if(event.persisted&&root.dataset.view==='landing')startScene();});
bootOverlay.inert=root.dataset.boot!=='playing';
setMode(isDeep()?'viewer':'landing');
if(!isDeep()) {
  startScene();
  if(root.dataset.boot==='playing') {
    for(const el of [header,shell,document.querySelector('#about'),document.querySelector('#contact'),document.querySelector('.skip-link')])el.inert=true;
    window.addEventListener('alephon:complete',finishBoot,{once:true});
  } else {root.classList.add('home-return');returnTimer=setTimeout(()=>root.classList.remove('home-return'),450);}
}
