// js/system/window.js
// Reusable desktop window chrome: title bar, drag, resize, maximize, close.
// It knows nothing about the content it holds, so the terminal, the writeups
// browser and the tiling window manager that comes later can all share it.

const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;

// Under this width there is no room to float a window: it fills the work area
// instead, and dragging and resizing are turned off.
const FLOATING_BREAKPOINT = 700;

// Ids are per instance. A global id like "btn-close" breaks the moment two
// windows exist at once, which is exactly where this is heading.
let instances = 0;

export class DesktopWindow {
  // Labels come from outside so this module stays free of translation concerns.
  constructor({ title = '', actions = [], resizable = true, onClose = null, labels = {} } = {}) {
    this.serial = ++instances;
    this.title = title;
    this.actions = actions;
    this.resizable = resizable;
    this.onClose = onClose;
    this.labels = {
      maximize: labels.maximize || 'Maximize',
      restore: labels.restore || 'Restore',
      close: labels.close || 'Close',
    };

    this.root = null;
    this.body = null;
    this.maximized = false;
    this.restoreRect = null;

    this.onViewportResize = () => this.handleViewportResize();
  }

  // Where an element sits according to layout, with transforms ignored.
  // getBoundingClientRect includes them, and the taskbar slides in with one:
  // windowSlideIn drops it 20px and overshoots on the way back. A window
  // opened during that half second was measured against a bar that had not
  // landed, so the terminal came out 18px too low and 18px too short.
  static layoutTop(element) {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  }

  // The area a window may occupy: below the taskbar, and above the menu bar
  // when the phone layout is showing one.
  workArea() {
    const gap = 12;

    const taskbar = document.querySelector('.desktop-taskbar');
    const top = taskbar
      ? Math.max(0, DesktopWindow.layoutTop(taskbar) + taskbar.offsetHeight)
      : 0;

    // offsetHeight is 0 while the bar is display:none, which is how the
    // desktop is told apart from the phone without asking about widths.
    const menubar = document.querySelector('.shell-menubar');
    const bottom = menubar?.offsetHeight
      ? Math.max(0, window.innerHeight - DesktopWindow.layoutTop(menubar))
      : 0;

    // No minimum here. The floor belongs to setRect, which stops a window the
    // user is resizing from becoming useless; applying it to the space
    // available instead inflated it: on a 320px screen the work area came back
    // 320 wide starting at x=12, so the terminal hung 12px off the edge with
    // body's overflow:hidden swallowing them.
    return {
      top: top + gap,
      left: gap,
      width: Math.max(0, window.innerWidth - gap * 2),
      height: Math.max(0, window.innerHeight - top - bottom - gap * 2),
    };
  }

  get floating() {
    return window.innerWidth >= FLOATING_BREAKPOINT;
  }

  mount(parent) {
    const root = document.createElement('section');
    root.className = 'window';
    root.id = `window-${this.serial}`;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'false');
    root.setAttribute('aria-label', this.title);
    root.tabIndex = -1;

    const header = document.createElement('header');
    header.className = 'window-header';

    const title = document.createElement('span');
    title.className = 'window-title';
    title.textContent = this.title;

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    for (const action of this.actions) {
      controls.appendChild(this.button(action.glyph, action.label, action.onClick));
    }

    if (this.resizable) {
      this.maximizeButton = this.button('▢', this.labels.maximize, () => this.toggleMaximize());
      this.maximizeButton.classList.add('window-btn--maximize');
      controls.appendChild(this.maximizeButton);
    }

    controls.appendChild(this.button('✖', this.labels.close, () => this.close(), 'window-btn--close'));

    header.append(title, controls);

    const body = document.createElement('div');
    body.className = 'window-body';

    root.append(header, body);

    if (this.resizable) {
      for (const dir of ['right', 'bottom', 'corner']) {
        const handle = document.createElement('div');
        handle.className = `window-resizer window-resizer--${dir}`;
        handle.addEventListener('pointerdown', (event) => this.startResize(event, handle, dir));
        root.appendChild(handle);
      }
    }

