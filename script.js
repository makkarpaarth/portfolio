document.getElementById('year').textContent = new Date().getFullYear();

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

/* ================= Mini sparkline charts on model cards ================= */
function sparkline(seed){
  const pts = [];
  let v = 30 + seed * 7;
  for (let i = 0; i < 24; i++){
    v += (Math.sin(i * (0.4 + seed * 0.1)) * 6) + (Math.random() * 4 - 2);
    pts.push(v);
  }
  const min = Math.min(...pts), max = Math.max(...pts);
  const norm = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * 260;
    const y = 80 - ((p - min) / (max - min || 1)) * 70 - 5;
    return `${x},${y}`;
  });
  return `<svg viewBox="0 0 260 90" preserveAspectRatio="none">
    <polyline points="${norm.join(' ')}" fill="none" stroke="#35C9B0" stroke-width="2"/>
  </svg>`;
}
document.querySelectorAll('.model-card__chart').forEach((el, i) => {
  el.innerHTML = sparkline(i + 1);
});

/* ================= Blog: moved to blog.html / blog.js ================= */
