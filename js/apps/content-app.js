// js/apps/content-app.js
// Machines, Blogs and Challenges are one and the same browser-style app: the
// only thing that changes between them is the dataset under data/.

import { escapeHtml } from '../escape.js';
import { PORTFOLIO_CONFIG } from '../config.js';
import { router } from '../system/router.js';
import { lastEntry } from '../system/session.js';
import { i18n, t, DEFAULT_LANGUAGE } from '../system/i18n.js';

// The body carries one extra level of indentation on purpose. Whatever the
// templates below are indented by ends up inside the generated HTML, and for
// markdown the indentation also decides how marked reads it: reformatting it
// changes what appears on screen.
export class ContentApp {
    // The only languages that show up in the writeups. The full highlight.js
    // bundle is 125 KB for some 190 of them.
    static LANGUAGES = ['bash', 'python', 'javascript', 'php', 'plaintext'];

    // Relativas y estos esquemas; cualquier otro (javascript:, data:, vbscript:)
    // se queda en texto.
    static isSafeUrl(href) {
      if (typeof href !== 'string') return false;
      if (/^(https?:|mailto:|#|\/|\.{1,2}\/)/i.test(href)) return true;
      return !/^[a-z][a-z0-9+.\-]*:/i.test(href);
    }


    constructor() {
      this.datasets = {};
      this.name = null;
    }

    get dataset() {
      return this.datasets[this.name];
    }

    get currentEntry() {
      return lastEntry[this.name] || null;
    }

    set currentEntry(id) {
      lastEntry[this.name] = id;
    }

    async open(name, entry = null) {
      const desktopContent = document.getElementById('desktop-content');
      const generation = router.generation;

      if (!this.datasets[name]) {
        const url = `data/${name}.json`;
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`${url}: ${response.status}`);
          this.datasets[name] = await response.json();
        } catch (error) {
          console.error('Error cargando el dataset:', error);
          if (generation === router.generation) this.showError(desktopContent);
          return;
        }
      }

      // The user navigated while the dataset was downloading: what was asked
      // for is no longer what they are looking at.
      if (generation !== router.generation) return;

      // Navigating inside the same section only changes the content: repainting
      // the frame would replay its opening animation and double its listeners.
      const alreadyOpen = this.name === name && document.getElementById('writeups-browser');

      this.name = name;
      this.currentEntry = entry;

      if (!alreadyOpen) {
        desktopContent.innerHTML = this.renderBrowser();
        this.attachEvents();
      }

      this.loadContent();
    }

    // Without this the user is trapped: the fake browser frame never gets
    // painted, so there is no ✕ to get back with.
    showError(container) {
      container.innerHTML = '';

      const box = document.createElement('div');
      box.className = 'loading';

      const message = document.createElement('p');
      message.textContent = t('browser.error');

      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'error-back';
      back.textContent = t('browser.errorBack');
      back.addEventListener('click', () => router.go(null));

      box.append(message, back);
      container.appendChild(box);
    }

    // The fake address bar follows whatever is actually on screen.
    addressFor() {
      const base = this.dataset.addressBar;
      return this.currentEntry ? `${base}/${this.currentEntry}.html` : `${base}.html`;
    }

    // Every thumbnail follows the same pattern, so there is no point listing them.
    imageFor(id) {
      return `/${this.dataset.contentDir}/${id}/img/logo2.png`;
    }

