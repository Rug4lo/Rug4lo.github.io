// js/rofi.js
console.log('rofi.js cargado');

if (typeof RofiMenu === 'undefined') {
  class RofiMenu {
    constructor() {
      this.history = [];
      this.currentMenu = 'main';
    }

    init() {      
      const desktopContent = document.getElementById('desktop-content');
      desktopContent.innerHTML = this.renderRofi();

      this.renderMenu('main');
      this.renderSidebar();
      this.attachEvents();
    }

    renderRofi() {
      return `
        <div class="rofi-wrapper">
          <!-- HEADER BÚSQUEDA -->
          <div class="rofi-header">
            <div class="rofi-top">
              <input type="text" class="rofi-search" placeholder="🔍︎ Search" id="rofi-search">
              <div class="rofi-filters">
                <span class="filter-btn active">🗀 files</span>
                <span class="filter-btn">🗁 folders</span>
                <span class="filter-btn">>_ term</span>
                <span class="filter-btn">🗖 window</span>
              </div>
            </div>
            <div class="rofi-text">
              <span class="main">Rug4lo - Rofi</span>
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

    renderMenu(menuType) {
      const grid = document.getElementById('rofi-grid');
      grid.innerHTML = `
        <div class="rofi-item" data-type="whoami">
          <img src="assets/icons/info.svg" class="rofi-icon" alt="@rug4lo" style="width:32px; height:32px;">
          <span class="rofi-label">Whoami.elf</span>
        </div>
        <div class="rofi-item" data-type="linkedin" data-url="https://www.linkedin.com/in/ruben-garcia-lopez-aka-rug4lo-055496279">
          <img src="assets/icons/linkedin.svg" class="rofi-icon" alt="LinkedIn" style="width:30px; height:30px;">
          <span class="rofi-label">LinkedIn.desktop</span>
        </div>
        <div class="rofi-item" data-type="writeups">
          <img src="assets/icons/writeup.svg" class="rofi-icon" alt="Cybersecurity" style="width:30px; height:30px;">
          <span class="rofi-label">Machines.elf</span>
        </div>
        <div class="rofi-item" data-type="github" data-url="https://github.com/Rug4lo">
          <img src="assets/icons/github.svg" class="rofi-icon" alt="GitHub" style="width:30px; height:30px;">
          <span class="rofi-label">GitHub.desktop</span>
        </div>
        <div class="rofi-item" data-type="chalenges">
          <img src="assets/icons/cert.svg" class="rofi-icon" alt="Blogs" style="width:30px; height:30px;">
          <span class="rofi-label">Chalenges.elf</span>
        </div>
        <div class="rofi-item" data-type="htb" data-url="https://app.hackthebox.com/users/1478590">
          <img src="assets/icons/htb.svg" class="rofi-icon" alt="HTB" style="width:30px; height:30px;">
          <span class="rofi-label">HackTheBox.desktop</span>
        </div>
        <div class="rofi-item" data-type="blogs">
          <img src="assets/icons/blog.svg" class="rofi-icon" alt="Blogs" style="width:30px; height:30px;">
          <span class="rofi-label">Blogs.elf</span>
        </div>
        <div class="rofi-item" data-type="email" data-url="mailto:rubengarciavalladolid@gmail.com">
          <img src="assets/icons/mail.svg" class="rofi-icon" alt="Email" style="width:30px; height:30px;">
          <span class="rofi-label">Email.desktop</span>
        </div>
      `;
    }

    renderSidebar() {
      const sidebar = document.getElementById('rofi-sidebar');
      sidebar.innerHTML = `
        <div class="sidebar-section">
          <h4>Recent</h4>
          <div class="sidebar-item">terminal</div>
          <div class="sidebar-item active">firefox</div>
          <div class="sidebar-item">code</div>
        </div>
      `;
    }

    attachEvents() {
      const grid = document.getElementById('rofi-grid');
      grid.addEventListener('click', (e) => {
        const item = e.target.closest('.rofi-item');
        if (!item) return;

        const rofiWrapper = document.querySelector('.rofi-wrapper');
        const dataType = item.dataset.type;
        const dataUrl = item.dataset.url;

        setTimeout(() => {
          if (dataUrl) {
            e.preventDefault();
            window.open(dataUrl, '_blank', 'noopener,noreferrer');
            console.log(`Abriendo ${dataType}: ${dataUrl}`);
            return;
          }

          switch(dataType) {
            
          case 'whoami':
            console.log('👤 Abriendo Whoami...');
            
            if (rofiWrapper) {
              rofiWrapper.style.display = 'none';
            }

            if (window.whoami) {
              window.whoami.init(); 
            } else {
              window.desktop.loadApp('whoami');
            }
            break;
            
            case 'writeups':
              
              if (rofiWrapper) {
                rofiWrapper.style.display = 'none';
              }
              
              if (window.writeups) {
                console.log('writeups ya existe, reinicializando...');
                window.writeups.init();
              } else {
                console.log('Cargando writeups.js por primera vez...');
                window.desktop.loadApp('writeups');
              }
              break;

            case 'blogs':
              if (rofiWrapper) {
                rofiWrapper.style.display = 'none';
              }

              if (window.blogs) {
                console.log('blogs ya existe, reinicializando...');
                window.blogs.init();
              } else {
                console.log('Cargando blogs.js por primera vez...');
                window.desktop.loadApp('blogs');
              }
              break;
            case 'chalenges':
              if (rofiWrapper) {
                rofiWrapper.style.display = 'none';
              }

              if (window.chalenges) {
                console.log('chalenges ya existe, reinicializando...');
                window.chalenges.init();
              } else {
                console.log('Cargando certs.js por primera vez...');
                window.desktop.loadApp('chalenges');
              }
              break;
          }
        }, 300);
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

    openApp(appType) {
      const rofiWrapper = document.querySelector('.rofi-wrapper');
      
      // Animación de salida
      rofiWrapper.classList.add('rofi-close');
      
      setTimeout(() => {
        if (window.desktop) {
          window.desktop.loadApp(appType);
        } else {
          console.error('Desktop no disponible');
        }
      }, 300);
    }
  }

  // Inicializar rofi
  window.rofiMenu = new RofiMenu();
  window.rofiMenu.init();
}