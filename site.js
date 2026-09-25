import { en as runtimeEnglish, id as indonesian } from './i18n.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wide = window.matchMedia('(min-width: 900px)');
const mobile = window.matchMedia('(max-width: 1024px)');
const clamp = value => Math.min(1, Math.max(0, value));

// Language: English is authored in the HTML; Indonesian replaces it from i18n.js.
const textNodes = [...document.querySelectorAll('[data-i18n]')].map(node => [node, node.innerHTML]);
const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')].map(node => [node, node.dataset.i18nAttr.split(',').map(pair => {
  const [attr, key] = pair.split(':');
  return [attr, key, node.getAttribute(attr)];
})]);
let lang = 'en';
const t = key => (lang === 'id' && indonesian[key]) || runtimeEnglish[key];
const languageListeners = [];

function setLanguage(next, persist) {
  lang = next === 'id' ? 'id' : 'en';
  document.documentElement.lang = lang;
  for (const [node, english] of textNodes) node.innerHTML = lang === 'id' ? indonesian[node.dataset.i18n] ?? english : english;
  for (const [node, pairs] of attrNodes) for (const [attr, key, english] of pairs) node.setAttribute(attr, lang === 'id' ? indonesian[key] ?? english : english);
  for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  if (persist) {
    try { localStorage.setItem('koi-lang', lang); } catch { /* Storage can be blocked; the URL still carries the choice. */ }
    const url = new URL(location.href);
    if (lang === 'id') url.searchParams.set('lang', 'id');
    else url.searchParams.delete('lang');
    history.replaceState(history.state, '', url);
  }
  languageListeners.forEach(listener => listener());
}
for (const button of document.querySelectorAll('[data-lang]')) button.addEventListener('click', () => setLanguage(button.dataset.lang, true));

// Navigation
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
mobile.addEventListener('change', () => closeMenu());

// Motion: one switch pauses CSS animation, the hero film, and the pond.
const motionButton = document.querySelector('.motion-control');
const video = document.querySelector('#hero-video');
let paused = reducedMotion.matches;
function applyMotion() {
  document.documentElement.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('.motion-label').textContent = t(paused ? 'motion.resume' : 'motion.pause');
  motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  if (paused) video.pause();
  else if (video.hasAttribute('src')) video.play().catch(() => document.body.classList.remove('video-ready'));
}
languageListeners.push(applyMotion);
motionButton.hidden = false;
motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); renderSystems(); });
video.addEventListener('playing', () => document.body.classList.add('video-ready'));
video.addEventListener('error', () => document.body.classList.remove('video-ready'));
const videoUrl = document.querySelector('meta[name="hero-video-url"]').content.trim();
if (videoUrl) {
  try {
    const url = new URL(videoUrl, location.href);
    if ((url.protocol === 'https:' || url.origin === location.origin) && !url.username && !url.password) {
      video.muted = true; video.src = url.href; video.autoplay = !paused;
    }
  } catch { /* Invalid configuration keeps the gradient. */ }
}

// Before/after: on wide screens the section pins and the scattered tool chips fly
// into the ring around Koi as the visitor scrolls. Elsewhere (narrow screens,
// reduced motion) both panels are static and the ring assembles once in view.
const systems = document.querySelector('.systems');
const track = systems.querySelector('.systems-track');
const chips = [...systems.querySelectorAll('.tool .tool-chip')];
const slots = [...systems.querySelectorAll('.hub-node .tool-chip')];
const applied = chips.map(() => ({ x: 0, y: 0 }));
let offsets = [];
let flying = false;
let frame = 0;
const ease = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

