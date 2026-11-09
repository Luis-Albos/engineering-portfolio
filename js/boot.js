(() => {
  const root=document.documentElement,boot=document.querySelector('.boot-cinematic');
  if(!boot||root.dataset.boot!=='playing')return;
  const started=performance.now();
  let finished=false;
  const timer=setTimeout(()=>finish('timeout'),15000);
  function finish(reason) {
    if(finished)return;
    finished=true;clearTimeout(timer);
    document.removeEventListener('visibilitychange',checkDeadline);
    root.removeAttribute('data-boot');boot.dataset.state='complete';boot.inert=true;
    window.dispatchEvent(new CustomEvent('alephon:complete',{detail:{reason}}));
  }
  function checkDeadline(){if(performance.now()-started>=15000)finish('timeout');}
  document.addEventListener('visibilitychange',checkDeadline);
  window.alephonBoot={ready:()=>finish('ready'),fail:()=>finish('failed'),finish};
})();
