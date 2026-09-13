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

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const next = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next]);
    tabs[next].focus();
  });
}
selectTab(tabs[0]);

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
document.documentElement.classList.add('js');
