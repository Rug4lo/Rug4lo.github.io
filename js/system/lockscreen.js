// js/system/lockscreen.js

import { PORTFOLIO_CONFIG } from '../config.js';
import { powerIcon, restartIcon, suspendIcon } from './icons.js';
import { restart, powerOff, suspend } from './power.js';
import { i18n, t } from './i18n.js';

export class LockScreen {
  constructor() {
    this.initialized = false;
    this.timeUpdateInterval = null;
  }

  init(onFinish) {
    if (this.initialized) return;
    this.initialized = true;
    this.onFinish = onFinish;

    const mainpage = document.getElementById('mainpage');
    mainpage.innerHTML = this.render();

    this.updateTime();
    this.updateDate();
    this.timeUpdateInterval = setInterval(() => this.updateTime(), 1000);

    this.startPasswordAnimation();

    this.drawIcons();
    this.attachButtonListeners();

    this.autoTransitionTimeout = setTimeout(() => {
      this.transitionToRofi();
    }, 3000);
  }

  transitionToRofi() {
    // Clear the timers
    clearInterval(this.timeUpdateInterval);
    clearTimeout(this.autoTransitionTimeout);

    // Animate the lockscreen out
    const lockscreen = document.querySelector('.lockscreen');
    if (lockscreen) {
      lockscreen.classList.add('lockscreen-exit');
      
      setTimeout(() => {
        // Emptied, but NOT restyled. `mainpage.style.display = 'block'` used to
        // sit here, left over from a lockscreen that hid the shell; nothing
        // sets display:none on it any more. As an inline style it beat
        // `#mainpage { display: flex; flex-direction: column }`, so arriving
        // through the lockscreen left the shell as a block: .rofi-desktop's
        // `flex: 1` was ignored, the content grew past the viewport with
        // nothing to scroll, the menu bar fell below the fold, and the
        // terminal -- sized from a work area that had collapsed -- came out
        // tiny. A deep link skips the lockscreen, which is why it looked fine.
        const mainpage = document.getElementById('mainpage');
        if (mainpage) mainpage.replaceChildren();

        this.onFinish();
      }, 300);
    }
  }

  render() {
    return `
      <div class="lockscreen">
        <div class="lockscreen-bg">
          <div class="lockscreen-bg-grid"></div>
        </div>

        <div class="lockscreen-container">
          <!-- Sección de bienvenida -->
          <div class="lockscreen-welcome">
            <h1>${t('lockscreen.welcome')}</h1>
            <div class="time" id="lockscreen-time">00:00</div>
            <div class="date" id="lockscreen-date">Loading...</div>
          </div>

          <!-- Formulario -->
          <div class="lockscreen-form">
            <div class="lockscreen-input-group">
              <input 
                type="text" 
                id="lockscreen-username"
                placeholder="${t('lockscreen.username')}" 
                value="${PORTFOLIO_CONFIG.personal.name}"
                disabled
              >
            </div>
            <div class="lockscreen-input-group">
              <input 
                type="password" 
                id="lockscreen-password"
                placeholder="*******" 
                disabled
              >
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="lockscreen-actions">
            <button class="lockscreen-btn" id="btn-suspend">
              <span class="icon" aria-hidden="true">⊘</span>
              <span>${t('lockscreen.suspend')}</span>
            </button>
            <button class="lockscreen-btn" id="btn-reboot">
              <span class="icon" aria-hidden="true">↻</span>
              <span>${t('lockscreen.reboot')}</span>
            </button>
            <button class="lockscreen-btn" id="btn-shutdown">
              <span class="icon" aria-hidden="true">⏻</span>
              <span>${t('lockscreen.shutdown')}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // It painted "Loading..." and never replaced it.
  updateDate() {
    const dateEl = document.getElementById('lockscreen-date');
    if (!dateEl) return;

    dateEl.textContent = new Date().toLocaleDateString(i18n.language, {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  updateTime() {
    const timeEl = document.getElementById('lockscreen-time');
    if (timeEl) {
      const now = new Date();
      const time = now.toLocaleTimeString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      timeEl.textContent = time;
    }
  }

  startPasswordAnimation() {
    const passwordInput = document.getElementById('lockscreen-password');
    if (!passwordInput) return;

    let dots = 0;
    const totalDots = 10;
    const interval = 250;

    const animationInterval = setInterval(() => {
      dots++;
      passwordInput.value = '*'.repeat(dots);

      passwordInput.classList.add('pulse');
      setTimeout(() => passwordInput.classList.remove('pulse'), 150);

      if (dots >= totalDots) {
        clearInterval(animationInterval);
      }
    }, interval);
  }

  // The glyphs in the markup are replaced by drawn ones: U+23FB is not in the
  // font, so the shutdown button rendered as an empty box. Swapped here rather
  // than written into the template because an inline SVG inside an HTML string
  // is a lot of markup to read past, and the icons already live in one module.
  drawIcons() {
    const icons = {
      'btn-suspend': suspendIcon,
      'btn-reboot': restartIcon,
      'btn-shutdown': powerIcon,
    };

    for (const [id, draw] of Object.entries(icons)) {
      const slot = document.getElementById(id)?.querySelector('.icon');
      if (slot) slot.replaceChildren(draw());
    }
  }

  attachButtonListeners() {
    const buttons = {
      'btn-suspend': () => { this.cancelAutoLogin(); suspend(); },
      'btn-reboot': () => { this.cancelAutoLogin(); restart(); },
      'btn-shutdown': () => { this.cancelAutoLogin(); powerOff(); }
    };

    Object.keys(buttons).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', buttons[id]);
      }
    });
  }

  // Without this, the automatic login would land on the desktop on top of it.
  cancelAutoLogin() {
    clearTimeout(this.autoTransitionTimeout);
    clearInterval(this.timeUpdateInterval);
  }
}

export const lockscreen = new LockScreen();