    header.addEventListener('pointerdown', (event) => this.startDrag(event, header));
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });

    parent.appendChild(root);
    window.addEventListener('resize', this.onViewportResize);

    this.root = root;
    this.header = header;
    this.body = body;
    return body;
  }

  button(glyph, label, onClick, extraClass) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = extraClass ? `window-btn ${extraClass}` : 'window-btn';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.textContent = glyph;
    // The header drags; its buttons must not.
    button.addEventListener('pointerdown', (event) => event.stopPropagation());
    button.addEventListener('click', onClick);
    return button;
  }

  // Sizes and places the window, then unfolds it from its title bar.
  open({ width = 0.7, height = 0.7 } = {}) {
    if (!this.root) return;

    const area = this.workArea();
    const asPx = (value, total) => (value <= 1 ? Math.round(total * value) : value);

    if (this.floating) {
      this.setRect({
        width: asPx(width, area.width),
        height: asPx(height, area.height),
        // 0.5 is the geometric centre; slightly above it is the optical one.
        left: area.left + (area.width - asPx(width, area.width)) / 2,
        top: area.top + (area.height - asPx(height, area.height)) * 0.42,
      });
    } else {
      this.fillWorkArea();
    }

    this.root.classList.add('is-opening');

    // Resolves when the unfold has finished, so whatever the content wants to
    // animate can start after it instead of on top of it. Waiting on the event
    // rather than on a copy of the duration keeps the timing in one place: the
    // CSS token.
    this.opened = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.root?.classList.remove('is-opening');
        resolve();
      };

      // animationend bubbles, so the body's own animation has to be ignored.
      this.root.addEventListener('animationend', (event) => {
        if (event.target === this.root) finish();
      });

      // Safety net: if the animation never runs there would be nothing to wait
      // for and the content would never appear.
      setTimeout(finish, 2000);
    });

    this.root.focus({ preventScroll: true });
  }

  // Single place where geometry is written, so nothing can end up off-screen.
  setRect({ left, top, width, height }) {
    const area = this.workArea();

    // The minimum first, then the area: on a screen narrower than the minimum
    // the area wins, because there is nowhere else to put it.
    const w = Math.round(Math.min(Math.max(width, MIN_WIDTH), area.width));
    const h = Math.round(Math.min(Math.max(height, MIN_HEIGHT), area.height));
    const l = Math.round(Math.min(Math.max(left, area.left), area.left + area.width - w));
    const t = Math.round(Math.min(Math.max(top, area.top), area.top + area.height - h));

    Object.assign(this.root.style, {
      left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px`,
    });

    return { left: l, top: t, width: w, height: h };
  }

  rect() {
    const box = this.root.getBoundingClientRect();
    return { left: box.left, top: box.top, width: box.width, height: box.height };
  }

  fillWorkArea() {
    const area = this.workArea();
    this.setRect({ left: area.left, top: area.top, width: area.width, height: area.height });
  }

  toggleMaximize() {
    if (!this.root) return;

    if (this.maximized) {
      this.maximized = false;
      this.root.classList.remove('is-maximized');
      this.describeMaximizeButton();
      if (this.restoreRect) this.setRect(this.restoreRect);
      return;
    }

    this.restoreRect = this.rect();
    this.maximized = true;
    this.root.classList.add('is-maximized');
    this.describeMaximizeButton();
    this.fillWorkArea();
  }

  describeMaximizeButton() {
    if (!this.maximizeButton) return;

    const label = this.maximized ? this.labels.restore : this.labels.maximize;
    this.maximizeButton.title = label;
    this.maximizeButton.setAttribute('aria-label', label);
    this.maximizeButton.setAttribute('aria-pressed', String(this.maximized));
    this.maximizeButton.textContent = this.maximized ? '▣' : '▢';
  }

  // Pointer capture keeps the move and up events on the handle itself, so there
  // is nothing to register on document and nothing to leak.
  capture(event, handle, onMove) {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);

    const move = (moveEvent) => onMove(moveEvent);
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  startDrag(event, handle) {
    if (this.maximized || !this.floating) return;

    const box = this.rect();
    const grab = { x: event.clientX - box.left, y: event.clientY - box.top };

    this.capture(event, handle, (moveEvent) => {
      this.setRect({
        left: moveEvent.clientX - grab.x,
        top: moveEvent.clientY - grab.y,
        width: box.width,
        height: box.height,
      });
    });
  }

  startResize(event, handle, dir) {
    if (this.maximized || !this.floating) return;
    event.stopPropagation();

    const box = this.rect();
    const start = { x: event.clientX, y: event.clientY };

    this.capture(event, handle, (moveEvent) => {
      const widens = dir === 'right' || dir === 'corner';
      const heightens = dir === 'bottom' || dir === 'corner';

      this.setRect({
        left: box.left,
        top: box.top,
        width: widens ? box.width + (moveEvent.clientX - start.x) : box.width,
        height: heightens ? box.height + (moveEvent.clientY - start.y) : box.height,
      });
    });
  }

  // Rotating a phone or resizing the browser must not leave the window outside
  // the visible area, and body has overflow:hidden so there is no scrolling out.
  handleViewportResize() {
    if (!this.root) return;

    if (this.maximized || !this.floating) {
      this.fillWorkArea();
      return;
    }

    this.setRect(this.rect());
  }

  close() {
    if (typeof this.onClose === 'function') this.onClose();
  }

  destroy() {
    window.removeEventListener('resize', this.onViewportResize);
    this.root?.remove();
    this.root = null;
    this.body = null;
  }
}
