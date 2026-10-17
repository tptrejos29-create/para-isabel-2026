/* ============================================================
   ISABEL — Una historia bajo las estrellas
   Cielo estrellado, sobre de entrada, capítulos, reproductor,
   contador y cuenta regresiva.
   ============================================================ */
'use strict';

const CFG = window.CONFIG;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Para probar: ?t=2026-10-30T23:59:40 simula esa hora · ?dia fuerza el desbloqueo */
const params = new URLSearchParams(location.search);
const clockOffset = params.get('t') ? new Date(params.get('t')) - new Date() : 0;
const now = () => new Date(Date.now() + clockOffset);
const FORCE_OPEN = params.has('dia');

/* Nombre en todos los lugares */
$$('[data-name]').forEach(el => (el.textContent = CFG.nombre));
document.title = `${CFG.nombre} ✦ una historia para ti`;

/* ─────────────────────────────────────────────
   1. CIELO — estrellas, estrellas fugaces y pétalos
   ───────────────────────────────────────────── */
(function sky() {
  const cv = $('#sky'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, stars = [], petals = [], shoots = [], nextShoot = 0;

  const TINTS = ['255,255,255', '255,255,255', '255,214,226', '240,214,150'];

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = Math.min(Math.floor((W * H) / 5200), 240);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + .3, depth: Math.random() * .9 + .1,
      ph: Math.random() * 6.28, sp: Math.random() * .02 + .005,
      c: TINTS[(Math.random() * TINTS.length) | 0]
    }));

    const pn = W < 700 ? 12 : 22;
    petals = Array.from({ length: pn }, () => newPetal(true));
  }

  function newPetal(init) {
    return {
      x: Math.random() * W, y: init ? Math.random() * H : -30,
      s: Math.random() * 9 + 5, vx: (Math.random() - .5) * .8, vy: Math.random() * .7 + .35,
      a: Math.random() * 6.28, va: (Math.random() - .5) * .035,
      al: Math.random() * .22 + .08, h: 335 + Math.random() * 25
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const sy = scrollY;

    for (const s of stars) {
      s.ph += s.sp;
      const a = .35 + .65 * (.5 + .5 * Math.sin(s.ph));
      let y = (s.y - sy * s.depth * .08) % H; if (y < 0) y += H;
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(${s.c},${a})`; ctx.fill();
      if (s.r > 1.1) { ctx.beginPath(); ctx.arc(s.x, y, s.r * 3, 0, 6.283); ctx.fillStyle = `rgba(${s.c},${a * .08})`; ctx.fill(); }
    }

    for (const p of petals) {
      p.x += p.vx + Math.sin(p.a * .6) * .4; p.y += p.vy; p.a += p.va;
      if (p.y > H + 40) Object.assign(p, newPetal(false));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.al;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s * .45, p.s, 0, 0, 6.283);
      ctx.fillStyle = `hsl(${p.h},75%,68%)`; ctx.fill(); ctx.restore();
    }

    if (t > nextShoot) {
      shoots.push({ x: Math.random() * W * .8 + W * .1, y: Math.random() * H * .35, l: 0, life: 0, ang: Math.PI * (.17 + Math.random() * .1) });
      nextShoot = t + 5000 + Math.random() * 6000;
    }
    shoots = shoots.filter(s => s.life < 1);
    for (const s of shoots) {
      s.life += .018;
      const d = s.life * 380, tail = 110 * Math.sin(Math.min(s.life, 1) * Math.PI);
      const x = s.x + Math.cos(s.ang) * d, y = s.y + Math.sin(s.ang) * d;
      const g = ctx.createLinearGradient(x, y, x - Math.cos(s.ang) * tail, y - Math.sin(s.ang) * tail);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,200,220,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(s.ang) * tail, y - Math.sin(s.ang) * tail); ctx.stroke();
    }
  }

  function loop(t) {
    if (!document.hidden) draw(t);
    requestAnimationFrame(loop);
  }

  addEventListener('resize', build);
  build();
  if (REDUCED) draw(0); else { nextShoot = 3000; requestAnimationFrame(loop); }
})();

/* ─────────────────────────────────────────────
   2. REPRODUCTOR
   ───────────────────────────────────────────── */
const Music = (function () {
  const tracks = CFG.canciones || [];
  const audio = new Audio();
  audio.preload = 'auto';
  const failed = new Set();
  let idx = 0, fadeTimer = null, started = false;

  const player = $('#player'), plPlay = $('#plPlay'), icPlay = $('#icPlay'), icPause = $('#icPause');
  const plTitle = $('#plTitle'), plSub = $('#plSub'), plFill = $('#plFill'), plBar = $('#plBar');

  function fadeTo(v, ms = 1500) {
    clearInterval(fadeTimer);
    const from = audio.volume, steps = 30;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++; audio.volume = Math.max(0, Math.min(1, from + (v - from) * (i / steps)));
      if (i >= steps) clearInterval(fadeTimer);
    }, ms / steps);
  }

  function paintUI() {
    const t = tracks[idx];
    if (t) {
      plTitle.textContent = t.titulo; plSub.textContent = t.artista || ' ';
      if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: t.titulo, artist: t.artista || CFG.nombre });
    }
    const playing = !audio.paused;
    icPlay.style.display = playing ? 'none' : 'block';
    icPause.style.display = playing ? 'block' : 'none';
    $$('.track').forEach(b => {
      const i = +b.dataset.i;
      b.classList.toggle('active', i === idx);
      b.classList.toggle('playing', i === idx && playing);
    });
  }

  function load(i) {
    idx = (i + tracks.length) % tracks.length;
    audio.src = tracks[idx].src;
    audio.load();
    plFill.style.width = '0%';
    paintUI();
  }

  function play() {
    if (!tracks.length) return;
    audio.volume = started ? audio.volume : 0;
    const p = audio.play();
    if (p && p.then) p.then(() => { started = true; fadeTo(.75); paintUI(); }).catch(() => paintUI());
  }
  function pause() { fadeTo(0, 400); setTimeout(() => { audio.pause(); paintUI(); }, 420); }
  function toggle() { audio.paused ? play() : pause(); }

  function next(step = 1) {
    for (let k = 0; k < tracks.length; k++) {
      load(idx + step);
      if (!failed.has(idx)) { play(); return; }
    }
  }

  function playIndex(i) {
    if (failed.has(i)) return;
    if (i === idx && !audio.paused) { pause(); return; }
    if (i !== idx) load(i);
    play();
  }

  audio.addEventListener('ended', () => (tracks.length > 1 ? next(1) : (audio.currentTime = 0, play())));
  audio.addEventListener('play', paintUI);
  audio.addEventListener('pause', paintUI);
  audio.addEventListener('timeupdate', () => { if (audio.duration) plFill.style.width = (audio.currentTime / audio.duration * 100) + '%'; });
  let pendingStart = false;
  audio.addEventListener('error', () => {
    /* archivo faltante o ilegible: se marca y se pasa a la siguiente canción */
    failed.add(idx);
    $$('.track').forEach(b => { if (+b.dataset.i === idx) b.disabled = true; });
    if (failed.size >= tracks.length) { player.hidden = true; return; }
    const wantPlay = pendingStart || started;
    let k = 0, j = idx;
    do { j = (j + 1) % tracks.length; } while (failed.has(j) && ++k < tracks.length);
    load(j);
    if (wantPlay) play();
  });

  plPlay.addEventListener('click', toggle);
  $('#plPrev').addEventListener('click', () => next(-1));
  $('#plNext').addEventListener('click', () => next(1));
  plBar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = plBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  /* Lista de canciones del capítulo IV */
  const list = $('#trackList');
  tracks.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'track glass'; b.dataset.i = i;
    b.innerHTML = `<span class="tn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
      <span><span class="tt"></span><span class="tnote"></span></span>
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
    $('.tt', b).textContent = t.titulo;
    $('.tnote', b).textContent = t.nota || '';
    b.addEventListener('click', () => playIndex(i));
    list.appendChild(b);
  });

  if (tracks.length) { player.hidden = false; load(0); }
  if (tracks.length < 2) { $('#plPrev').hidden = true; $('#plNext').hidden = true; }

  return {
    start() { pendingStart = true; play(); },
  };
})();

