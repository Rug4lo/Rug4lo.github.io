// js/system/power.js
// The shutdown and restart screens, shared by the lockscreen and the top bar.
// They used to live in desktop.js, and the lockscreen had three buttons that
// did nothing at all.

import { t } from './i18n.js';

const HOLD_MS = 2500;

// The extra beat after the shutdown screen has landed, before the lockscreen
// comes back. Long enough to read as off and on again rather than as a blink.
const OFF_HOLD_MS = 900;

// Painted with createElement and textContent, not innerHTML.
function screen(label) {
  const box = document.createElement('div');
  box.className = 'shutdown-screen';
  box.setAttribute('role', 'status');

  const icon = document.createElement('div');
  icon.className = 'shutdown-icon';
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('p');
  text.className = 'shutdown-text';
  text.textContent = label;

  box.append(icon, text);
  document.body.appendChild(box);
  return box;
}

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reload with no hash: with one set, boot would read it as a deep link and
// skip the lockscreen.
function reload() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  window.location.reload();
}

// Waits for the animation to finish, with a safety net: if it never runs
// (reduced motion, a broken stylesheet) nothing should hang.
function whenFinished(box, done) {
  let fired = false;
  const once = () => { if (!fired) { fired = true; done(); } };

  if (reducedMotion()) {
    setTimeout(once, 400);
    return;
  }

  // animationend bubbles: the icon's own event has to be discarded.
  box.addEventListener('animationend', (event) => {
    if (event.target === box) once();
  });
  setTimeout(once, HOLD_MS);
}

export function restart(label = t('power.rebooting')) {
  whenFinished(screen(label), reload);
}

// A real machine would stay off, and that is what this used to do: paint the
// screen and stop. On a portfolio it is a trap -- somebody who pressed Shutdown
// out of curiosity was left on a dead page with no way back and no way to know
// that a manual reload was it. So it holds long enough to read as powering off
// and then comes back to the lockscreen, and any tap or key brings it back at
// once, so it can never feel stuck.
export function powerOff(label = t('power.shuttingDown')) {
  const box = screen(label);

  let going = false;
  const back = () => {
    if (going) return;
    going = true;
    reload();
  };

  box.addEventListener('click', back);
  window.addEventListener('keydown', back);
  whenFinished(box, () => setTimeout(back, OFF_HOLD_MS));
}

// Suspend wakes on any interaction.
export function suspend() {
  const box = screen(t('power.suspended'));

  const wake = () => reload();
  box.addEventListener('click', wake, { once: true });
  window.addEventListener('keydown', wake, { once: true });
}
