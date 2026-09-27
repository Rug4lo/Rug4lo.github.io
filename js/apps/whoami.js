// js/apps/whoami.js
// The terminal app. It owns the content only: the window chrome (drag, resize,
// maximize, close) lives in js/system/window.js.
//
// The typing effect is pure CSS. Every character is already in the DOM from the
// first frame and is only revealed by animating the width in `ch` steps, which
// means: assistive technology reads the finished text instead of letter by
// letter, the text can be selected and copied, and there is no timer to cancel
// when the window closes or the language changes.

import { element } from '../system/dom.js';
import { router } from '../system/router.js';
import { i18n, t } from '../system/i18n.js';
import { DesktopWindow } from '../system/window.js';

// Per character. Single source of truth: it is handed to CSS as a custom
// property, so there is no second value to keep in step.
const CHAR_MS = 45;
const PAUSE_AFTER_COMMAND = 140;
const PAUSE_AFTER_OUTPUT = 260;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Whoami {
  constructor() {
    // One content file per language, cached per language.
    this.contents = {};
    this.window = null;
    this.output = null;
  }

  init() {
    // Reopening must not leave the previous window's listeners behind.
    this.teardown();

    const parent = document.getElementById('desktop-content') || document.body;

    this.window = new DesktopWindow({
      title: 'whoami@system',
      labels: {
        maximize: t('terminal.maximize'),
        restore: t('terminal.restore'),
        close: t('terminal.close'),
      },
      actions: [
        { glyph: '⟳', label: t('terminal.reload'), onClick: () => this.load() },
      ],
      onClose: () => router.go(null),
    });

    const body = this.window.mount(parent);
    body.classList.add('terminal');

    this.output = element('div', 'terminal-output');
    this.output.setAttribute('role', 'log');
    body.appendChild(this.output);

    this.window.open({ width: 0.62, height: 0.58 });
    this.load();
  }

  teardown() {
    this.window?.destroy();
    this.window = null;
    this.output = null;
  }

  async load() {
    if (!this.output) return;

    const language = i18n.language;

    if (!this.contents[language]) {
      const url = `data/whoami.${language}.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url}: ${response.status}`);
        this.contents[language] = await response.json();
      } catch (error) {
        console.error('Could not load the whoami content:', error);
        this.output?.replaceChildren(element('p', 'output-line', t('browser.error')));
        return;
      }
    }

    // Typing on top of the window still unfolding read as one confused motion,
    // so it waits for the window to finish. On a reload this is already resolved.
    await this.window?.opened;

    // The window may have closed, or the language changed, while waiting.
    if (!this.output || language !== i18n.language) return;

    this.render(this.contents[language]);
  }

  render(content) {
    const typing = !prefersReducedMotion();
    const fragment = document.createDocumentFragment();
    let delay = 0;

    for (const block of content.blocks ?? []) {
      const command = String(block.command ?? '');

      const line = element('p', 'terminal-line');
      if (typing) line.style.setProperty('--type-delay', `${delay}ms`);
      line.append(
        this.promptNode(content),
        document.createTextNode(' '),
        this.commandNode(command, typing ? delay : null)
      );
      fragment.appendChild(line);

      if (typing) delay += command.length * CHAR_MS + PAUSE_AFTER_COMMAND;

      const output = this.outputNode(block, typing ? delay : null);
      if (output) fragment.appendChild(output);

      if (typing) delay += PAUSE_AFTER_OUTPUT;
    }

    fragment.appendChild(this.cursorNode(content, typing ? delay : null));

    this.output.classList.toggle('is-typing', typing);
    this.output.replaceChildren(fragment);
  }

  // Split into parts so each one can carry its own colour, the way a real
  // shell prompt does.
  promptNode({ user, host }) {
    const node = element('span', 'prompt');
    node.append(
      element('span', 'prompt-bracket', '['),
      element('span', 'prompt-user', user ?? ''),
      element('span', 'prompt-at', '@'),
      element('span', 'prompt-host', host ?? ''),
      element('span', 'prompt-bracket', ']')
    );
    return node;
  }

  commandNode(command, delay) {
    const node = element('span', 'command', command);
    if (delay === null) return node;

    // steps() needs the character count, so it travels as a custom property.
    node.style.setProperty('--chars', String(Math.max(1, command.length)));
    node.style.setProperty('--type-duration', `${command.length * CHAR_MS}ms`);
    node.style.setProperty('--type-delay', `${delay}ms`);
    return node;
  }

  // A list is marked up as a list: a screen reader then announces how many
  // items it has instead of reading a run of loose lines.
  outputNode(block, delay) {
    const lines = block.output ?? [];
    if (!lines.length) return null;

    const container = block.list
      ? element('ul', 'output-list')
      : element('div', 'output-group');

    for (const line of lines) {
      container.appendChild(element(block.list ? 'li' : 'p', 'output-line', line));
    }

    if (delay !== null) container.style.setProperty('--type-delay', `${delay}ms`);
    return container;
  }

  cursorNode(content, delay) {
    const line = element('p', 'terminal-line terminal-line--cursor');
    line.append(
      this.promptNode(content),
      document.createTextNode(' '),
      element('span', 'terminal-cursor')
    );
    line.setAttribute('aria-hidden', 'true');
    if (delay !== null) line.style.setProperty('--type-delay', `${delay}ms`);
    return line;
  }
}

export const whoami = new Whoami();
