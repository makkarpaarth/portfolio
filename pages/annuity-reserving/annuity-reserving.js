document.getElementById('year').textContent = new Date().getFullYear();

const formulaDetails = {
  1: {
    kicker: 'Step 01 · Mortality',
    equation: 'qₓ₊ₖ (male / female)',
    meaning: 'The single-year mortality rate at each attained age, held separately by sex.',
    symbols: 'q = mortality rate · x = age at entry · k = future year'
  },
  2: {
    kicker: 'Step 02 · Survival',
    equation: 'ₜpₓ = ∏ (1 − q₍ₓ₊ₖ₎)',
    meaning: 'The cumulative probability that the policyholder is still alive t years on, compounded year by year.',
    symbols: 'p = survival probability · t = years ahead · ∏ = multiply across years'
  },
  3: {
    kicker: 'Step 03 · Cash flow',
    equation: 'CFₜ = (Annuityₜ + SurvivalBenefitₜ) − (Premiumₜ − Expensesₜ − Commissionₜ)',
    meaning: 'The net cash flow in year t: benefits paid out, offset by premium income after expenses and commission.',
    symbols: 'CF = cash flow · t = payment year · benefit = outgo · premium = income'
  },
  4: {
    kicker: 'Step 04 · Discount',
    equation: 'PV(CFₜ) = CFₜ × ₜpₓ × vₜ',
    meaning: 'Each cash flow is weighted by its survival probability and discounted back to today.',
    symbols: 'PV = present value · v = discount factor · × = multiply the adjustments'
  },
  5: {
    kicker: 'Step 05 · Reserve',
    equation: 'BEL₀ = Σₜ PV(CFₜ) = PV(Outgo) − PV(Ingo)',
    meaning: 'The best-estimate liability: the sum of every discounted, survival-weighted cash flow over the policy term.',
    symbols: 'BEL = best-estimate liability · Σ = sum across t · 0 = valuation date'
  }
};

const formulaChain = document.querySelector('.formula-chain');
if (formulaChain) {
  const nodes = formulaChain.querySelectorAll('.formula-node');
  const detail = formulaChain.querySelector('.formula-detail');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentKey = 1;
  let autoTimer;
  let isInteracting = false;

  function showFormula(key){
    const formula = formulaDetails[key];
    if (!formula) return;
    currentKey = Number(key);
    detail.querySelector('.formula-detail__kicker').textContent = formula.kicker;
    detail.querySelector('.formula-detail__equation').textContent = formula.equation;
    detail.querySelector('.formula-detail__meaning').textContent = formula.meaning;
    detail.querySelector('.formula-detail__symbols').innerHTML = `<strong>Symbols</strong> ${formula.symbols}`;
    detail.id = `formula-detail-${key}`;
    nodes.forEach(node => {
      const isActive = node.dataset.formula === String(key);
      node.classList.toggle('is-active', isActive);
      node.setAttribute('aria-selected', String(isActive));
      node.setAttribute('aria-controls', detail.id);
    });
  }

  function stopAutoProgress(){
    clearInterval(autoTimer);
    autoTimer = undefined;
  }

  function startAutoProgress(){
    stopAutoProgress();
    if (reducedMotion || isInteracting) return;
    autoTimer = setInterval(() => {
      const nextKey = currentKey === nodes.length ? 1 : currentKey + 1;
      showFormula(nextKey);
    }, 3000);
  }

  nodes.forEach(node => {
    node.addEventListener('pointerenter', () => {
      isInteracting = true;
      stopAutoProgress();
      showFormula(node.dataset.formula);
    });
    node.addEventListener('pointerleave', () => {
      isInteracting = false;
      startAutoProgress();
    });
    node.addEventListener('focus', () => {
      isInteracting = true;
      stopAutoProgress();
      showFormula(node.dataset.formula);
    });
    node.addEventListener('blur', () => {
      isInteracting = false;
      startAutoProgress();
    });
    node.addEventListener('click', () => showFormula(node.dataset.formula));
  });

  startAutoProgress();
}

