// A bounded model orbit: camera, terrain, assembly mates, pan and zoom stay fixed.
export function createAircraftControls(canvas, {config, hitTest, onChange, onExplore, reducedMotion=false}) {
  let mode='idle',yaw=0,pitch=0,pointer=null,lastX=0,lastY=0;
  let targetYaw=0,targetPitch=0,yawVelocity=0,pitchVelocity=0,lastUpdate=performance.now();
  let releaseAt=0,returnAt=0,returnDuration=0,fromYaw=0,fromPitch=0,fromWeight=1;
  let idleWeight=1,dismissing=false,disposed=false,reduced=reducedMotion;
  const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
  const smooth=t=>t*t*(3-2*t);
  function startReturn(now,duration) {
    fromYaw=yaw;fromPitch=pitch;fromWeight=idleWeight;
    yawVelocity=0;pitchVelocity=0;
    returnAt=now;returnDuration=reduced?0:duration;mode='returning';
  }
  function update(now) {
    let resumed=false;
    let elapsed=Math.min(.1,Math.max(0,(now-lastUpdate)/1000));lastUpdate=Math.max(now,lastUpdate);
    if(mode==='dragging'||mode==='holding') {
      if(reduced){yaw=targetYaw;pitch=targetPitch;yawVelocity=0;pitchVelocity=0;}
      // Small fixed substeps make the damped spring consistent across frame rates.
      while(!reduced && elapsed>0) {
        const dt=Math.min(elapsed,1/120);elapsed-=dt;
        yawVelocity+=(config.stiffness*(targetYaw-yaw)-config.damping*yawVelocity)*dt;
        pitchVelocity+=(config.stiffness*(targetPitch-pitch)-config.damping*pitchVelocity)*dt;
        yawVelocity=clamp(yawVelocity,config.maxVelocity);pitchVelocity=clamp(pitchVelocity,config.maxVelocity);
        yaw+=yawVelocity*dt;pitch+=pitchVelocity*dt;
        if(Math.abs(yaw)>=config.maxYaw){yaw=clamp(yaw,config.maxYaw);yawVelocity=0;}
        if(Math.abs(pitch)>=config.maxTilt){pitch=clamp(pitch,config.maxTilt);pitchVelocity=0;}
      }
    }
    if(mode==='holding' && now-releaseAt>=config.idleTimeout)startReturn(releaseAt+config.idleTimeout,config.returnDuration);
    if(mode==='returning') {
      const t=returnDuration?Math.min(1,Math.max(0,(now-returnAt)/returnDuration)):1;
      const remaining=1-smooth(t);
      yaw=fromYaw*remaining;pitch=fromPitch*remaining;idleWeight=fromWeight*remaining;
      if(t===1){yaw=0;pitch=0;}
      if(t===1 && !dismissing){mode='idle';idleWeight=1;resumed=true;}
    }
    return {yaw,pitch,idleWeight,frozen:mode!=='idle',resumed,active:mode!=='idle'};
  }
  function releaseCapture() {
    const id=pointer;pointer=null;
    canvas.classList.remove('is-dragging');
    if(id!==null && canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  function down(event) {
    if(disposed||dismissing||pointer!==null||!event.isPrimary||event.button!==0||!hitTest(event))return;
    update(performance.now());
    pointer=event.pointerId;lastX=event.clientX;lastY=event.clientY;targetYaw=yaw;targetPitch=pitch;mode='dragging';
    canvas.setPointerCapture(pointer);canvas.classList.add('is-dragging');
    canvas.focus({preventScroll:true});onExplore();onChange();
  }
  function move(event) {
    if(event.pointerId!==pointer)return;
    const dx=event.clientX-lastX,dy=event.clientY-lastY;
    if(Math.hypot(dx,dy)<config.deadzone)return;
    targetYaw=clamp(targetYaw+dx*config.sensitivity,config.maxYaw);
    targetPitch=clamp(targetPitch+dy*config.sensitivity,config.maxTilt);
    lastX=event.clientX;lastY=event.clientY;onChange();
  }
  function release(event) {
    if(pointer===null || (event?.pointerId!==undefined && event.pointerId!==pointer))return;
    update(performance.now());releaseCapture();mode='holding';releaseAt=performance.now();
    targetYaw=clamp(targetYaw+yawVelocity*config.releaseMomentum,config.maxYaw);
    targetPitch=clamp(targetPitch+pitchVelocity*config.releaseMomentum,config.maxTilt);onChange();
  }
  function key(event) {
    if(dismissing || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape','Home'].includes(event.key))return;
    event.preventDefault();update(performance.now());onExplore();
    if(event.key==='Home'||event.key==='Escape')startReturn(performance.now(),config.returnDuration);
    else {
      targetYaw=clamp(yaw+({'ArrowLeft':-.06,'ArrowRight':.06}[event.key]||0),config.maxYaw);
      targetPitch=clamp(pitch+({'ArrowUp':-.04,'ArrowDown':.04}[event.key]||0),config.maxTilt);
      mode='holding';releaseAt=performance.now();
    }
    onChange();
  }
  function visibility(){if(document.hidden)release();}
  canvas.addEventListener('pointerdown',down);
  canvas.addEventListener('pointermove',move);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,release);
  canvas.addEventListener('keydown',key);
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',visibility);
  return {update,
    dismiss(now){update(now);dismissing=true;releaseCapture();startReturn(now,config.dismissReturnDuration);},
    setReduced(value){reduced=value;},
    dispose(){disposed=true;releaseCapture();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);
      for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.removeEventListener(type,release);
      canvas.removeEventListener('keydown',key);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',visibility);
    }
  };
}
