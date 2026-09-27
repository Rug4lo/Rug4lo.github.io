// js/system/i18n.js
// One catalogue per language in data/i18n/. Only the active one is loaded, so
// the first paint costs a single request of a couple of kilobytes.
//
// The language deliberately does NOT travel in the URL: links are shared clean,
// and whoever opens one sees the site in the language their browser asks for,
// not in the language of whoever shared it.

export const DEFAULT_LANGUAGE = 'es';
export const LANGUAGES = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
];

const STORAGE_KEY = 'rug4lo.language';
const codes = LANGUAGES.map(l => l.code);

class I18n {
  constructor() {
    this.language = DEFAULT_LANGUAGE;
    this.strings = {};
    this.listeners = new Set();
  }

  // A previous choice wins; failing that the browser's, failing that the default.
  detect() {
    const saved = this.stored();
    if (saved) return saved;

    const preferred = navigator.languages || [navigator.language || ''];
    for (const tag of preferred) {
      const code = String(tag).slice(0, 2).toLowerCase();
      if (codes.includes(code)) return code;
    }
    return DEFAULT_LANGUAGE;
  }

  // localStorage can throw in a private window or with cookies blocked.
  stored() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return codes.includes(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  remember(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* no persistence: the choice is honoured for this visit only */
    }
  }

  async init() {
    await this.use(this.detect(), { remember: false });
  }

  async use(code, { remember = true } = {}) {
    if (!codes.includes(code)) code = DEFAULT_LANGUAGE;

    const strings = await this.load(code);
    if (!strings) return false;

    this.language = code;
    this.strings = strings;
    document.documentElement.lang = code;
    if (remember) this.remember(code);

    this.listeners.forEach(fn => fn(code));
    return true;
  }

  async load(code) {
    try {
      const response = await fetch(`data/i18n/${code}.json`);
      if (!response.ok) throw new Error(`data/i18n/${code}.json: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error cargando el idioma:', error);
      // If the chosen catalogue fails but one is already loaded, keep the
      // current one rather than leaving the interface with no text at all.
      return Object.keys(this.strings).length ? this.strings : null;
    }
  }

  // Dotted key: t('browser.loading'). A missing one returns the key itself,
  // which shows on screen and therefore gets fixed.
  t(key, fallback) {
    const value = key.split('.').reduce((node, part) => (node ? node[part] : undefined), this.strings);
    if (typeof value === 'string') return value;
    return fallback !== undefined ? fallback : key;
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const i18n = new I18n();
export const t = (key, fallback) => i18n.t(key, fallback);
