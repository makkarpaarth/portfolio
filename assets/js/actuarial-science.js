document.getElementById('year').textContent = new Date().getFullYear();

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

/* ================= Reveal panels: click to expand for more detail ================= */
document.querySelectorAll('.as-reveal__trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const reveal = btn.closest('.as-reveal');
    const isOpen = reveal.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.querySelector('.as-reveal__icon').textContent = isOpen ? '\u2212' : '+';
  });
});

/* ================= Field cards: keyboard support to mirror the hover reveal ================= */
document.querySelectorAll('.as-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('kb-open');
      const back = card.querySelector('.as-card__back');
      const front = card.querySelector('.as-card__front');
      if (card.classList.contains('kb-open')) {
        back.style.opacity = '1';
        back.style.transform = 'translateY(0)';
        front.style.opacity = '0';
      } else {
        back.style.opacity = '';
        back.style.transform = '';
        front.style.opacity = '';
      }
    }
  });
});

/* ================= Scroll-in reveal for each story section ================= */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.as-section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(16px)';
  section.style.transition = 'opacity .6s ease, transform .6s ease';
  sectionObserver.observe(section);
});
