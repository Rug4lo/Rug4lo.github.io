// js/apps/rofi.js

import { PORTFOLIO_CONFIG } from '../config.js';
import { router } from '../system/router.js';
import { lastEntry } from '../system/session.js';
import { t } from '../system/i18n.js';

// The body keeps one extra level of indentation on purpose: whatever the
// templates are indented by ends up inside the generated HTML.
export class RofiMenu {
    // External links are painted as <a> and apps as <button>, so the keyboard,
    // middle click and "open in a new tab" all work out of the box, and there
    // is no need for window.open, which a blocker can stop.
    // Sections first, then the outside links. The order used to alternate the
    // two so that a two-column, row-major grid put apps on the left and links
    // on the right -- which fell apart the moment the phone showed one column
    // and the list read whoami, LinkedIn, Machines, GitHub. The data is in its
    // logical order now and the desktop gets the same two columns from
    // `grid-auto-flow: column`, which fills downwards instead of across.
    static ITEMS = [
      { app: 'whoami',     icon: 'info.svg',     label: 'Whoami.elf',         size: 32 },
      { app: 'machines',   icon: 'writeup.svg',  label: 'Machines.elf' },
      { app: 'challenges', icon: 'cert.svg',     label: 'Challenges.elf' },
      { app: 'blogs',      icon: 'blog.svg',     label: 'Blogs.elf' },
      { link: 'linkedin',  icon: 'linkedin.svg', label: 'LinkedIn.desktop' },
      { link: 'github',    icon: 'github.svg',   label: 'GitHub.desktop' },
      { link: 'htb',       icon: 'htb.svg',      label: 'HackTheBox.desktop' },
      { link: 'email',     icon: 'mail.svg',     label: 'Email.desktop' },
    ];

    constructor() {
    }

    init() {      
      const desktopContent = document.getElementById('desktop-content');
      desktopContent.innerHTML = this.renderRofi();

      this.renderMenu();
      this.attachEvents();
    }

    renderRofi() {
      return `
        <div class="rofi-wrapper">
          <!-- HEADER BÚSQUEDA -->
          <div class="rofi-header">
            <div class="rofi-top">
              <input type="text" class="rofi-search" placeholder="🔍︎ ${t('rofi.search')}" id="rofi-search">
              <div class="rofi-filters" aria-hidden="true">
                <span class="filter-btn active">🗀 files</span>
                <span class="filter-btn">🗁 folders</span>
                <span class="filter-btn">>_ term</span>
                <span class="filter-btn">🗖 window</span>
              </div>
            </div>
            <div class="rofi-text">
              <span class="main">${t('rofi.title')}</span>
            </div>
          </div>

          <!-- CONTENIDO -->
          <div class="rofi-content">
            <div class="rofi-grid" id="rofi-grid"></div>
            <div class="rofi-sidebar" id="rofi-sidebar"></div>
          </div>
        </div>
      `;
    }

    renderMenu() {
      const grid = document.getElementById('rofi-grid');

      grid.innerHTML = RofiMenu.ITEMS.map(item => {
        const size = item.size || 30;
        // Empty alt on purpose: the label next to it already gives the name,
        // and otherwise a screen reader reads it twice.
        const icon = `<img src="assets/icons/${item.icon}" class="rofi-icon" alt=""`
                   + ` width="${size}" height="${size}">`;
        const label = `<span class="rofi-label">${item.label}</span>`;

        if (item.link) {
          const href = item.link === 'email'
            ? `mailto:${PORTFOLIO_CONFIG.contact.email}`
            : PORTFOLIO_CONFIG.contact[item.link];
          return `<a class="rofi-item rofi-item--link" href="${href}" target="_blank" rel="noopener noreferrer">`
               + `${icon}${label}</a>`;
        }

        return `<button type="button" class="rofi-item rofi-item--app" data-app="${item.app}">${icon}${label}</button>`;
      }).join('');
    }


    attachEvents() {
      const grid = document.getElementById('rofi-grid');
      grid.addEventListener('click', (e) => {
        const item = e.target.closest('.rofi-item[data-app]');
        if (!item) return;

        const wrapper = document.querySelector('.rofi-wrapper');
        if (wrapper) wrapper.style.display = 'none';

        // No delay: the 300ms that used to be here animated nothing and let an
        // impatient second click queue up one navigation too many.
        router.go(item.dataset.app, lastEntry[item.dataset.app] || null);
      });

      const search = document.getElementById('rofi-search');
      if (search) {
        search.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          document.querySelectorAll('.rofi-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
          });
        });
      }
    }

}

export const rofiMenu = new RofiMenu();
