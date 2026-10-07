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

/* ================= Model card visuals: survival-weighted cash flows + reserve run-off ================= */
function initModelVisual(canvas, variant){
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const teal = css('--teal') || '#35C9B0', gold = css('--gold') || '#C9A24B', muted = css('--muted') || '#8592AC';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 26, cycleMs = 7000;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const clamp01 = v => Math.max(0, Math.min(1, v));

  // Annuity payments weighted by survival probability, and remaining reserve (PV of future payments)
  const bars = [], reserve = [];
  for (let i = 0; i < N; i++) bars.push(Math.exp(-2.3 * Math.pow(i / N, 1.7)));
  for (let i = 0; i < N; i++) reserve.push(bars.slice(i).reduce((a, b) => a + b, 0));
  const rMax = reserve[0];
  for (let i = 0; i < N; i++) reserve[i] /= rMax;

  let w, h;
  function resize(){
    w = canvas.clientWidth || canvas.parentElement.clientWidth;
    h = canvas.clientHeight || 90;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) frame(cycleMs * 0.75);
  }

  function frame(ts){
    const phase = (ts % cycleMs) / cycleMs;
    const padX = 4, base = h - 8, top = 10, plotH = base - top;
    const step = (w - padX * 2) / N, bw = Math.max(3, step * 0.58);
    const fade = phase > 0.94 ? 1 - (phase - 0.94) / 0.06 : 1;
    const sweep = clamp01((phase - 0.5) / 0.4);        // 0 -> 1 marker travel
    const lineT = clamp01((phase - 0.22) / 0.4);       // reserve line draw-in

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = fade;

    // baseline
    ctx.strokeStyle = 'rgba(133,146,172,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padX, base + 0.5); ctx.lineTo(w - padX, base + 0.5); ctx.stroke();

    if (variant === 'placeholder'){
      // quiet dashed outline bars with a soft light sweeping across
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      const pos = phase * (N + 8) - 4;
      for (let i = 0; i < N; i++){
        const bh = plotH * (0.35 + 0.3 * Math.sin(i * 0.5) * Math.sin(i * 0.17 + 1));
        const near = Math.max(0, 1 - Math.abs(i - pos) / 4);
        ctx.strokeStyle = near > 0 ? teal : muted;
        ctx.globalAlpha = fade * (0.22 + 0.7 * near);
        ctx.strokeRect(padX + i * step + (step - bw) / 2 + 0.5, base - bh, bw, bh);
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      if (!reduced) requestAnimationFrame(frame);
      return;
    }

    // bars: grow in staggered, then light up as the marker passes
    const mx = padX + step * N * sweep;
    for (let i = 0; i < N; i++){
      const g = ease(clamp01((phase / 0.4) * 1.6 - (i / N) * 0.6));
      const bh = bars[i] * plotH * 0.82 * g;
      const x = padX + i * step + (step - bw) / 2;
      const lit = sweep > 0 ? Math.max(0, 1 - Math.abs(x + bw / 2 - mx) / (step * 5)) : 0;
      const grad = ctx.createLinearGradient(0, base - bh, 0, base);
      grad.addColorStop(0, teal);
      grad.addColorStop(1, 'rgba(53,201,176,0.05)');
      ctx.globalAlpha = fade * (0.35 + 0.55 * lit);
      ctx.fillStyle = grad;
      ctx.fillRect(x, base - bh, bw, bh);
    }
    ctx.globalAlpha = fade;

    // reserve run-off line
    const pts = [];
    for (let i = 0; i < N; i++) pts.push({ x: padX + i * step + step / 2, y: base - reserve[i] * plotH * 0.92 });
    const shown = lineT * (N - 1);
    ctx.strokeStyle = gold; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= Math.floor(shown); i++) ctx.lineTo(pts[i].x, pts[i].y);
    const fi = Math.floor(shown);
    if (fi < N - 1){
      const f = shown - fi;
      ctx.lineTo(pts[fi].x + (pts[fi + 1].x - pts[fi].x) * f, pts[fi].y + (pts[fi + 1].y - pts[fi].y) * f);
    }
    ctx.stroke();

    // marker riding the reserve line
    if (sweep > 0){
      const idx = sweep * (N - 1), i0 = Math.floor(idx), i1 = Math.min(N - 1, i0 + 1), f = idx - i0;
      const px = pts[i0].x + (pts[i1].x - pts[i0].x) * f, py = pts[i0].y + (pts[i1].y - pts[i0].y) * f;
      ctx.fillStyle = gold;
      ctx.globalAlpha = fade * 0.22; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = fade;        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduced) requestAnimationFrame(frame);
}

document.querySelectorAll('.model-card__chart').forEach(el => {
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);
  initModelVisual(canvas, el.dataset.chart === 'reserve' ? 'reserve' : 'placeholder');
});

/* ================= Actuarial Science page: see pages/actuarial-science/ / actuarial-science.js ================= */