    renderBrowser() {
      return `
      <div class="browser-tab rofi-open" id="writeups-browser">
        <!-- BARRA PESTAÑAS (ARRIBA) -->
        <div class="browser-tabsbar">
          <div class="browser-tabs">
            <div class="browser-tab-item active">
              <img src="assets/icons/logo2.png" width="15" height="15" alt="Logo">
              <span class="tab-title">${escapeHtml(this.dataset.tabTitle)}</span>
            </div>
          </div>
          <button type="button" class="browser-close" id="btn-close" title="${t('browser.close')}" aria-label="${t('browser.close')}">✕</button>
        </div>

        <!-- BARRA DEL NAVEGADOR (DEBAJO) -->
        <div class="browser-bar">
          <div class="browser-buttons">
            <button type="button" class="browser-btn" id="btn-back-writeup" aria-label="${t('browser.back')}">&lt;</button>
            <button type="button" class="browser-btn" id="btn-forward-writeup" aria-label="${t('browser.forward')}">&gt;</button>
            <button type="button" class="browser-btn" id="btn-reload-writeup" aria-label="${t('browser.reload')}">⟳</button>
          </div>

          <div class="browser-url">
            <span>🔒</span>
            <input type="text" class="url-input" value="${escapeHtml(this.addressFor())}" readonly>
          </div>
          <div class="browser-buttons" aria-hidden="true">
            <span class="browser-btn browser-btn--static">•••</span>
          </div>
        </div>

        <!-- CONTENIDO -->
        <div class="browser-content" id="writeups-content">
          <div class="loading">${t('browser.loading')}</div>
        </div>
      </div>
      `;
    }

    loadContent() {
      const content = document.getElementById('writeups-content');

      // Navigating does not repaint the frame, so the address bar is updated separately.
      const urlInput = document.querySelector('#writeups-browser .url-input');
      if (urlInput) urlInput.value = this.addressFor();

      if (this.currentEntry) {
        this.showEntry(content);
      } else {
        this.showList(content);
      }
    }

    showList(content) {
      const sidebar = this.renderSidebar();
      const listHtml = this.renderList();

      content.innerHTML = `
        <div class="writeups-container">
          ${sidebar}
          <div class="writeups-main">
            ${listHtml}
          </div>
        </div>
      `;

      this.attachEntryLinks();
    }

    async showEntry(content) {
      const entry = this.dataset.items.find(item => item.id === this.currentEntry);
      if (!entry) {
        // The URL points at something that does not exist. It is corrected to
        // the list with no history entry, so Back does not return to the dead link.
        router.go(this.name, null, { replace: true });
        return;
      }

      const sidebar = this.renderSidebar();

      content.innerHTML = `
        <div class="writeups-container">
          ${sidebar}
          <div class="writeups-main">
            <div class="loading">${t('browser.loadingEntry')}</div>
          </div>
        </div>
      `;

      const generation = router.generation;
      const { markdown, translated } = await this.loadMarkdown(entry.id);

      // Without this, going back to the list before it loaded made the writeup
      // appear on top of it, with the URL saying something else.
      if (generation !== router.generation) return;

      content.innerHTML = `
        <div class="writeups-container">
          ${sidebar}
          <div class="writeups-main">
            ${this.renderEntry(entry, markdown, translated)}
          </div>
        </div>
      `;

      this.renderMarkdown(content);
    }

    // A translated writeup is <id>.en.md next to the original. When there is
    // none, the original is served with a notice rather than an empty panel.
    async loadMarkdown(id) {
      const dir = `${this.dataset.contentDir}/${id}`;
      const paths = i18n.language === DEFAULT_LANGUAGE
        ? [`${dir}/${id}.md`]
        : [`${dir}/${id}.${i18n.language}.md`, `${dir}/${id}.md`];

      for (const [index, path] of paths.entries()) {
        try {
          const response = await fetch(path);
          if (!response.ok) continue;
          return { markdown: await response.text(), translated: index === 0 };
        } catch {
          /* try the next candidate */
        }
      }

      console.error(`No se pudo cargar el markdown de ${id}`);
      return { markdown: `# Error\n\n${t('browser.error')}`, translated: true };
    }

