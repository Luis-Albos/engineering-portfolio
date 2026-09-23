const build=document.documentElement.dataset.build;
const configUrl=new URL('./experience-config.js',import.meta.url);
configUrl.searchParams.set('v',build);
const {INTRO_TIMING}=await import(configUrl.href);

// One cancellable clock owns the cinematic. CSS draws each state's internal detail.
export function playBoot({onComplete,reducedMotion=false}) {
  const root=document.documentElement,boot=document.querySelector('.boot-cinematic');
  const skip=boot.querySelector('.boot-skip');
  let frame=0,finished=false,index=-1;
  const start=performance.now();
  function finish() {
    if(finished)return;finished=true;cancelAnimationFrame(frame);
    boot.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    root.removeAttribute('data-boot');boot.dataset.state='COMPLETE';
    skip.removeEventListener('click',finish);onComplete();
  }
  function tick(now) {
    const elapsed=now-start;
    if(reducedMotion) {boot.dataset.state='BRAND';if(elapsed>=220){finish();return;}}
    else {
      while(index+1<INTRO_TIMING.length&&elapsed>=INTRO_TIMING[index+1][0]) {
        index++;boot.dataset.state=INTRO_TIMING[index][1];
        if(boot.dataset.state==='COMPLETE'){finish();return;}
      }
    }
    frame=requestAnimationFrame(tick);
  }
  skip.addEventListener('click',finish);frame=requestAnimationFrame(tick);
  return {skip:finish};
}
