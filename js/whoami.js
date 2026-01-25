// js/whoami.js

if (typeof window.Whoami === 'undefined') {
  window.Whoami = class {
    constructor() {
      this.prompt = '[rug4lo@system]$ ';
      this.terminal = null;
      this.output = null;
      this.isDragging = false;
      this.dragStart = {};
      this.resizeStart = {};
    }


    init() {
      console.log('Inicializando Whoami Terminal ReadOnly...');
     
      this.createWhoamiContainer();
      this.createTerminal();
      this.terminal.classList.add('is-opening');
      this.terminal.addEventListener('animationend', () => {
        this.terminal.classList.remove('is-opening');
      }, { once: true });
      this.positionTerminal();
      this.attachEvents();
      setTimeout(() => this.loadFullContent(), 100);
    }


    createWhoamiContainer() {
      let container = document.getElementById('whoami-content');
      if (!container) {
        const desktop = document.getElementById('desktop-content') || document.body;
        container = document.createElement('div');
        container.id = 'whoami-content';
        container.style.position = 'relative';
        container.style.zIndex = '9999';
        desktop.appendChild(container);
        console.log('Creado #whoami-content dinámicamente');
      }
      return container;
    }


    createTerminal() {
      const content = document.getElementById('whoami-content');
      if (!content) {
        console.error('#whoami-content no encontrado');
        return;
      }


      content.innerHTML = `
        <div id="terminal-window" class="terminal-window readonly-terminal">
          <div class="terminal-header">
            <span>whoami@system</span>
            <div class="window-controls">
              <button id="btn-minimize" title="Minimizar">━</button>
              <button id="btn-reload" title="Recargar">⟳</button>
              <button id="btn-close" title="Cerrar">✖</button>
            </div>
          </div>
          <div id="terminal-output" class="terminal-output readonly-output"></div>
          <div class="terminal-resizers">
            <div class="resizer resizer-right"></div>
            <div class="resizer resizer-bottom"></div>
            <div class="resizer resizer-corner"></div>
          </div>
        </div>
      `;
     
      this.terminal = document.getElementById('terminal-window');
      this.output = document.getElementById('terminal-output');
      console.log('Terminal creada - ReadOnly');
    }


    positionTerminal() {
      if (!this.terminal) return;
     
      Object.assign(this.terminal.style, {
        top: '10%',
        left: '15%',
        right: 'auto',
        bottom: 'auto',
        width: '70%',
        height: 'auto',
        display: 'block'
      });
    }


    loadFullContent() {
      if (!this.output) {
        console.error('output no encontrado');
        return;
      }
     
      console.log('Cargando contenido...');
     
      this.output.innerHTML = `
    <div class="terminal-line">
      <a class="prompt">[rug4lo@system]</a>
      <a class="command">whoami</a>
    </div>

    <p class="output-line">
      Pentester • Low level programmer • Exloit developer
    </p>

    <p class="terminal-line">
      <span class="prompt">[rug4lo@system]</span>
      <span class="command">cat ~/profile.md</span>
    </p>

    <p class="output-line">
      My name is Ruben. I like computers since I was a child.
      When I discovered the field of cybersecurity I fell in love with it.
      Now I am trying to learn day by day, improve my skills and help the community with different tools and machine writeups.
    </p>


    <p class="terminal-line">
      <span class="prompt">[rug4lo@system]</span>
      <span class="command">cat ~/all.txt | grep certs</span>
    </p>


    <p class="output-line">
      - Ejptv2<br>
      - DFE, NDE, EHE<br>
      - B2
    </p>


    <p class="terminal-line">
      <span class="prompt">[rug4lo@system]</span>
      <span class="command">ls languajes</span>
    </p>


    <p class="output-line">
      [+] Python <br>
      [+] C/C++<br>
      [+] Assembly<br>
      [+] Bash / Powerhsell<br>
    </p>

      `;
     
      console.log('Contenido cargado');
      this.scrollToBottom();
    }

    attachEvents() {
      if (!this.terminal) return;


      // DRAG
      const header = this.terminal.querySelector('.terminal-header');
      if (header) {
        header.addEventListener('mousedown', (e) => this.startDrag(e));
      }


      // CONTROLES
      const closeBtn = document.getElementById('btn-close');
      const reloadBtn = document.getElementById('btn-reload');


      if (closeBtn) closeBtn.onclick = () => this.close();
      if (reloadBtn) reloadBtn.onclick = () => this.loadFullContent();


      // RESIZE
      this.terminal.querySelectorAll('.resizer').forEach((resizer) => {
        resizer.addEventListener('mousedown', (e) => this.startResize(e, resizer));
      });


      // BLOQUEO TOTAL INPUT
      this.output.contentEditable = false;
     
      // Prevenir todos los eventos de input
      ['keydown', 'keypress', 'keyup', 'input', 'paste', 'drop'].forEach(event => {
        this.output.addEventListener(event, (e) => e.preventDefault());
      });


      // No context menu
      this.terminal.addEventListener('contextmenu', e => e.preventDefault());
    }

    startDrag(e) {
      e.preventDefault();
      this.isDragging = true;
      const rect = this.terminal.getBoundingClientRect();
      this.dragStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      document.addEventListener('mousemove', this.drag.bind(this));
      document.addEventListener('mouseup', this.stopDrag.bind(this));
    }


    drag(e) {
      if (!this.isDragging || !this.terminal) return;
      this.terminal.style.left = Math.max(0, e.clientX - this.dragStart.x) + 'px';
      this.terminal.style.top = Math.max(0, e.clientY - this.dragStart.y) + 'px';
      this.terminal.style.right = 'auto';
      this.terminal.style.bottom = 'auto';
    }


    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.stopDrag);
    }


    startResize(e, resizer) {
      e.preventDefault();
      e.stopPropagation();
      this.isResizing = true;
      const rect = this.terminal.getBoundingClientRect();
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      };
      this.resizeDir = resizer.className.split(' ')[1];
      document.addEventListener('mousemove', this.resize.bind(this));
      document.addEventListener('mouseup', this.stopResize.bind(this));
    }


    resize(e) {
      if (!this.isResizing || !this.terminal) return;
      const dx = e.clientX - this.resizeStart.x;
      const dy = e.clientY - this.resizeStart.y;
     
      let newWidth = this.resizeStart.width;
      let newHeight = this.resizeStart.height;
     
      if (['resizer-right', 'resizer-corner'].includes(this.resizeDir)) {
        newWidth = Math.max(300, this.resizeStart.width + dx);
      }
      if (['resizer-bottom', 'resizer-corner'].includes(this.resizeDir)) {
        newHeight = Math.max(200, this.resizeStart.height + dy);
      }
     
      this.terminal.style.width = newWidth + 'px';
      this.terminal.style.height = newHeight + 'px';
    }


    stopResize() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResize);
    }


    scrollToBottom() {
      if (this.output) {
        this.output.scrollTop = this.output.scrollHeight;
      }
    }


    close() {
      console.log('Cerrando Whoami Terminal');
      const browserTab = document.getElementById('whoami-browser');
      if (browserTab) browserTab.style.display = 'none';
     
      const desktopContent = document.getElementById('desktop-content');
      if (desktopContent) desktopContent.innerHTML = '';
     
      const whoamiContent = document.getElementById('whoami-content');
      if (whoamiContent) whoamiContent.remove();
     
      const scripts = document.querySelectorAll('script[src*="whoami.js"]');
      scripts.forEach(script => script.remove());
     
      if (window.rofiMenu) window.rofiMenu.init();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.whoami = new window.Whoami();
    window.whoami.init();
  });
 
  if (document.readyState !== 'loading') {
    window.whoami = new window.Whoami();
    window.whoami.init();
  }
}