    // marked and highlight.js live in js/vendor/ and are imported the first
    // time a writeup is painted: the launcher and the lists do not need them.
    // Self-hosted on purpose: with a CDN on the CSP allow list, script-src
    // stops being worth much.
    async loadRenderer() {
      if (this.renderer) return this.renderer;

      const [{ Marked }, core, ...languages] = await Promise.all([
        import('../vendor/marked.esm.js'),
        import('../vendor/hljs-core.min.js'),
        ...ContentApp.LANGUAGES.map(name => import(`../vendor/hljs-${name}.min.js`)),
      ]);

      this.hljs = core.default;
      ContentApp.LANGUAGES.forEach((name, i) => {
        this.hljs.registerLanguage(name, languages[i].default);
      });

      this.renderer = new Marked({ renderer: this.markdownRenderer() });
      return this.renderer;
    }

    // Its own instance, so no global state is touched.
    markdownRenderer() {
      return {
        // Raw HTML is escaped instead of injected: these writeups document
        // payloads, and a <script> inside one of them would run.
        html: (token) => escapeHtml(typeof token === 'string' ? token : token.text),

        // marked no longer filters schemes: without this, a [x](javascript:...)
        // copied from someone else's PoC would come out as a live link.
        link: (href, title, text) => {
          if (!ContentApp.isSafeUrl(href)) return text;
          const attr = title ? ` title="${escapeHtml(title)}"` : '';
          return `<a href="${escapeHtml(href)}"${attr}>${text}</a>`;
        },

        // loading="lazy" is worth more here than anywhere else: the heaviest
        // writeup is 5 MB of screenshots that all used to download at once.
        image: (href, title, text) => {
          if (!ContentApp.isSafeUrl(href)) return escapeHtml(text || '');
          const attr = title ? ` title="${escapeHtml(title)}"` : '';
          return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text || '')}"${attr}`
               + ` loading="lazy" decoding="async">`;
        },
      };
    }

    async renderMarkdown(container) {
      const markdownElements = container.querySelectorAll('.writeup-content-md');

      let parser;
      try {
        parser = await this.loadRenderer();
      } catch (error) {
        // With no renderer the writeup stays as readable plain text, which beats
        // an empty panel.
        console.error('No se pudo cargar el renderizador de markdown:', error);
        return;
      }

      markdownElements.forEach(el => {
        // trim(): the element inherits the template's indentation, and four
        // leading spaces would turn the first line into a code block.
        el.innerHTML = parser.parse(el.textContent.trim());
      });

      container.querySelectorAll('pre code').forEach((block) => {
        this.hljs.highlightElement(block);
      });
    }

    renderSidebar() {
      return `
        <aside class="writeups-sidebar">
          <div class="profile-card">
            <div class="profile-avatar">
              <img src="assets/icons/logo2.png" alt="Rug4lo" loading="lazy">
            </div>
            <div class="profile-info">
              <h2>${escapeHtml(PORTFOLIO_CONFIG.personal.name)}</h2>
              <p class="profile-role">${escapeHtml(t('profile.role'))}</p>
            </div>
          </div>

          <div class="sidebar-contact">
            <h3>${t('sidebar.connect')}</h3>
            <div class="social-links">
              <a href="${PORTFOLIO_CONFIG.contact.github}" target="_blank" rel="noopener noreferrer" title="${t('sidebar.github')}">
                <img src="assets/icons/github.svg" class="contact-icon" alt="GitHub" width="30" height="30">
              </a>
              <a href="${PORTFOLIO_CONFIG.contact.linkedin}" target="_blank" rel="noopener noreferrer" title="${t('sidebar.linkedin')}">
                <img src="assets/icons/linkedin.svg" class="contact-icon" alt="LinkedIn" width="30" height="30">
              </a>
              <a href="mailto:${PORTFOLIO_CONFIG.contact.email}" title="${t('sidebar.email')}">
                <img src="assets/icons/mail.svg" class="contact-icon" alt="Email" width="30" height="30">
              </a>
            </div>
          </div>
        </aside>
      `;
    }

    renderList() {
        const diffRank = { Insane: 4, Hard: 3, Medium: 2, Easy: 1 };

        const sorted = [...this.dataset.items].sort((a, b) => {
          const ra = diffRank[a.difficulty] ?? 0;
          const rb = diffRank[b.difficulty] ?? 0;

          if (rb !== ra) return rb - ra;         
          return a.title.localeCompare(b.title);    
        });

        const writeups = sorted.map(wu => {
          const vulnsHtml = (wu.tags && wu.tags.length)
            ? wu.tags.map(v => `<span class="vuln-tag">${escapeHtml(v)}</span>`).join(' ')
            : `<span class="vuln-tag vuln-tag-empty">${t('browser.noTags')}</span>`;

        return `
          <article class="writeup-card" data-id="${escapeHtml(wu.id)}" data-category="${escapeHtml(wu.category)}" data-difficulty="${escapeHtml(wu.difficulty || '')}">
            <div class="card-body">
              <div class="card-left">
                <h3 class="card-title">
                  <a href="#" class="writeup-link writeup-title-link" data-id="${escapeHtml(wu.id)}">
                    ${escapeHtml(wu.title)}
                  </a>
                </h3>

                <div class="card-meta">
                  <span class="card-category">${escapeHtml(wu.category)}</span>
                </div>

                <div class="card-vulns">
                  ${vulnsHtml}
                </div>

              </div>

              <div class="card-right">
                <img class="writeup-thumb"
                    src="${this.imageFor(wu.id)}"
                    alt="Preview ${escapeHtml(wu.title)}"
                    loading="lazy"
                    width="180"
                    height="120">
              </div>
            </div>
          </article>
        `;

      }).join('');

      // A TODO(...) placeholder is a note to whoever is writing the site, not
      // copy for whoever is reading it. Two sections still carry one, and
      // published as-is a visitor would read "TODO(contenido): subtitulo de
      // Blogs". The line is left out until there is something to say; the
      // placeholder stays in the catalogue, and the checks keep asking for it.
      const subtitle = t(`sections.${this.name}.subtitle`);
      const written = /^TODO\(/.test(subtitle) ? '' : subtitle;

      return `
        <div class="writeups-list">
          <h1>${escapeHtml(this.dataset.heading)}</h1>
          <p class="subtitle">${escapeHtml(written)}</p>
          <div class="writeups-grid">
            ${writeups}
          </div>
        </div>
      `;
    }


    renderEntry(entry, markdownContent, translated = true) {
      // When it is translated it must not leave a single extra line in the HTML.
      const notice = translated ? '' :
        `          <p class="writeup-notice">${escapeHtml(t('browser.onlyInSpanish'))}</p>\n\n`;

      return `
        <article class="writeup-detail">          
          <header class="writeup-header">
            <h1 class="writeup-title">${escapeHtml(entry.title)}</h1>
            <div class="writeup-meta">
              <span class="badge badge-category">${escapeHtml(entry.category)}</span>
              <span class="badge difficulty-${(entry.difficulty || '').toLowerCase()}"></span>
            </div>
          </header>

${notice}          <div class="writeup-content-md">
            ${escapeHtml(markdownContent)}
          </div>
        </article>
      `;
    }

    attachEvents() {
      const btnClose = document.getElementById('btn-close');
      if (btnClose) {
        btnClose.addEventListener('click', () => router.go(null));
      }

      const btnBack = document.getElementById('btn-back-writeup');
      if (btnBack) {
        btnBack.addEventListener('click', (e) => {
          e.preventDefault();
          router.back();
        });
      }

      const btnForward = document.getElementById('btn-forward-writeup');
      if (btnForward) {
        btnForward.addEventListener('click', (e) => {
          e.preventDefault();
          router.forward();
        });
      }

      const btnReload = document.getElementById('btn-reload-writeup');
      if (btnReload) {
        btnReload.addEventListener('click', () => {
          if (this.currentEntry) router.go(this.name);
          else this.loadContent();
        });
      }
    }

    // Hooked up when the list is painted. Hooking them in attachEvents as well
    // doubled the listener and made every click render the detail twice.
    attachEntryLinks() {
      const links = document.querySelectorAll('.writeup-link');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          router.go(this.name, link.dataset.id);
        });
      });
    }
}

export const contentApp = new ContentApp();
