// js/lockscreen.js

class LockScreen {
  constructor() {
    this.initialized = false;
    this.timeUpdateInterval = null;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    const mainpage = document.getElementById('mainpage');
    mainpage.innerHTML = this.render();

    this.updateTime();
    this.timeUpdateInterval = setInterval(() => this.updateTime(), 1000);

    this.startPasswordAnimation();

    this.attachButtonListeners();

    this.autoTransitionTimeout = setTimeout(() => {
      this.transitionToRofi();
    }, 3000);
  }

  transitionToRofi() {
    // Limpiar timers
    clearInterval(this.timeUpdateInterval);
    clearTimeout(this.autoTransitionTimeout);

    // Animar salida del lockscreen
    const lockscreen = document.querySelector('.lockscreen');
    if (lockscreen) {
      lockscreen.classList.add('lockscreen-exit');
      
      setTimeout(() => {
        // Limpiar mainpage completamente
        const mainpage = document.getElementById('mainpage');
        if (mainpage) {
          mainpage.innerHTML = '';
          mainpage.style.display = 'block';
        }

        const script = document.createElement('script');
        script.src = 'js/desktop.js';
        script.onload = () => {
          console.log('desktop.js cargado');
        };
        script.onerror = () => {
          console.error('Error cargando desktop.js');
        };
        document.body.appendChild(script);
      }, 300);
    }
  }

  render() {
    return `
      <div class="lockscreen">
        <div class="lockscreen-bg">
          <div class="lockscreen-bg-grid"></div>
        </div>

        <div class="lockscreen-container">
          <!-- Sección de bienvenida -->
          <div class="lockscreen-welcome">
            <h1>WELCOME!</h1>
            <div class="time" id="lockscreen-time">00:00</div>
            <div class="date" id="lockscreen-date">Loading...</div>
          </div>

          <!-- Formulario -->
          <div class="lockscreen-form">
            <div class="lockscreen-input-group">
              <input 
                type="text" 
                id="lockscreen-username"
                placeholder="Username" 
                value="${PORTFOLIO_CONFIG.personal.name}"
                disabled
              >
            </div>
            <div class="lockscreen-input-group">
              <input 
                type="password" 
                id="lockscreen-password"
                placeholder="*******" 
                disabled
              >
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="lockscreen-actions">
            <button class="lockscreen-btn" id="btn-suspend">
              <span class="icon">⊘</span>
              <span>Suspend</span>
            </button>
            <button class="lockscreen-btn" id="btn-reboot">
              <span class="icon">↻</span>
              <span>Reboot</span>
            </button>
            <button class="lockscreen-btn" id="btn-shutdown">
              <span class="icon">⚠︎</span>
              <span>Shutdown</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  updateTime() {
    const timeEl = document.getElementById('lockscreen-time');
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

  startPasswordAnimation() {
    const passwordInput = document.getElementById('lockscreen-password');
    if (!passwordInput) return;

    let dots = 0;
    const totalDots = 10;
    const interval = 250;

    const animationInterval = setInterval(() => {
      dots++;
      passwordInput.value = '*'.repeat(dots);

      passwordInput.classList.add('pulse');
      setTimeout(() => passwordInput.classList.remove('pulse'), 150);

      if (dots >= totalDots) {
        clearInterval(animationInterval);
      }
    }, interval);
  }

  attachButtonListeners() {
    const buttons = {
      'btn-suspend': () => this.showAction('Suspending...'),
      'btn-reboot': () => this.showAction('Rebooting...'),
      'btn-shutdown': () => this.showAction('Shutting down...')
    };

    Object.keys(buttons).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', buttons[id]);
      }
    });
  }

  showAction(message) {
    console.log(message);
  }
}

const lockscreen = new LockScreen();
lockscreen.init();
