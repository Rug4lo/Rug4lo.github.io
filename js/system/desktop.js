// js/system/desktop.js
// The desktop shell: the top bar, and handing a route over to the app that
// renders it. The bar is built as DOM rather than as an HTML string, so no
// value that comes from data or from a language catalogue is ever parsed as
// markup.

import { PORTFOLIO_CONFIG } from '../config.js';
import { element } from './dom.js';
import { batteryIcon, menuIcon, powerIcon } from './icons.js';
import { router } from './router.js';
import { restart } from './power.js';
import { i18n, t, LANGUAGES } from './i18n.js';

// One workspace per app, numbered the way a tiling WM numbers them. They are
// not real workspaces yet -- there is one window at a time -- but the number
// that lights up is the one you are actually on, and clicking it goes there,
// which is what a Waybar workspace does. It replaces a row of ten hardcoded
// digits with the active one nailed to the 2.
const WORKSPACES = [
  { id: 1, app: null,         name: 'launcher' },
  { id: 2, app: 'whoami',     name: 'whoami' },
  { id: 3, app: 'machines',   name: 'machines' },
  { id: 4, app: 'blogs',      name: 'blogs' },
  { id: 5, app: 'challenges', name: 'challenges' },
];

// Decoration, and marked as such in the markup: there is no battery behind it.
// The Battery Status API was removed from every browser that matters, so the
// honest choices were a fixed number or no battery at all.
const BATTERY_LEVEL = 0.92;

export class Desktop {
  constructor() {
    this.clockTimer = null;
    this.activeApp = null;
    this.route = null;
    this.timeNode = null;
    this.menuBar = null;
    this.workspaceButtons = new Map();
    // Every listener the bar installs hangs off this, so rebuilding the bar
    // cancels all of them in one call.
    this.barListeners = null;
  }

  // Apps that hold resources outside #desktop-content — a window listening for
  // viewport resizes, for instance — get a chance to let go before the next one
  // takes over. Clearing the container is not enough for those.
  useApp(app) {
    if (this.activeApp && this.activeApp !== app && typeof this.activeApp.teardown === 'function') {
      this.activeApp.teardown();
    }
    this.activeApp = app;
  }

  init() {
    const mainpage = document.getElementById('mainpage');
    if (!mainpage) {
      console.error('#mainpage not found');
      return;
    }

    mainpage.replaceChildren(this.renderDesktop());
    this.startClock();

    i18n.onChange(() => this.onLanguageChange());
  }

  renderDesktop() {
    const shell = document.createDocumentFragment();
    shell.append(this.buildTaskbar(), this.buildWorkArea(), this.buildMenuBar());
    return shell;
  }

  // Only on a phone, where the CSS shows it. A tiling desktop has no use for
  // it, and on a touch screen there is otherwise no way out of an app: the
  // window and browser controls are 26x22 and 36x32, well under a fingertip,
  // and a visitor who arrived by a shared link has no history to go back to.
  buildMenuBar() {
    const bar = element('div', 'shell-menubar');

    const button = element('button', 'shell-menu-btn');
    button.type = 'button';
    button.append(menuIcon(), element('span', null, t('shell.menu')));
    button.addEventListener('click', () => router.go(null), {
      signal: this.barListeners.signal,
    });

    bar.appendChild(button);
    this.menuBar = bar;
    this.syncMenuBar(this.route);
    return bar;
  }

  // Pointless while the menu is what is on screen.
  syncMenuBar(route) {
    this.menuBar?.classList.toggle('is-hidden', !route?.app);
  }

  buildWorkArea() {
    const area = element('div', 'rofi-desktop');
    const content = element('div');
    content.id = 'desktop-content';
    area.appendChild(content);
    return area;
  }

  // --- top bar ---------------------------------------------------------------

  buildTaskbar() {
    // Before this, attachTaskbarEvents ran once at boot and again on every
    // language change, and the two document-level listeners it installed were
    // never removed: each switch left a pair pointing at a menu that had
    // already been replaced.
    this.barListeners?.abort();
    this.barListeners = new AbortController();

    const bar = element('div', 'desktop-taskbar');
    bar.append(this.buildIdentity(), this.buildWorkspaces(), this.buildIndicators());
    return bar;
  }

  buildIdentity() {
    const name = PORTFOLIO_CONFIG?.personal?.name || 'rug4lo';
    const left = element('div', 'taskbar-left');

    const logo = element('img');
    logo.src = 'assets/icons/logo2.png';
    logo.width = 20;
    logo.height = 20;
    // Decorative: the name it sits next to already says whose desktop this is.
    logo.alt = '';

    left.append(logo, element('span', 'taskbar-user', `${name}@arch`));
    return left;
  }

  buildWorkspaces() {
    const list = element('ul', 'taskbar-workspaces');
    list.setAttribute('aria-label', t('workspaces.label'));
    this.workspaceButtons = new Map();

    for (const workspace of WORKSPACES) {
      const button = element('button', 'workspace', String(workspace.id));
      button.type = 'button';

      // The number is what you see, the name is what a screen reader hears.
      const label = t(`workspaces.names.${workspace.name}`);
      button.setAttribute('aria-label', label);
      button.title = label;

      button.addEventListener('click', () => router.go(workspace.app), {
        signal: this.barListeners.signal,
      });

      const item = element('li');
      item.appendChild(button);
      list.appendChild(item);
      this.workspaceButtons.set(workspace.app, button);
    }

    this.setActiveWorkspace(this.route);
    return list;
  }