function measureSystems() {
  // Rect centres ignore rotation, so subtracting the translation already applied
  // recovers each chip's resting centre without resetting its transform.
  offsets = chips.map((chip, index) => {
    const from = chip.getBoundingClientRect();
    const to = slots[index].getBoundingClientRect();
    return {
      x: to.left + to.width / 2 - (from.left + from.width / 2 - applied[index].x),
      y: to.top + to.height / 2 - (from.top + from.height / 2 - applied[index].y)
    };
  });
}
function systemsProgress() {
  const rect = track.getBoundingClientRect();
  return clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
}
function renderSystems() {
  frame = 0;
  if (!flying) return;
  // Paused motion shows the finished ring; the section stays pinned so nothing jumps.
  const progress = paused ? 1 : systemsProgress();
  chips.forEach((chip, index) => {
    const eased = ease(clamp((progress - .12 - index * .035) / .4));
    // Alternate arcs keep chips from stacking on each other mid-flight; sin(π) = 0 so they still land exactly.
    const arc = Math.sin(Math.PI * eased) * (index % 2 ? 44 : -44);
    applied[index] = { x: offsets[index].x * eased, y: offsets[index].y * eased + arc };
    chip.style.transform = `translate(${applied[index].x}px, ${applied[index].y}px) rotate(calc(var(--r) * ${1 - eased}))`;
  });
  systems.style.setProperty('--hub', clamp((progress - .05) / .25));
  systems.style.setProperty('--draw', clamp((progress - .6) / .25));
  systems.classList.toggle('is-connected', progress > .86);
}
function setSystemsMode() {
  const wasFlying = flying;
  flying = wide.matches && !reducedMotion.matches;
  systems.classList.toggle('is-flying', flying);
  if (flying) { measureSystems(); renderSystems(); return; }
  chips.forEach((chip, index) => { chip.style.transform = ''; applied[index] = { x: 0, y: 0 }; });
  systems.style.removeProperty('--hub');
  systems.style.removeProperty('--draw');
  if (wasFlying) systems.classList.add('is-connected');
}
window.addEventListener('scroll', () => { if (flying && !frame) frame = requestAnimationFrame(renderSystems); }, { passive: true });
new ResizeObserver(() => { if (flying) { measureSystems(); renderSystems(); } }).observe(systems);
languageListeners.push(() => { if (flying) { measureSystems(); renderSystems(); } });
document.fonts?.ready.then(() => { if (flying) { measureSystems(); renderSystems(); } });
wide.addEventListener('change', setSystemsMode);
reducedMotion.addEventListener('change', event => { paused = event.matches; applyMotion(); setSystemsMode(); });

// Reveals, and the static before/after ring assembling in view.
const revealAll = () => {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  systems.classList.add('is-connected');
};
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  const ringObserver = new IntersectionObserver(entries => {
    if (!flying && entries.some(entry => entry.isIntersecting)) systems.classList.add('is-connected');
  }, { threshold: 0.35 });
  ringObserver.observe(systems.querySelector('.panel-after'));
}
else revealAll();

// Off-screen sections stop animating; the hero film pauses with them.
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
      if (entry.target === hero && video.hasAttribute('src')) {
        if (!entry.isIntersecting) video.pause();
        else if (!paused) video.play().catch(() => document.body.classList.remove('video-ready'));
      }
    }
  }, { rootMargin: '120px 0px' });
  document.querySelectorAll('main > section, .connection-ribbon').forEach(section => visibility.observe(section));
}

// "What can we build" cards jump to the form with the interest chosen.
const form = document.querySelector('#enquiry-form');
const interest = form.querySelector('#f-interest');
for (const card of document.querySelectorAll('[data-interest]')) {
  card.addEventListener('click', () => {
    interest.value = card.dataset.interest;
    const field = interest.closest('.field');
    field.classList.remove('is-flash');
    void field.offsetWidth;
    field.classList.add('is-flash');
  });
}

// Enquiry form: Web3Forms from the browser. Without JavaScript the native POST
// still reaches Web3Forms, which shows its own confirmation page.
const status = form.querySelector('.form-status');
const submit = form.querySelector('.form-submit');
const success = document.querySelector('.form-success');
form.addEventListener('submit', async event => {
  event.preventDefault();
  submit.disabled = true;
  status.classList.remove('is-error');
  status.textContent = t('form.sending');
  try {
    const data = Object.fromEntries(new FormData(form));
    data.language = lang;
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || `HTTP ${response.status}`);
    form.reset();
    status.textContent = '';
    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch {
    // Keep everything the visitor typed; only the status changes.
    status.textContent = t('form.error');
    status.classList.add('is-error');
  } finally {
    submit.disabled = false;
  }
});
success.querySelector('.form-again').addEventListener('click', () => {
  success.hidden = true;
  form.hidden = false;
  form.querySelector('#f-name').focus();
});