/* ─────────────────────────────────────────────
   3. SOBRE DE ENTRADA
   ───────────────────────────────────────────── */
(function gate() {
  const gateEl = $('#gate'), env = $('#envelope');
  let opened = false;
  function open() {
    if (opened) return; opened = true;
    env.classList.add('open');
    Music.start();                       // el toque del usuario habilita el audio
    setTimeout(() => {
      gateEl.classList.add('gone');
      document.body.classList.remove('is-locked');
      scrollTo(0, 0);
      $$('#hero .reveal').forEach(el => el.classList.add('in'));
      burstHearts(14);
    }, 1900);
  }
  env.addEventListener('click', open);
  gateEl.addEventListener('click', open);
})();

/* ─────────────────────────────────────────────
   4. GALERÍA + VISOR
   ───────────────────────────────────────────── */
(function gallery() {
  const box = $('#gallery'), lb = $('#lightbox'), lbImg = $('#lbImg');
  (CFG.fotos || []).forEach((f, i) => {
    const el = document.createElement('button');
    el.className = 'polaroid reveal'; el.type = 'button';
    el.style.setProperty('--r', (i % 2 ? 2.4 : -2.4) + 'deg');
    el.style.transitionDelay = (i * .15) + 's';
    el.innerHTML = `<div class="ph"><img loading="lazy" alt=""></div><div class="cap"><span></span><small></small></div>`;
    const img = $('img', el); img.src = f.src; img.alt = f.titulo || ''; if (f.pos) img.style.objectPosition = f.pos;
    $('.cap span', el).textContent = f.titulo || '';
    $('.cap small', el).textContent = f.pie || '';
    el.addEventListener('click', () => { lbImg.src = f.src; lb.hidden = false; });
    box.appendChild(el);
  });
  const close = () => { lb.hidden = true; };
  lb.addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ─────────────────────────────────────────────
   5. REVEAL, CONSTELACIÓN Y PROGRESO
   ───────────────────────────────────────────── */
(function scrollFx() {
  /* aparición */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !document.body.classList.contains('is-locked')) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  const watch = () => $$('.reveal:not(#hero .reveal)').forEach(el => io.observe(el));
  watch();
  /* si el sobre aún está cerrado, los observadores se activan al abrir */
  const unlock = new MutationObserver(() => { if (!document.body.classList.contains('is-locked')) { unlock.disconnect(); $$('.reveal:not(#hero .reveal)').forEach(el => { io.unobserve(el); io.observe(el); }); } });
  unlock.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* constelación */
  const rail = $('#rail');
  const secs = $$('#story > header, #story > section');
  secs.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = '#' + (s.id || 'hero'); a.innerHTML = `<i></i><span></span>`;
    $('span', a).textContent = s.dataset.title || '';
    a.addEventListener('click', e => { e.preventDefault(); s.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); });
    rail.appendChild(a);
  });
  const dots = $$('a', rail);
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const k = secs.indexOf(e.target);
    dots.forEach((d, j) => { d.classList.toggle('on', j === k); d.classList.toggle('past', j < k); });
  }), { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => so.observe(s));

  /* progreso */
  const bar = $('#progress');
  const upd = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener('scroll', upd, { passive: true }); upd();
})();

