// js/desktop.js
console.log('desktop.js cargado');

class Desktop {
  constructor() {
    console.log('Constructor ejecutándose...');
    
    if (typeof PORTFOLIO_CONFIG === 'undefined') {
      console.error('PORTFOLIO_CONFIG no encontrado!');
      console.log('Creando config por defecto...');
      window.PORTFOLIO_CONFIG = {
        personal: {
          name: 'rug4lo',
          location: 'Valladolid, ES'
        }
      };
    }
    
    console.log('desktop.js cargado2');
    this.timeUpdateInterval = null;
  }

  init() {
    console.log('Inicializando Desktop...');
    
    const mainpage = document.getElementById('mainpage');
    if (!mainpage) {
      console.error('#mainpage no encontrado!');
      return;
    }
    
    console.log('Renderizando desktop...');
    mainpage.innerHTML = this.renderDesktop();
    
    this.updateTime();
    this.timeUpdateInterval = setInterval(() => this.updateTime(), 1000);
    
    console.log('Cargando rofi por defecto...');
    this.loadApp('rofi');
  }

  renderDesktop() {
    const name = PORTFOLIO_CONFIG?.personal?.name || 'rug4lo';
    return `
      <!-- TASKBAR TOP -->
      <div class="desktop-taskbar">
        <div class="taskbar-left">
          <img src="assets/icons/logo2.png" width="20" height="20" alt="Logo">
          <span class="taskbar-user">${name}@arch</span>
        </div>
        <div class="taskbar-center">
          <span class="taskbar-user">☕︎</span>
          <span class="taskbar-user">| 1</span>
          <span class="taskbar-user active">2</span>
          <span class="taskbar-user">3</span>
          <span class="taskbar-user">4</span>
          <span class="taskbar-user">5</span>
          <span class="taskbar-user">6</span>
          <span class="taskbar-user">7</span>
          <span class="taskbar-user">8</span>
          <span class="taskbar-user">9 |</span>
          <span class="taskbar-user">0 ⩍</span>
        </div>
        <div class="taskbar-right">
          <span class="taskbar-time" id="taskbar-time">00:00</span>
          <span>| 🔋 92%</span>
          <span>| ⏻</span>
        </div>
      </div>
      
      <!-- DESKTOP CON VENTANAS -->
      <div class="rofi-desktop">
        <div id="desktop-content"></div>
      </div>
    `;
  }

  updateTime() {
    const timeEl = document.getElementById('taskbar-time');
    if (timeEl) {
      const now = new Date();
      const time = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      timeEl.textContent = time;
    }
  }

  loadApp(appType) {
    const desktopContent = document.getElementById('desktop-content');
    desktopContent.innerHTML = '';
    
    if (!document.querySelector(`script[src="js/${appType}.js"]`)) {
        this.loadScript(`js/${appType}.js`);
    } else {
        this.reinitApp(appType);
    }
    }

    reinitApp(appType) {
    switch(appType) {
        case 'rofi':
        const rofiMenu = new RofiMenu();
        rofiMenu.init();
        break;
        case 'whoami':
        const whoami = new window.Whoami();
        whoami.init();
        break;
    }
  }

  loadScript(src, callback) {
    const existingScript = Array.from(document.scripts).find(s => s.src.includes(src));
    if (existingScript) {
      console.log(`${src} ya cargado`);
      if (callback) callback();
      return;
    }
    
    console.log(`Cargando ${src}...`);
    const script = document.createElement('script');
    script.src = src + '?t=' + Date.now();
    script.onload = () => {
      console.log(`${src} cargado`);
      if (callback) callback();
    };
    script.onerror = (error) => {
      console.error(`Error cargando ${src}:`, error);
    };
    document.body.appendChild(script);
  }
}

// Inicializar
console.log('Creando instancia Desktop...');
const desktop = new Desktop();
console.log('Llamando desktop.init()...');
desktop.init();
window.desktop = desktop;