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

/* ================= Quiet animated visuals on model rows ================= */
function modelVisual(type){
  const visuals = {
    reserve: `<svg class="model-visual model-visual--reserve" viewBox="0 0 260 90" preserveAspectRatio="none" aria-hidden="true">
      <path class="model-visual__axis" d="M8 78H252"/>
      <path class="model-visual__curve" pathLength="1" d="M8 69C38 65 46 46 72 43S108 54 130 39s39-24 58-19 26 13 64-11"/>
      <circle class="model-visual__marker" cx="130" cy="39" r="3"/>
    </svg>`,
    unitlinked: `<svg class="model-visual model-visual--unitlinked" viewBox="0 0 260 90" preserveAspectRatio="none" aria-hidden="true">
      <path class="model-visual__axis" d="M8 78H252"/>
      <path class="model-visual__curve" pathLength="1" d="M8 65C31 58 42 37 65 42s27 21 48 10 28-34 50-30 26 22 43 17 28-22 46-29"/>
      <path class="model-visual__projection" d="M168 22V78"/>
      <circle class="model-visual__marker" cx="168" cy="22" r="3"/>
    </svg>`,
    workflow: `<svg class="model-visual model-visual--workflow" viewBox="0 0 260 90" preserveAspectRatio="none" aria-hidden="true">
      <path class="model-visual__axis" d="M18 45H242"/>
      <circle class="model-visual__node" cx="34" cy="45" r="7"/>
      <circle class="model-visual__node" cx="130" cy="45" r="7"/>
      <circle class="model-visual__node" cx="226" cy="45" r="7"/>
      <path class="model-visual__pulse" d="M34 45H226"/>
      <path class="model-visual__tick" d="M72 38l7 7-7 7M168 38l7 7-7 7"/>
    </svg>`
  };
  return visuals[type] || visuals.reserve;
}
document.querySelectorAll('.model-card__chart').forEach(el => {
  el.innerHTML = modelVisual(el.dataset.chart);
});

/* ================= Blog: moved to blog.html / blog.js ================= */
