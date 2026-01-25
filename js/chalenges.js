// js/Challenges.js

if (typeof window.chalenges === 'undefined') {
  window.chalenges = class {

    // Lista de Challenges disponibles
    writeupsList = [
      { id: 'Raxer', title: 'Crackmes.one - Raxer', category: 'Windows x86 (32-bit) - Reversing', difficulty: 'Reversing', vulns: ['Windows', 'Static reverse engineering'], image:'/Writeups/Chalenges/Raxer/img/logo2.png' },
      { id: 'IOLI', title: 'IOLI Levels 1/9', category: 'Windows x64 (64-bit) - Reversing', difficulty: 'Reversing', vulns: ['Windows', 'Static reverse engineering', 'Automatic keygen'], image:'/Writeups/Chalenges/IOLI/img/logo2.png' },
    ];

    currentWriteup = null;

    init() {
      console.log('Inicializando Challenges...');
      
      const desktopContent = document.getElementById('desktop-content');
      desktopContent.innerHTML = this.renderBrowser();

      this.loadContent();
      this.attachEvents();
    }

    renderBrowser() {
      return `
      <div class="browser-tab rofi-open" id="writeups-browser">
        <!-- BARRA PESTAÑAS (ARRIBA) -->
        <div class="browser-tabsbar">
          <div class="browser-tabs">
            <div class="browser-tab-item active">
              <img src="assets/icons/logo2.png" width="15" height="15" alt="Logo">
              <span class="tab-title">Challenges</span>
            </div>
          </div>
          <button class="browser-close" id="btn-close" title="Close">✕</button>
        </div>

        <!-- BARRA DEL NAVEGADOR (DEBAJO) -->
        <div class="browser-bar">
          <div class="browser-buttons">
            <button class="browser-btn" id="btn-back-writeup"><</button>
            <button class="browser-btn" id="btn-forward-writeup">></button>
            <button class="browser-btn" id="btn-reload-writeup">⟳</button>
          </div>

          <div class="browser-url">
            <span>🔒</span>
            <input type="text" class="url-input" value="rug4lo://127.0.0.1:3000/Challenges.html" readonly>
          </div>
          <div class="browser-buttons">
            <button class="browser-btn" id="btn-menu">•••</button>
          </div>
        </div>

        <!-- CONTENIDO -->
        <div class="browser-content" id="writeups-content">
          <div class="loading">Loading...</div>
        </div>
      </div>
      `;
    }

    loadContent() {
      const content = document.getElementById('writeups-content');
      
      if (this.currentWriteup) {
        // Cargar Challenges individual desde archivo markdown
        this.loadWriteupDetail(content);
      } else {
        // Cargar lista de Challenges
        this.loadWriteupsList(content);
      }
    }

    loadWriteupsList(content) {
      const sidebar = this.renderSidebar();
      const listHtml = this.renderWriteupsList();

      content.innerHTML = `
        <div class="writeups-container">
          ${sidebar}
          <div class="writeups-main">
            ${listHtml}
          </div>
        </div>
      `;

      this.attachWriteupLinks();
    }

    loadWriteupDetail(content) {
      const writeup = this.writeupsList.find(w => w.id === this.currentWriteup);
      if (!writeup) {
        this.currentWriteup = null;
        this.loadContent();
        return;
      }

      const sidebar = this.renderSidebar();
      
      // Mostrar loading mientras se carga el markdown
      content.innerHTML = `
        <div class="writeups-container">
          ${sidebar}
          <div class="writeups-main">
            <div class="loading">Cargando writeup...</div>
          </div>
        </div>
      `;

      // Cargar el archivo markdown
      this.fetchMarkdown(writeup.id, (markdownContent) => {
        const detailHtml = this.renderWriteupDetail(writeup, markdownContent);
        
        content.innerHTML = `
          <div class="writeups-container">
            ${sidebar}
            <div class="writeups-main">
              ${detailHtml}
            </div>
          </div>
        `;

        this.attachBackButton();
        
        this.renderMarkdown(content);
      });
    }

    fetchMarkdown(id, callback) {
      const mdPath = `Writeups/Chalenges/${id}/${id}.md`;
      
      fetch(mdPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`No se encontró: ${mdPath}`);
          }
          return response.text();
        })
        .then(markdownContent => {
          callback(markdownContent);
        })
        .catch(error => {
          console.error('Error cargando markdown:', error);
          callback(`# Error\n\nNo se pudo cargar el writeup. Verifica que el archivo existe en: \`${mdPath}\``);
        });
    }

    renderMarkdown(container) {
      const markdownElements = container.querySelectorAll('.writeup-content-md');

      markdownElements.forEach(el => {
        el.innerHTML = marked.parse(el.textContent);
      });

      // Resaltar todos los bloques de código ya renderizados
      if (window.hljs) {
        container.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightElement(block);
        });
      }
    }

    renderSidebar() {
      return `
        <aside class="writeups-sidebar">
          <div class="profile-card">
            <div class="profile-avatar">
              <img src="assets/icons/logo2.png" alt="Rug4lo" loading="lazy">
            </div>
            <div class="profile-info">
              <h2>Rug4lo</h2>
              <p class="profile-role">Pentester • Low level programmer • Exploit developer</p>
            </div>
          </div>

          <div class="sidebar-contact">
            <h3>Conectar</h3>
            <div class="social-links">
              <a href="https://github.com/rug4lo" target="_blank" title="GitHub">
                <img src="assets/icons/github2.svg" class="rofi-icon" alt="GitHub" style="width:30px; height:30px;">
              </a>
              <a href="https://linkedin.com/in/rug4lo" target="_blank" title="LinkedIn">
                <img src="assets/icons/linkedin2.svg" class="rofi-icon" alt="LinkedIn" style="width:30px; height:30px;">
              </a>
              <a href="mailto:rubengarciavalladolid@gmail.com" title="Email">
                <img src="assets/icons/mail2.svg" class="rofi-icon" alt="Email" style="width:30px; height:30px;">
              </a>
            </div>
          </div>
        </aside>
      `;
    }

    renderWriteupsList() {
        const diffRank = { Exploiting: 3, Pwn: 2, Reversing: 1 };

        const sorted = [...this.writeupsList].sort((a, b) => {
          const ra = diffRank[a.difficulty] ?? 0;
          const rb = diffRank[b.difficulty] ?? 0;

          if (rb !== ra) return rb - ra;        
          return a.title.localeCompare(b.title);    
        });

        const writeups = sorted.map(wu => {
          const vulnsHtml = (wu.vulns && wu.vulns.length)
            ? wu.vulns.map(v => `<span class="vuln-tag">${v}</span>`).join(' ')
            : `<span class="vuln-tag vuln-tag-empty">No tags</span>`;

        return `
          <article class="writeup-card" data-id="${wu.id}" data-category="${wu.category}" data-difficulty="${wu.difficulty}">
            <div class="card-body">
              <div class="card-left">
                <h3 class="card-title">
                  <a href="#" class="writeup-link writeup-title-link" data-id="${wu.id}">
                    ${wu.title}
                  </a>
                </h3>

                <div class="card-meta">
                  <span class="card-category">${wu.category}</span>
                </div>

                <div class="card-vulns">
                  ${vulnsHtml}
                </div>

              </div>

              <div class="card-right">
                <img class="writeup-thumb"
                    src="${wu.image}"
                    alt="Preview ${wu.title}"
                    loading="lazy"
                    width="180"
                    height="120">
              </div>
            </div>
          </article>
        `;

      }).join('');

      return `
        <div class="writeups-list">
          <h1>Challenges</h1>
          <p class="subtitle">Documentación detallada de máquinas completadas</p>
          <div class="writeups-grid">
            ${writeups}
          </div>
        </div>
      `;
    }


    renderWriteupDetail(writeup, markdownContent) {
      return `
        <article class="writeup-detail">          
          <header class="writeup-header">
            <h1 class="writeup-title">${writeup.title}</h1>
            <div class="writeup-meta">
              <span class="badge badge-category">${writeup.category}</span>
              <span class="badge difficulty-${writeup.difficulty.toLowerCase()}"></span>
            </div>
          </header>

          <div class="writeup-content-md">
            ${this.escapeHtml(markdownContent)}
          </div>
        </article>
      `;
    }

    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }

    attachEvents() {
      const btnClose = document.getElementById('btn-close');
      if (btnClose) {
        btnClose.addEventListener('click', () => {
          const browserTab = document.getElementById('writeups-browser');
          if (browserTab) {
            browserTab.style.display = 'none';
          }

          const desktopContent = document.getElementById('desktop-content');
          desktopContent.innerHTML = '';

          const scripts = document.querySelectorAll('script[src*="writeups.js"]');
          scripts.forEach(script => script.remove());

          if (window.rofiMenu) {
            window.rofiMenu.init();
          }
        });
      }

      const btnReload = document.getElementById('btn-reload-writeup');
      if (btnReload) {
        btnReload.addEventListener('click', () => {
          this.currentWriteup = null;
          this.loadContent();
        });
      }

      this.attachWriteupLinks();
    }

    attachWriteupLinks() {
      const links = document.querySelectorAll('.writeup-link');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.currentWriteup = link.dataset.id;
          this.loadContent();
        });
      });
    }

    attachBackButton() {
      const backBtn = document.getElementById('btn-back-writeup');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.currentWriteup = null;
          this.loadContent();
        });
      }
    }
  };

  // Inicializar Challenges
  window.chalenges = new window.chalenges();
  window.chalenges.init();
}
