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