let storedLanguage = null;
try { storedLanguage = localStorage.getItem('koi-lang'); } catch { /* Blocked storage falls back to English. */ }
const requestedLanguage = new URLSearchParams(location.search).get('lang') || storedLanguage;
if (requestedLanguage === 'id') setLanguage('id', false);
document.documentElement.classList.add('js');
applyMotion();
setSystemsMode();

// Restored from the original Koi site: an interactive canvas pond, moved below
// the process section so it does not compete with the video hero.
{
  const canvas = document.querySelector('#koiCanvas');
  const pond = canvas?.parentElement;
  if (canvas && pond) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let scale = 1;
    const pointer = { x: 0, y: 0, active: false };
    const ripples = [];

    function resizePond() {
      const rect = pond.getBoundingClientRect();
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      pointer.x = width / 2;
      pointer.y = height / 2;
    }

    class Koi {
      constructor(x, y, fishScale) {
        this.x = x;
        this.y = y;
        this.scale = fishScale;
        this.angle = Math.random() * Math.PI * 2;
        this.swimCycle = Math.random() * 100;
        this.segmentLength = 12 * fishScale;
        this.widths = [14, 18, 22, 24, 25, 24, 22, 19, 16, 13, 10, 8, 6, 5, 4, 3].map(value => value * fishScale);
        this.spine = this.widths.map((_, index) => ({ x: x - index * this.segmentLength, y, angle: this.angle }));
        this.target = { x, y };
        this.targetTimer = 0;
        this.splotches = [
          { index: 1, offset: 0, size: 18 * fishScale, color: '#ff4a22' },
          { index: 3, offset: 2 * fishScale, size: 17 * fishScale, color: '#ff4a22' },
          { index: 6, offset: -3 * fishScale, size: 16 * fishScale, color: '#1f1a18' },
          { index: 9, offset: 2 * fishScale, size: 13 * fishScale, color: '#ff4a22' }
        ];
      }

      chooseTarget() {
        const margin = Math.min(90, width * 0.12, height * 0.28);
        this.target.x = margin + Math.random() * Math.max(1, width - margin * 2);
        this.target.y = margin + Math.random() * Math.max(1, height - margin * 2);
        this.targetTimer = 180 + Math.random() * 240;
      }

      update() {
        this.swimCycle += 0.05;
        this.targetTimer -= 1;
        if (pointer.active) this.target = { x: pointer.x, y: pointer.y };
        else if (this.targetTimer <= 0 || Math.hypot(this.target.x - this.x, this.target.y - this.y) < 54) this.chooseTarget();
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);
        const wantedAngle = Math.atan2(dy, dx);
        let difference = wantedAngle - this.angle;
        while (difference > Math.PI) difference -= Math.PI * 2;
        while (difference < -Math.PI) difference += Math.PI * 2;
        this.angle += difference * 0.025;
        const stroke = Math.sin(this.swimCycle) * 0.5 + 0.5;
        const speed = Math.min(distance * 0.012, 2 * this.scale) * 0.45 + stroke * this.scale * 0.45;
        this.x += Math.cos(this.angle) * speed;
        this.y += Math.sin(this.angle) * speed;
        this.spine[0] = { x: this.x, y: this.y, angle: this.angle };
        for (let index = 1; index < this.spine.length; index += 1) {
          const previous = this.spine[index - 1];
          const current = this.spine[index];
          current.angle = Math.atan2(previous.y - current.y, previous.x - current.x);
          current.x = previous.x - Math.cos(current.angle) * this.segmentLength;
          current.y = previous.y - Math.sin(current.angle) * this.segmentLength;
        }
      }

      path(left, right) {
        ctx.beginPath();
        ctx.moveTo(left[0].x, left[0].y);
        const head = this.spine[0];
        ctx.quadraticCurveTo(head.x + Math.cos(head.angle) * this.widths[0] * 1.5, head.y + Math.sin(head.angle) * this.widths[0] * 1.5, right[0].x, right[0].y);
        right.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        const tail = this.spine.at(-1);
        ctx.quadraticCurveTo(tail.x - Math.cos(tail.angle) * 5, tail.y - Math.sin(tail.angle) * 5, left.at(-1).x, left.at(-1).y);
        left.slice(0, -1).reverse().forEach(point => ctx.lineTo(point.x, point.y));
        ctx.closePath();
      }

      draw() {
        const left = [];
        const right = [];
        this.spine.forEach((point, index) => {
          const fishWidth = this.widths[index];
          left.push({ x: point.x + Math.cos(point.angle - Math.PI / 2) * fishWidth, y: point.y + Math.sin(point.angle - Math.PI / 2) * fishWidth });
          right.push({ x: point.x + Math.cos(point.angle + Math.PI / 2) * fishWidth, y: point.y + Math.sin(point.angle + Math.PI / 2) * fishWidth });
        });
        ctx.save();
        ctx.translate(14, 22);
        this.path(left, right);
        ctx.fillStyle = 'rgba(120,90,40,.18)';
        ctx.filter = 'blur(14px)';
        ctx.fill();
        ctx.restore();
        this.path(left, right);
        ctx.fillStyle = '#fbfaf4';
        ctx.fill();
        ctx.save();
        ctx.clip();
        this.splotches.forEach(({ index, offset, size, color }) => {
          const point = this.spine[index];
          ctx.save();
          ctx.translate(point.x, point.y);
          ctx.rotate(point.angle);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(offset, 0, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
        const tail = this.spine.at(-1);
        ctx.save();
        ctx.translate(tail.x, tail.y);
        ctx.rotate(tail.angle);
        const tailGradient = ctx.createLinearGradient(0, 0, -60 * this.scale, 0);
        tailGradient.addColorStop(0, 'rgba(255,255,255,.85)');
        tailGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = tailGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-20 * this.scale, -40 * this.scale, -60 * this.scale, -35 * this.scale);
        ctx.quadraticCurveTo(-40 * this.scale, 0, -60 * this.scale, 35 * this.scale);
        ctx.quadraticCurveTo(-20 * this.scale, 40 * this.scale, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    resizePond();
    const koi = [new Koi(width * 0.4, height * 0.5, 1.15), new Koi(width * 0.62, height * 0.55, 0.85), new Koi(width * 0.25, height * 0.7, 0.7)];
    const setPointer = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    pond.addEventListener('pointermove', setPointer);
    pond.addEventListener('pointerleave', () => { pointer.active = false; });
    pond.addEventListener('click', event => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, radius: 4, alpha: 0.5 });
    });
    window.addEventListener('resize', resizePond);

    function drawPond() {
      const background = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, Math.max(width, height));
      background.addColorStop(0, '#e8dcc2');
      background.addColorStop(.55, '#d4c4a3');
      background.addColorStop(1, '#a8946d');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      const time = Date.now() * .0003;
      ctx.save();
      ctx.globalAlpha = .4;
      for (let index = 0; index < 5; index += 1) {
        const x = width * .5 + Math.cos(time + index) * width * .3;
        const y = height * .5 + Math.sin(time * 1.3 + index * .7) * height * .3;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 160 + Math.sin(time * 2 + index) * 40);
        glow.addColorStop(0, 'rgba(255,184,0,.08)');
        glow.addColorStop(1, 'rgba(255,184,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,74,34,${ripple.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ripple.radius += 1.4;
        ripple.alpha -= .012;
        if (ripple.alpha <= 0) ripples.splice(index, 1);
      }
      koi.sort((first, second) => first.scale - second.scale).forEach(fish => { fish.update(); fish.draw(); });
    }

    function animatePond() {
      if (!document.documentElement.classList.contains('motion-paused') && !pond.hasAttribute('data-offscreen')) drawPond();
      requestAnimationFrame(animatePond);
    }
    drawPond();
    animatePond();
  }
}
