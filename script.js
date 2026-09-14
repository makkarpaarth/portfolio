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

/* ================= Add project (front-end only) ================= */
document.getElementById('add-model-btn').addEventListener('click', () => {
  const title = prompt('Project title:');
  if (!title) return;
  const desc = prompt('Short description:') || '';
  const tags = (prompt('Tags, comma separated:') || 'Python').split(',').map(t => t.trim());

  const card = document.createElement('article');
  card.className = 'model-card';
  card.innerHTML = `
    <div class="model-card__chart">${sparkline(Math.random() * 5 + 1)}</div>
    <h3 class="model-card__title">${escapeHTML(title)}</h3>
    <p class="model-card__desc">${escapeHTML(desc)}</p>
    <div class="model-card__tags">${tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>
  `;
  document.getElementById('model-grid').prepend(card);
});

/* ================= Blog: post / like / comment (front-end only, in-memory) ================= */
const blogList = document.getElementById('blog-list');
let posts = [
  {
    id: cryptoId(),
    title: 'Why non-life reserving needed Python, not just Excel',
    body: 'Chain-ladder triangles scale fine in a spreadsheet until you need to re-run them fifty times for a sensitivity check. Automating the pipeline turned a two-day task into ten minutes.',
    date: 'Sep 2026',
    likes: 3,
    liked: false,
    comments: ['Would love a write-up on the BF blend logic.']
  }
];

function cryptoId(){ return 'p' + Math.random().toString(36).slice(2, 9); }
function escapeHTML(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderPosts(){
  blogList.innerHTML = posts.map(p => `
    <article class="post" data-id="${p.id}">
      <h3 class="post__title">${escapeHTML(p.title)}</h3>
      <p class="post__meta">${p.date}</p>
      <p class="post__body">${escapeHTML(p.body)}</p>
      <div class="post__actions">
        <button class="post__like ${p.liked ? 'liked' : ''}" data-action="like">♥ ${p.likes}</button>
        <button class="post__comment-toggle" data-action="toggle">Comments (${p.comments.length})</button>
      </div>
      <div class="post__comments">
        ${p.comments.map(c => `<div class="comment">${escapeHTML(c)}</div>`).join('')}
        <form class="post__comment-form" data-action="comment-form">
          <input type="text" placeholder="Add a comment…" required>
          <button class="btn btn--ghost" type="submit">Send</button>
        </form>
      </div>
    </article>
  `).join('');
}
renderPosts();

document.getElementById('blog-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('blog-title').value.trim();
  const body = document.getElementById('blog-body').value.trim();
  if (!title || !body) return;
  posts.unshift({
    id: cryptoId(),
    title, body,
    date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    likes: 0, liked: false, comments: []
  });
  e.target.reset();
  renderPosts();
});

blogList.addEventListener('click', (e) => {
  const postEl = e.target.closest('.post');
  if (!postEl) return;
  const post = posts.find(p => p.id === postEl.dataset.id);

  if (e.target.dataset.action === 'like') {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    renderPosts();
  }
  if (e.target.dataset.action === 'toggle') {
    postEl.querySelector('.post__comments').classList.toggle('open');
  }
});

blogList.addEventListener('submit', (e) => {
  if (e.target.dataset.action !== 'comment-form') return;
  e.preventDefault();
  const postEl = e.target.closest('.post');
  const post = posts.find(p => p.id === postEl.dataset.id);
  const input = e.target.querySelector('input');
  if (!input.value.trim()) return;
  post.comments.push(input.value.trim());
  renderPosts();
  requestAnimationFrame(() => {
    const el = document.querySelector(`.post[data-id="${post.id}"] .post__comments`);
    if (el) el.classList.add('open');
  });
});
