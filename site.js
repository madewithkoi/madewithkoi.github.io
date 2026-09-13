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
  hr: { title: 'People & HR', access: 'Employees', messages: ['How much annual leave do I have left?', 'In this example, you have 8 days of annual leave remaining.', 'Planning some time off? Submit a request through your usual HR system. I can point you to the leave policy.'], source: 'Employee handbook', rows: [['PDF', 'Employee handbook', 'Company policy', 'Employees'], ['HR', 'Leave balances', 'Existing HR platform', 'Personal'], ['DOC', 'Onboarding guide', 'Shared company documents', 'Employees']] },
  knowledge: { title: 'Knowledge Management', access: 'By team', messages: ['Where’s the latest customer onboarding SOP?', 'The example workspace has an onboarding SOP in your shared company documents.', 'Start with the intake checklist, confirm the project owner, then schedule the kickoff. Open the source document for the full procedure.'], source: 'Customer onboarding SOP', rows: [['DOC', 'Customer onboarding SOP', 'Shared company documents', 'Client team'], ['PDF', 'Service playbook', 'Company knowledge', 'By team'], ['DOC', 'Project templates', 'Existing document storage', 'By team']] },
  founder: { title: 'Owner/Founder Intelligence', access: 'Owners', messages: ['What needs my attention this morning?', 'In this example: an invoice awaiting review, a staffing gap, and a project waiting for approval.', 'Check the invoice in your accounting tool, review the team schedule, and confirm the project decision. Each item stays linked to its original source.'], source: 'Example owner briefing', rows: [['FIN', 'Invoice summary', 'Existing accounting tool', 'Owners'], ['HR', 'Team schedule', 'Existing HR platform', 'Managers'], ['DOC', 'Project updates', 'Internal business tools', 'Owners']] }
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
