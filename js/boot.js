(() => {
  const root=document.documentElement,boot=document.querySelector('.boot-cinematic');
  if(root.dataset.boot!=='playing')return;
  // Durations are visible animation time, not deadlines measured from page load.
  const stages=[['BLACK',400],['BOOT',700],['INITIALIZE',1100],['RESET',250],
    ['BRAND',700],['LOADING',1200],['VERIFY',550],['AUTHENTICATING',1750],
    ['VERIFIED',450],['CHECK',650],['LANDING',750]];
  const controller=new AbortController(),{signal}=controller;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const skip=boot.querySelector('.boot-skip');
  let finished=false;
  function finish(){
    if(finished)return;
    finished=true;controller.abort();
    boot.dataset.state='COMPLETE';root.removeAttribute('data-boot');boot.inert=true;
    boot.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    skip.removeEventListener('click',finish);media.removeEventListener('change',reduce);
    window.removeEventListener('pagehide',finish);
    try{sessionStorage.setItem('alephonIntroSeen','1');}catch(_){}
    window.dispatchEvent(new Event('alephon:complete'));
  }
  function reduce(){if(media.matches)finish();}
  function showState(state,duration){
    boot.dataset.state=state;
    return new Promise(resolve=>{
      let frame=0,last=null,elapsed=0;
      const animations=boot.getAnimations({subtree:true});
      animations.forEach(animation=>animation.pause());
      function done(){cancelAnimationFrame(frame);signal.removeEventListener('abort',done);resolve();}
      function tick(now){
        // Discard long/hidden gaps. Never catch up after a stall or tab suspension.
        const delta=last===null||document.hidden?0:Math.min(32,now-last);
        last=document.hidden?null:now;elapsed+=delta;
        animations.forEach(animation=>{animation.currentTime=(animation.currentTime||0)+delta;});
        if(elapsed>=duration)done();else frame=requestAnimationFrame(tick);
      }
      signal.addEventListener('abort',done,{once:true});
      frame=requestAnimationFrame(tick);
    });
  }
  window.alephonBoot={skip:finish};
  skip.addEventListener('click',finish);media.addEventListener('change',reduce);
  window.addEventListener('pagehide',finish);
  (async()=>{
    for(const [state,duration] of media.matches?[['BRAND',220]]:stages){
      if(signal.aborted)return;
      await showState(state,duration);
    }
    finish();
  })();
})();
