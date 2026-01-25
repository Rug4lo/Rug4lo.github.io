// js/browser.js
console.log('🌐 browser.js cargado');

class Browser {
  constructor(options = {}) {
    this.title = options.title || 'Browser';
    this.icon = options.icon || '🌐';
    this.url = options.url || 'localhost://page.local';
    this.content = options.content || '';
    this.onClose = options.onClose || null;
  }

  init(desktopContent) {
    desktopContent.innerHTML = this.renderBrowser();
    this.attachEvents();
  }

  renderBrowser() {
    return `
        <div class="whoami-container">
          <div class="whoami-header">
            <h1>$ whoami</h1>
            <p class="terminal-cursor">█</p>
          </div>
          
          <div class="whoami-body">
            <div class="info-section">
              <h2>👤 Identity</h2>
              <p><span class="label">Name:</span> ${PORTFOLIO_CONFIG.personal.name}</p>
              <p><span class="label">Location:</span> ${PORTFOLIO_CONFIG.personal.location || 'Spain'}</p>
              <p><span class="label">Title:</span> ${PORTFOLIO_CONFIG.personal.title || 'Cybersecurity Researcher'}</p>
            </div>
            
            <div class="info-section">
              <h2>🎯 Focus Areas</h2>
              <ul class="skills-list">
                <li>Cybersecurity & Penetration Testing</li>
                <li>Web Application Security</li>
                <li>System Administration</li>
                <li>Network Security</li>
              </ul>
            </div>
            
            <div class="info-section">
              <h2>🛠️ Tech Stack</h2>
              <div class="tech-grid">
                <span class="tech-tag">Linux</span>
                <span class="tech-tag">Python</span>
                <span class="tech-tag">JavaScript</span>
                <span class="tech-tag">Bash</span>
                <span class="tech-tag">Docker</span>
                <span class="tech-tag">Git</span>
              </div>
            </div>
          </div>
          
          <div class="whoami-footer">
            <p>$ _</p>
          </div>
        </div>
      `;
  }

  attachEvents() {
    // Cerrar
    const btnClose = document.getElementById('btn-close-browser');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Reload
    const btnReload = document.getElementById('btn-reload');
    if (btnReload) {
      btnReload.addEventListener('click', () => this.reloadContent());
    }
  }

  setContent(html) {
    const content = document.getElementById('browser-content');
    if (content) {
      content.innerHTML = html;
    }
  }

  reloadContent() {
    console.log('🔄 Recargando contenido...');
    if (this.content) {
      this.setContent(this.content);
    }
  }

  close() {
    const browserTab = document.getElementById('browser-window');
    if (browserTab) {
      browserTab.style.display = 'none';
    }

    const desktopContent = document.getElementById('desktop-content');
    desktopContent.innerHTML = '';

    if (window.rofiMenu) {
      window.rofiMenu.init();
    }

    if (this.onClose) {
      this.onClose();
    }
  }
}