/* ─────────────────────────────────────────────
   6. CORAZONES
   ───────────────────────────────────────────── */
const HEARTS = ['❤️', '🩷', '💕', '💗', '✨', '🌹'];
function spawnHeart(big) {
  const el = document.createElement('span');
  el.className = 'f-heart';
  el.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];
  const d = Math.random() * 10 + (big ? 7 : 11);
  el.style.cssText = `left:${Math.random() * 96}%;font-size:${(Math.random() * 16 + (big ? 20 : 10))}px;animation-duration:${d}s;--drift:${(Math.random() - .5) * 90}px`;
  $('#hearts').appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}
function burstHearts(n) { for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 140); }
if (!REDUCED) setInterval(() => { if (!document.hidden && !document.body.classList.contains('is-locked')) spawnHeart(false); }, 2600);

/* ─────────────────────────────────────────────
   7. RELOJES — desde aquel día / hasta el gran día
   ───────────────────────────────────────────── */
(function clocks() {
  const since = new Date(CFG.desde), until = new Date(CFG.propuesta);
  const finale = $('#finale');
  const pad = n => String(n).padStart(2, '0');

  function fill(root, ms) {
    ms = Math.max(0, ms);
    const s = Math.floor(ms / 1000);
    const v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    for (const k in v) {
      const el = $(`[data-u="${k}"]`, root), txt = pad(v[k]);
      if (el.textContent !== txt) { el.textContent = txt; if (k === 's' || k === 'm') { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } }
    }
  }

  let wasOpen = false;
  function update() {
    const n = now();
    fill($('#clockSince'), n - since);
    const remaining = until - n;
    const open = FORCE_OPEN || remaining <= 0;
    fill($('#clockUntil'), remaining);
    finale.dataset.state = open ? 'open' : 'locked';
    if (open && !wasOpen) { wasOpen = true; if (!FORCE_OPEN) burstHearts(24); }
  }
  update(); setInterval(update, 500);
})();
