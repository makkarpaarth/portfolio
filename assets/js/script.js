document.getElementById('year').textContent = new Date().getFullYear();

const experienceYears = document.getElementById('experience-years');
if (experienceYears) {
  const experienceStart = new Date('2024-06-01');
  const years = (Date.now() - experienceStart.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  experienceYears.textContent = `~ ${years.toFixed(1)} years`;
}

const backToTop = document.querySelector('a[href="#top"]');
if (backToTop) {
  backToTop.addEventListener('click', event => {
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ================= Skills toolkit: hover reveals tool + example use ================= */
(function skillsInfo(){
  const panel = document.getElementById('skills-info');
  const track = document.querySelector('.skills__track');
  if (!panel || !track) return;
  const tool = panel.querySelector('.skills__info-tool');
  const use = panel.querySelector('.skills__info-use');

  track.addEventListener('pointerover', (e) => {
    const tile = e.target.closest('.skill-tile');
    if (!tile) return;
    tool.textContent = tile.dataset.name;
    use.textContent = tile.dataset.use;
    panel.classList.add('is-active');
  });
})();

/* ================= Card spotlight follows pointer ================= */
document.querySelectorAll('.branch').forEach(card => {
  card.addEventListener('pointermove', event => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  });
});

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

/* ================= Scroll-triggered reveal (exams meter + count) ================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.exams__count').forEach(animateCount);
    const fill = entry.target.querySelector('.exams__fill');
    if (fill) fill.style.width = fill.dataset.target + '%';
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.35 });

document.querySelectorAll('.exams').forEach(el => revealObserver.observe(el));

function animateCount(el){
  const target = parseInt(el.dataset.target, 10);
  const duration = 900;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

/* exam branch cards expand on hover — pure CSS, no JS needed */

/* ================= Model card visuals: animated Monte-Carlo fan-chart projection ================= */
function initModelVisual(canvas, seed){
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const teal = getComputedStyle(document.documentElement).getPropertyValue('--teal').trim() || '#35C9B0';
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#C9A24B';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, cssW, cssH;
  function resize(){
    cssW = canvas.clientWidth || canvas.parentElement.clientWidth;
    cssH = canvas.clientHeight || 90;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = cssW; h = cssH;
  }
  window.addEventListener('resize', resize);
  resize();

  // Deterministic pseudo-random so each card's paths differ but stay stable
  let s = seed;
  function rand(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }

  const histEnd = w * 0.42;      // where "known" history ends and projection fans out
  const baseY = h * 0.62;
  const pointCount = 22;
  const histPoints = [];
  const projPaths = []; // several stochastic sample paths after histEnd

  // Build a smooth historical curve (upward actuarial trend)
  for (let i = 0; i <= pointCount; i++){
    const x = (histEnd / pointCount) * i;
    const t = i / pointCount;
    const y = baseY - t * (h * 0.28) - Math.sin(t * Math.PI * 1.6) * 6 + (rand() - 0.5) * 3;
    histPoints.push({ x, y });
  }
  const lastHist = histPoints[histPoints.length - 1];

  // Build N stochastic projection paths (like actuarial scenario testing) fanning outward
  const pathCount = 5;
  for (let p = 0; p < pathCount; p++){
    const drift = (rand() - 0.35) * 0.9;     // slight upward bias, some paths dip
    const vol = 4 + rand() * 7;
    const pts = [{ x: lastHist.x, y: lastHist.y }];
    const steps = 16;
    for (let i = 1; i <= steps; i++){
      const t = i / steps;
      const x = lastHist.x + (w - lastHist.x) * t;
      const walk = (rand() - 0.5) * vol;
      const prevY = pts[pts.length - 1].y;
      let y = prevY + walk - drift * 1.4;
      y = Math.max(h * 0.08, Math.min(h * 0.92, y));
      pts.push({ x, y });
    }
    projPaths.push(pts);
  }

  function drawSmoothPath(pts, strokeStyle, lineWidth, alpha){
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Precompute a "settled" fan envelope (min/max across sample paths at each x) for the shaded cone
  const envelopeSteps = 16;
  function envelopeAt(alpha){
    const upper = [], lower = [];
    for (let i = 0; i <= envelopeSteps; i++){
      let minY = Infinity, maxY = -Infinity, x = 0;
      projPaths.forEach(path => {
        const pt = path[Math.min(i, path.length - 1)];
        x = pt.x;
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      });
      const t = i / envelopeSteps;
      const grow = 0.35 + 0.65 * t; // cone narrower near histEnd, wider further out — animated via alpha
      const mid = (minY + maxY) / 2;
      upper.push({ x, y: mid - (mid - minY) * grow * alpha });
      lower.push({ x, y: mid + (maxY - mid) * grow * alpha });
    }
    return { upper, lower };
  }

  let start = null;
  const cycleMs = 6500;

  function frame(ts){
    if (start === null) start = ts;
    const elapsed = (ts - start) % cycleMs;
    const phase = elapsed / cycleMs; // 0 -> 1 loop

    // draw-in phase for history (0 - 0.28), fan reveal (0.15 - 0.55), settle+shimmer (0.55 - 1)
    const histReveal = Math.min(1, phase / 0.28);
    const fanReveal = Math.max(0, Math.min(1, (phase - 0.15) / 0.4));
    const shimmerT = Math.max(0, (phase - 0.55) / 0.45);

    ctx.clearRect(0, 0, w, h);

    // baseline axis
    ctx.strokeStyle = 'rgba(133,146,172,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, h - 6);
    ctx.lineTo(w - 4, h - 6);
    ctx.stroke();

    // historical curve, revealed left-to-right
    const revealCount = Math.max(2, Math.floor(histPoints.length * histReveal));
    drawSmoothPath(histPoints.slice(0, revealCount), teal, 2, 1);

    if (fanReveal > 0){
      // shaded uncertainty cone
      const { upper, lower } = envelopeAt(fanReveal);
      ctx.save();
      ctx.globalAlpha = 0.16 * fanReveal;
      ctx.fillStyle = teal;
      ctx.beginPath();
      ctx.moveTo(upper[0].x, upper[0].y);
      upper.forEach(pt => ctx.lineTo(pt.x, pt.y));
      for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i].x, lower[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // faint individual scenario paths
      projPaths.forEach((path, idx) => {
        const count = Math.max(2, Math.floor(path.length * fanReveal));
        drawSmoothPath(path.slice(0, count), idx === 0 ? gold : teal, 1, idx === 0 ? 0.55 : 0.22);
      });

      // traveling marker along the "expected" (first/central) path once fan is mostly drawn
      if (shimmerT > 0 || fanReveal >= 0.98){
        const centralPath = projPaths[0];
        const travel = reduced ? 0.5 : (0.15 + 0.85 * Math.min(1, shimmerT + 0.15));
        const idxF = travel * (centralPath.length - 1);
        const i0 = Math.floor(idxF), i1 = Math.min(centralPath.length - 1, i0 + 1);
        const tt = idxF - i0;
        const mx = centralPath[i0].x + (centralPath[i1].x - centralPath[i0].x) * tt;
        const my = centralPath[i0].y + (centralPath[i1].y - centralPath[i0].y) * tt;
        ctx.save();
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // marker at the historical/projection junction
    ctx.save();
    ctx.fillStyle = teal;
    ctx.beginPath();
    ctx.arc(lastHist.x, lastHist.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!reduced) requestAnimationFrame(frame);
  }

  if (reduced){
    frame(cycleMs); // draw one static, fully-settled frame
  } else {
    requestAnimationFrame(frame);
  }
}

document.querySelectorAll('.model-card__chart').forEach((el, i) => {
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);
  initModelVisual(canvas, 1000 + i * 777);
});

/* ================= Actuarial Science page: see actuarial-science.html / actuarial-science.js ================= */
