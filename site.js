const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
const mobile = window.matchMedia('(max-width: 760px)');

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

const scenarios = {
  hr: { title: 'People & HR', access: 'Employees', messages: ['How much annual leave do I have left?', 'You have 8 days of annual leave remaining.', 'Planning some time off? Submit a request through your HR system. I can point you to the leave policy.'], source: 'Employee handbook', rows: [['PDF', 'Employee handbook', 'Company policy', 'Employees'], ['HR', 'Leave balances', 'Existing HR platform', 'Personal'], ['DOC', 'Onboarding guide', 'Shared company documents', 'Employees']] },
  knowledge: { title: 'Knowledge Management', access: 'By team', messages: ['Where’s the latest customer onboarding SOP?', 'I found the onboarding SOP in your shared company documents.', 'Start with the intake checklist, confirm the project owner, then schedule the kickoff. Open the source document for the full procedure.'], source: 'Customer onboarding SOP', rows: [['DOC', 'Customer onboarding SOP', 'Shared company documents', 'Client team'], ['PDF', 'Service playbook', 'Company knowledge', 'By team'], ['DOC', 'Project templates', 'Existing document storage', 'By team']] },
  founder: { title: 'Owner/Founder Intelligence', access: 'Owners', messages: ['What needs my attention this morning?', 'Revenue yesterday: Rp482M, up 6.2%. Two things need attention.', 'Outlet B revenue is down 18% and receivables are Rp320M overdue. Follow up with four high-value accounts today.'], source: 'Owner briefing', rows: [['FIN', 'Revenue summary', 'Accounting system', 'Owners'], ['HR', 'Team schedule', 'HR platform', 'Managers'], ['DOC', 'Project updates', 'Internal business tools', 'Owners']] }
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
let currentScenario = 'hr';
function renderConversation() {
  const scenario = scenarios[currentScenario];
  const messages = scenario.messages.map((text, index) => {
    const message = document.createElement('div');
    message.className = `message ${index ? 'message-in' : 'message-out'}`;
    message.style.setProperty('--message-delay', `${index * 350}ms`);
    message.textContent = text;
    const note = document.createElement(index === 2 ? 'span' : 'small');
    if (index === 2) note.className = 'message-source';
    note.textContent = index === 2 ? `Source: ${scenario.source}` : index ? 'Koi assistant' : '9:41';
    message.append(note);
    return message;
  });
  document.querySelector('.chat-messages').replaceChildren(...messages);
}
function selectTab(tab) {
  currentScenario = tab.dataset.demo;
  const scenario = scenarios[currentScenario];
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  }
  document.querySelector('#demo-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#console-title').textContent = scenario.title;
  document.querySelector('#console-access').textContent = scenario.access;
  document.querySelector('#source-rows').replaceChildren(...scenario.rows.map(([icon, title, subtitle, access]) => {
    const row = document.createElement('div'); row.className = 'source-row';
    const file = document.createElement('span'); file.className = 'file-icon'; file.setAttribute('aria-hidden', 'true'); file.textContent = icon;
    const label = document.createElement('div');
    const heading = document.createElement('strong'); heading.textContent = title;
    const description = document.createElement('small'); description.textContent = subtitle;
    label.append(heading, description);
    const permission = document.createElement('span'); permission.textContent = access;
    row.append(file, label, permission); return row;
  }));
  renderConversation();
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); selectTab(tabs[next]); tabs[next].focus();
  });
}
for (const link of document.querySelectorAll('[data-scenario]')) {
  link.addEventListener('click', () => selectTab(tabs.find(tab => tab.dataset.demo === link.dataset.scenario)));
}
document.querySelector('.replay-button').addEventListener('click', renderConversation);
for (const button of document.querySelectorAll('[data-console-view]')) {
  button.addEventListener('click', () => {
    for (const item of document.querySelectorAll('[data-console-view]')) item.setAttribute('aria-pressed', String(item === button));
    document.querySelector('#console-sources').hidden = button.dataset.consoleView !== 'sources';
    document.querySelector('#console-activity').hidden = button.dataset.consoleView !== 'activity';
  });
}

const bookingDialog = document.getElementById('booking-dialog');
let bookingTrigger;
for (const trigger of document.querySelectorAll('[data-booking]')) {
  trigger.addEventListener('click', event => {
    if (typeof bookingDialog.showModal !== 'function') return;
    event.preventDefault();
    bookingTrigger = trigger;
    bookingDialog.showModal();
  });
}
bookingDialog.querySelector('.dialog-close').addEventListener('click', () => bookingDialog.close());
bookingDialog.addEventListener('click', event => {
  const rect = bookingDialog.getBoundingClientRect();
  if (event.target === bookingDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) bookingDialog.close();
});
bookingDialog.addEventListener('close', () => {
  if (bookingTrigger && getComputedStyle(bookingTrigger).display !== 'none' && bookingTrigger.getClientRects().length) bookingTrigger.focus();
  else menuButton.focus();
});

// TODO: Set the calendly-event-url meta value once Koi's event URL is available.
// Until then, the visible booking placeholder and email fallback remain usable.
const eventUrl = document.querySelector('meta[name="calendly-event-url"]').content.trim();
if (eventUrl) {
  try {
    const url = new URL(eventUrl);
    if (url.protocol === 'https:' && ['calendly.com', 'www.calendly.com'].includes(url.hostname) && url.pathname !== '/' && !url.username && !url.password) {
      for (const link of document.querySelectorAll('[data-calendly-link]')) {
        link.href = url.href;
        link.hidden = false;
      }
      for (const notice of document.querySelectorAll('[data-booking-placeholder]')) notice.hidden = true;
    }
  } catch {
    // An invalid configuration keeps the email option instead of a broken link.
  }
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-control');
const video = document.querySelector('#hero-video');
const videoStatus = document.querySelector('#video-status');
let paused = reducedMotion.matches;
function applyMotion() {
  document.documentElement.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
  motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  if (paused) video.pause();
  else if (video.hasAttribute('src')) video.play().catch(() => {
    document.body.classList.remove('video-ready'); videoStatus.hidden = false;
    videoStatus.textContent = 'Video paused by your browser';
  });
}
motionButton.hidden = false;
motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; applyMotion(); });
video.addEventListener('playing', () => { document.body.classList.add('video-ready'); videoStatus.hidden = true; });
video.addEventListener('error', () => {
  document.body.classList.remove('video-ready'); videoStatus.hidden = false;
  videoStatus.textContent = 'Video unavailable. Placeholder shown.';
});
const videoUrl = document.querySelector('meta[name="hero-video-url"]').content.trim();
if (videoUrl) {
  try {
    const url = new URL(videoUrl, location.href);
    if ((url.protocol === 'https:' || url.origin === location.origin) && !url.username && !url.password) {
      video.muted = true; video.src = url.href; video.autoplay = !paused;
    }
  } catch { /* Invalid configuration keeps the placeholder. */ }
}
applyMotion();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
else document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
document.documentElement.classList.add('js');

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
      if (!document.documentElement.classList.contains('motion-paused')) drawPond();
      requestAnimationFrame(animatePond);
    }
    drawPond();
    animatePond();
  }
}