const imageViewer = document.getElementById('image-viewer');
const galleryItems = document.querySelectorAll('.placeholder-gallery .placeholder-shot--image');
if (imageViewer && galleryItems.length) {
  const viewerImage = imageViewer.querySelector('[data-viewer-image]');
  const viewerTitle = imageViewer.querySelector('[id="image-viewer-title"]');
  const viewerCounter = imageViewer.querySelector('[data-viewer-counter]');
  const viewerZoomLevel = imageViewer.querySelector('[data-viewer-zoom-level]');
  let viewerIndex = 0;
  let viewerZoom = 1;
  let lastFocusedItem;

  function updateViewer(){
    const item = galleryItems[viewerIndex];
    const image = item.querySelector('img');
    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    viewerTitle.textContent = item.getAttribute('aria-label').replace('Open ', '').replace(' in image viewer', '');
    viewerCounter.textContent = `${viewerIndex + 1} / ${galleryItems.length}`;
    viewerImage.style.transform = `scale(${viewerZoom})`;
    viewerZoomLevel.textContent = `${Math.round(viewerZoom * 100)}%`;
  }

  function openViewer(index){
    viewerIndex = index;
    viewerZoom = 1;
    lastFocusedItem = galleryItems[index];
    updateViewer();
    imageViewer.hidden = false;
    document.body.classList.add('viewer-open');
    imageViewer.querySelector('.image-viewer__close').focus();
  }

  function closeViewer(){
    imageViewer.hidden = true;
    document.body.classList.remove('viewer-open');
    lastFocusedItem?.focus();
  }

  function moveViewer(direction){
    viewerIndex = (viewerIndex + direction + galleryItems.length) % galleryItems.length;
    viewerZoom = 1;
    updateViewer();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openViewer(index));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(index);
      }
    });
  });
  imageViewer.querySelectorAll('[data-viewer-close]').forEach(button => button.addEventListener('click', closeViewer));
  imageViewer.querySelector('[data-viewer-previous]').addEventListener('click', () => moveViewer(-1));
  imageViewer.querySelector('[data-viewer-next]').addEventListener('click', () => moveViewer(1));
  imageViewer.querySelector('[data-viewer-zoom-in]').addEventListener('click', () => {
    viewerZoom = Math.min(viewerZoom + .25, 3);
    updateViewer();
  });
  imageViewer.querySelector('[data-viewer-zoom-out]').addEventListener('click', () => {
    viewerZoom = Math.max(viewerZoom - .25, .5);
    updateViewer();
  });
  document.addEventListener('keydown', event => {
    if (imageViewer.hidden) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') moveViewer(-1);
    if (event.key === 'ArrowRight') moveViewer(1);
    if (event.key === '+' || event.key === '=') {
      viewerZoom = Math.min(viewerZoom + .25, 3);
      updateViewer();
    }
    if (event.key === '-') {
      viewerZoom = Math.max(viewerZoom - .25, .5);
      updateViewer();
    }
  });
}

/* ================= Background animated risk curve ================= */
(function bgCurve(){
  const canvas = document.getElementById('bg-curve');
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const lines = [
    { amp: 60, freq: 0.0022, speed: 0.010, offset: 0,   color: 'rgba(53,201,176,0.35)' },
    { amp: 40, freq: 0.0035, speed: -0.014, offset: 80,  color: 'rgba(201,162,75,0.25)' },
    { amp: 90, freq: 0.0016, speed: 0.007, offset: -60, color: 'rgba(53,201,176,0.15)' }
  ];

  function draw(){
    ctx.clearRect(0, 0, w, h);
    const baseY = h * 0.62;
    lines.forEach(line => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = baseY + line.offset + Math.sin(x * line.freq + t * line.speed) * line.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });
    t += 1;
    if (!reduced) requestAnimationFrame(draw);
  }
  draw();
})();
