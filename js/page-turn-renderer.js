const vendorUrl = new URL('../assets/vendor/page-flip/page-flip-2.0.7.js', import.meta.url);
vendorUrl.searchParams.set('v', document.documentElement.dataset.build);
const { PageFlip } = await import(vendorUrl.href);

export function createPageTurnRenderer({ container, totalPages, onTurn, canTurn, onUnavailable }) {
  let engine = null, root = null, sheets = new Map(), numbers = [], last = null;
  let raf = null, active = true, disposed = false, synchronizing = 0, gesture = null, pointer = null;
  let imageMap = new Map(), geometry = '', draws = 0;
  const nativeRaf = window.requestAnimationFrame.bind(window);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const range = (first, end) => Array.from({ length: end - first + 1 }, (_, index) => first + index);
  const spread = page => !last.double || page === 1 ? [page] : [page % 2 ? page - 1 : page, page % 2 ? page : page + 1].filter(n => n <= totalPages);
  const neighbor = direction => {
    const pages = spread(last.page);
    if (direction > 0 && pages.at(-1) >= totalPages || direction < 0 && pages[0] <= 1) return last.page;
    return Math.max(1, Math.min(totalPages, last.double ? direction > 0 ? pages.at(-1) + 1 : pages[0] === 2 ? 1 : pages[0] - 2 : last.page + direction));
  };
  function wake() {
    if (!disposed && active && engine && raf === null) raf = nativeRaf(tick);
  }
  function tick(time) {
    raf = null;
    if (!active || disposed || !engine) return;
    try {
      const render = engine.getRender(), animation = render.animation;
      if (animation) {
        const index = Math.max(0, Math.round((time - animation.startedAt) / animation.durationFrame));
        if (index < animation.frames.length) animation.frames[index]();
        else { render.animation = null; animation.onAnimateEnd?.(); }
      }
      render.timer = time;
      render.drawFrame();
      container.dataset.draws = String(++draws);
      if (render.animation) wake();
    } catch (_) {
      dispose(); onUnavailable();
    }
  }
  function clearFold() {
    if (!engine) return;
    const render = engine.getRender();
    render.setBottomPage(null); render.setFlippingPage(null); render.clearShadow();
    for (const page of engine.getPageCollection().getPages()) page.hideTemporaryCopy();
    engine.getFlipController().reset();
    engine.getFlipController().setState('read');
    engine.isUserTouch = false;
    container.dataset.turnState = 'read';
  }
  function settle() {
    if (!engine) return;
    synchronizing++;
    try { engine.getRender().finishAnimation(); clearFold(); }
    finally { synchronizing--; gesture = null; pointer = null; }
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    wake();
  }
  function destroyEngine() {
    if (!engine) return;
    synchronizing++;
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    engine.getRender().animation = null;
    clearFold();
    engine.getUI().removeHandlers();
    engine.destroy();
    engine = null; sheets.clear(); synchronizing--;
  }
  function desiredWindow(page) {
    if (!last.double) return range(Math.max(1, page - 1), Math.min(totalPages, page + 1));
    const pages = spread(page);
    if (page === 1) return range(1, Math.min(3, totalPages));
    return range(Math.max(1, pages[0] - 2), Math.min(totalPages, pages.at(-1) + 2));
  }
  function syncImages(images) {
    imageMap = images;
    for (const [page, sheet] of sheets) {
      const image = images.get(page);
      if (image && sheet.firstChild !== image) sheet.replaceChildren(image);
      else if (!image) sheet.replaceChildren();
    }
    wake();
  }
  function createEngine(page) {
    destroyEngine();
    numbers = desiredWindow(page);
    root = document.createElement('div');
    root.className = 'page-turn-engine';
    root.style.width = `${last.width * (last.double ? 2 : 1)}px`;
    root.style.height = `${last.height}px`;
    container.replaceChildren(root);
    for (const number of numbers) {
      const sheet = document.createElement('div');
      sheet.className = 'portfolio-sheet'; sheet.dataset.page = number;
      sheets.set(number, sheet); root.append(sheet);
    }
    syncImages(imageMap);
    const instance = engine = new PageFlip(root, {
      width: last.width, height: last.height, size: 'fixed', autoSize: false,
      usePortrait: !last.double, showCover: last.double && numbers[0] === 1,
      flippingTime: 400, maxShadowOpacity: .10, drawShadow: true,
      useMouseEvents: false, mobileScrollSupport: false, showPageCorners: false, clickEventForward: false
    });
    instance.on('changeState', event => {
      container.dataset.turnState = event.data;
      if (event.data !== 'read' || synchronizing) return;
      queueMicrotask(() => {
        if (engine !== instance || disposed || synchronizing) return;
        const userTurn = gesture;
        gesture = null;
        if (userTurn) {
          const selected = numbers[instance.getCurrentPageIndex()];
          if (selected !== undefined && instance.getCurrentPageIndex() !== userTurn.index) onTurn(selected);
        } else if (numbers.join(',') !== desiredWindow(last.page).join(',')) {
          createEngine(last.page);
        }
      });
    });
    let startupRaf;
    const originalRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = callback => {
      const id = originalRaf.call(window, callback);
      if (startupRaf === undefined) startupRaf = id;
      return id;
    };
    synchronizing++;
    try { instance.loadFromHTML([...sheets.values()]); }
    finally {
      window.requestAnimationFrame = originalRaf;
      if (startupRaf !== undefined) cancelAnimationFrame(startupRaf);
      synchronizing--;
    }
    for (const sheet of instance.getPageCollection().getPages()) sheet.setDensity('soft');
    const render = instance.getRender(), startAnimation = render.startAnimation.bind(render);
    render.startAnimation = (...args) => { render.timer = performance.now(); startAnimation(...args); wake(); };
    synchronizing++;
    try { instance.turnToPage(numbers.indexOf(page)); }
    finally { synchronizing--; }
    render.drawFrame();
    container.dataset.draws = String(++draws);
    container.dataset.activeSheets = String(numbers.length);
    container.dataset.turnState = 'read';
    wake();
  }
  function render(options) {
    if (disposed) throw new Error('Renderer disposed');
    const changedGeometry = geometry !== `${options.width},${options.height},${options.double}`;
    const previousPage = last?.page;
    last = options; imageMap = options.images;
    geometry = `${options.width},${options.height},${options.double}`;
    container.style.width = `${options.width * (options.double ? 2 : 1)}px`;
    container.style.height = `${options.height}px`;
    container.style.left = options.double && options.page === 1 ? `${-options.width}px` : '0';
    if (!engine || changedGeometry || !numbers.includes(options.page)) createEngine(options.page);
    else {
      syncImages(options.images);
      if (options.animate && !reduced() && previousPage !== options.page) {
        engine.flip(numbers.indexOf(options.page), 'bottom');
      } else {
        synchronizing++;
        try { engine.turnToPage(numbers.indexOf(options.page)); }
        finally { synchronizing--; }
        if (numbers.join(',') !== desiredWindow(options.page).join(',')) createEngine(options.page);
      }
    }
    wake();
  }
  function pointerDown(event) {
    if (!active || !engine || event.button !== 0 || pointer) return;
    const rect = container.parentElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (event.pointerType !== 'touch' && x > last.width * .22 && x < rect.width - last.width * .22) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, started: false, direction: 0 };
  }
  function pointerMove(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.started) {
      if (Math.abs(dy) > Math.abs(dx) * 1.4 && Math.abs(dy) > 8) { pointer = null; return; }
      if (Math.abs(dx) < 8 || reduced()) return;
      const direction = dx < 0 ? 1 : -1;
      if (neighbor(direction) === last.page || !canTurn(direction)) return;
      settle();
      pointer = { id: event.pointerId, x: event.clientX - dx, y: event.clientY - dy, started: true, direction };
      gesture = { from: last.page, index: engine.getCurrentPageIndex() };
      container.setPointerCapture(event.pointerId);
      engine.startUserTouch({ x: direction > 0 ? last.width * (last.double ? 2 : 1) - 2 : 2, y: last.height * .85 });
    }
    event.preventDefault();
    const startX = pointer.direction > 0 ? last.width * (last.double ? 2 : 1) - 2 : 2;
    engine.userMove({ x: startX + dx * (last.double ? 1 : 2), y: Math.max(1, Math.min(last.height - 1, last.height * .85 + dy)) }, true);
    wake();
  }
  function pointerEnd(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const current = pointer, dx = event.clientX - current.x, dy = event.clientY - current.y;
    pointer = null;
    if (current.started) {
      if (!last.double && current.direction < 0 && dx < last.width / 2) {
        settle();
        if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
        return;
      }
      const startX = current.direction > 0 ? last.width * (last.double ? 2 : 1) - 2 : 2;
      engine.userStop({ x: startX + dx * (last.double ? 1 : 2), y: last.height * .85 + dy }); wake();
      if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
    } else if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      onTurn(neighbor(dx < 0 ? 1 : -1));
    }
  }
  function pointerCancel() { settle(); }
  container.addEventListener('pointerdown', pointerDown);
  container.addEventListener('pointermove', pointerMove);
  container.addEventListener('pointerup', pointerEnd);
  container.addEventListener('pointercancel', pointerCancel);
  function setActive(value) {
    if (active === value) return;
    settle(); active = value;
    if (!active && raf !== null) { cancelAnimationFrame(raf); raf = null; }
    else wake();
  }
  function dispose() {
    disposed = true; destroyEngine();
    for (const [name, handler] of [['pointerdown', pointerDown], ['pointermove', pointerMove], ['pointerup', pointerEnd], ['pointercancel', pointerCancel]]) container.removeEventListener(name, handler);
  }
  return { render, syncImages, settle, setActive, dispose };
}