  setActiveWorkspace(route) {
    const active = route?.app ?? null;
    for (const [app, button] of this.workspaceButtons) {
      const on = app === active;
      button.classList.toggle('is-active', on);
      if (on) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  buildIndicators() {
    const right = element('div', 'taskbar-right');
    this.timeNode = element('span', 'taskbar-time', '00:00');

    right.append(
      this.buildLanguageMenu(),
      this.separator(),
      this.timeNode,
      this.separator(),
      this.buildBattery(),
      this.separator(),
      this.buildPowerButton()
    );
    return right;
  }

  separator() {
    const bar = element('span', 'taskbar-sep', '|');
    bar.setAttribute('aria-hidden', 'true');
    return bar;
  }

  buildBattery() {
    const battery = element('span', 'taskbar-battery');
    // Hidden from assistive technology because the number is not real: reading
    // out a made-up charge level is worse than saying nothing.
    battery.setAttribute('aria-hidden', 'true');
    battery.append(batteryIcon(BATTERY_LEVEL), element('span', null, `${Math.round(BATTERY_LEVEL * 100)}%`));
    return battery;
  }

  buildPowerButton() {
    const button = element('button', 'taskbar-btn');
    button.type = 'button';
    button.id = 'btn-power';
    button.title = t('power.restart');
    button.setAttribute('aria-label', t('power.restart'));
    button.appendChild(powerIcon());
    button.addEventListener('click', () => this.restart(), { signal: this.barListeners.signal });
    return button;
  }

  buildLanguageMenu() {
    const { signal } = this.barListeners;
    const wrapper = element('div', 'taskbar-lang');

    const button = element('button', 'taskbar-btn', i18n.language.toUpperCase());
    button.type = 'button';
    button.id = 'btn-lang';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', t('language.open'));

    const menu = element('ul', 'lang-menu');
    menu.id = 'lang-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;

    for (const language of LANGUAGES) {
      const option = element('button', 'lang-option', language.name);
      option.type = 'button';
      option.setAttribute('role', 'menuitem');
      option.dataset.lang = language.code;
      if (language.code === i18n.language) option.setAttribute('aria-current', 'true');

      const item = element('li');
      item.setAttribute('role', 'none');
      item.appendChild(option);
      menu.appendChild(item);
    }

    const close = () => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('.lang-option')?.focus();
    }, { signal });

    menu.addEventListener('click', (event) => {
      const option = event.target.closest('.lang-option');
      if (!option) return;
      close();
      i18n.use(option.dataset.lang);
    }, { signal });

    // Clicking away or pressing Escape closes it, like any other dropdown.
    document.addEventListener('click', close, { signal });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) {
        close();
        button.focus();
      }
    }, { signal });

    wrapper.append(button, menu);
    return wrapper;
  }

  // Only the bar is rebuilt. #desktop-content is left in place and the router
  // repaints whichever app was open inside it.
  onLanguageChange() {
    const bar = document.querySelector('.desktop-taskbar');
    if (!bar) return;

    // The menu bar carries a translated label, so it is rebuilt with the bar.
    // buildTaskbar aborts the shared controller, which would have taken this
    // button's listener with it.
    bar.replaceWith(this.buildTaskbar());
    this.menuBar?.replaceWith(this.buildMenuBar());
    this.updateTime();
    router.handle();
  }

  // --- clock -----------------------------------------------------------------

  startClock() {
    this.stopClock();

    const tick = () => {
      this.updateTime();
      // Lined up with the next minute instead of ticking every second: the bar
      // only shows hours and minutes, so a one-second interval repainted the
      // same string fifty-nine times out of sixty.
      const now = new Date();
      const untilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      this.clockTimer = setTimeout(tick, untilNextMinute);
    };

    tick();
  }

  stopClock() {
    clearTimeout(this.clockTimer);
    this.clockTimer = null;
  }

  updateTime() {
    if (!this.timeNode) return;
    this.timeNode.textContent = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // No label: the default is the translated one. It used to pass a hardcoded
  // 'Shutting down...', so the button whose tooltip read "Reiniciar sesion"
  // painted a screen saying something else, in English, in both languages.
  restart() {
    restart();
  }

  // --- routing ---------------------------------------------------------------

  // The single point that turns a route into a screen.
  showRoute(route) {
    this.route = route;
    this.setActiveWorkspace(route);
    this.syncMenuBar(route);

    if (!route.app) {
      this.loadApp('rofi');
    } else if (route.app === 'whoami') {
      this.loadApp('whoami');
    } else {
      this.openContentApp(route.app, route.entry);
    }
  }

  // Native lazy loading. The browser caches each module, so there is no need to
  // track what has already been injected or to bust the cache with ?t=.
  async loadApp(appType) {
    const desktopContent = document.getElementById('desktop-content');
    if (desktopContent) desktopContent.replaceChildren();

    const generation = router.generation;

    try {
      if (appType === 'rofi') {
        const { rofiMenu } = await import('../apps/rofi.js');
        if (generation !== router.generation) return;
        this.useApp(rofiMenu);
        rofiMenu.init();
      } else if (appType === 'whoami') {
        const { whoami } = await import('../apps/whoami.js');
        // Without this guard the terminal was appended on top of whatever app
        // the user had already navigated to.
        if (generation !== router.generation) return;
        this.useApp(whoami);
        whoami.init();
      }
    } catch (error) {
      console.error(`Could not load the ${appType} app:`, error);
    }
  }

  // Machines, Blogs and Challenges share a module: only the dataset changes.
  async openContentApp(name, entry = null) {
    try {
      const { contentApp } = await import('../apps/content-app.js');
      this.useApp(contentApp);
      contentApp.open(name, entry);
    } catch (error) {
      console.error('Could not load the content module:', error);
    }
  }
}

export const desktop = new Desktop();
