// PWA Registration & Management
// Registra el Service Worker y gestiona actualizaciones

class PWAManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.deferredPrompt = null;
    
    this.init();
  }
  
  async init() {
    // ⚠️ CRÍTICO: Esperar a que TODO se cargue completamente
    // Esto previene que el SW intercepte la primera carga
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }
    
    // Delay adicional para asegurar que los CSS se aplicaron
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Registrar Service Worker SOLO después de que todo esté cargado
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        console.log('✅ Service Worker registrado');
      } catch (error) {
        console.error('❌ Error al registrar Service Worker:', error);
        // No bloquear la app si falla el SW
      }
    }
    
    // Detectar instalación pendiente
    this.setupInstallPrompt();
    
    // Detectar si ya está instalada
    this.checkIfInstalled();
    
    // Verificar actualizaciones periódicamente
    this.checkForUpdates();
  }
  
  // Registrar Service Worker
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registrado con scope:', this.registration.scope);
      
      // Detectar actualizaciones
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 Nueva versión disponible');
            this.updateAvailable = true;
            this.showUpdateNotification();
          }
        });
      });
      
      // Recargar si hay un nuevo Service Worker activado
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
      
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw error;
    }
  }
  
  // Configurar prompt de instalación
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('💾 Evento beforeinstallprompt detectado');
      
      // Prevenir el prompt automático
      event.preventDefault();
      
      // Guardar el evento para usarlo después
      this.deferredPrompt = event;
      
      // Mostrar botón de instalación personalizado
      this.showInstallButton();
    });
    
    // Detectar cuando se instala la app
    window.addEventListener('appinstalled', (event) => {
      console.log('✅ PWA instalada correctamente');
      this.hideInstallButton();
      this.deferredPrompt = null;
      
      // Tracking
      this.trackInstallation();
    });
  }
  
  // Mostrar botón de instalación
  showInstallButton() {
    const installButton = document.getElementById('install-pwa-btn');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.promptInstall());
    } else {
      // Crear botón dinámicamente si no existe
      this.createInstallButton();
    }
  }
  
  // Crear botón de instalación dinámico
  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'install-pwa-btn';
    button.className = 'install-pwa-button';
    button.innerHTML = `
      <i class="fas fa-download"></i>
      <span>Instalar App</span>
    `;
    button.addEventListener('click', () => this.promptInstall());
    
    // Agregar al DOM (esquina inferior derecha)
    document.body.appendChild(button);
    
    // Agregar estilos
    this.addInstallButtonStyles();
  }
  
  // Estilos para botón de instalación
  addInstallButtonStyles() {
    if (document.getElementById('pwa-install-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
      .install-pwa-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      }
      
      .install-pwa-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
      }
      
      .install-pwa-button i {
        font-size: 18px;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @media (max-width: 768px) {
        .install-pwa-button {
          bottom: 10px;
          right: 10px;
          padding: 12px 20px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Ocultar botón de instalación
  hideInstallButton() {
    const installButton = document.getElementById('install-pwa-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  
  // Prompt de instalación
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('No hay prompt de instalación disponible');
      return;
    }
    
    // Mostrar prompt
    this.deferredPrompt.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    
    // Limpiar prompt
    this.deferredPrompt = null;
    this.hideInstallButton();
  }
  
  // Verificar si la app ya está instalada
  checkIfInstalled() {
    // Detectar si está ejecutándose como PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      console.log('✅ App ejecutándose como PWA instalada');
      this.hideInstallButton();
      
      // Agregar clase al body para estilos específicos
      document.body.classList.add('pwa-installed');
    }
  }
  
  // Mostrar notificación de actualización
  showUpdateNotification() {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <i class="fas fa-sync-alt"></i>
        <span>Nueva versión disponible</span>
        <button id="pwa-update-btn">Actualizar</button>
        <button id="pwa-dismiss-btn">Después</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    this.addUpdateNotificationStyles();
    
    // Event listeners
    document.getElementById('pwa-update-btn').addEventListener('click', () => {
      this.applyUpdate();
    });
    
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      notification.remove();
    });
  }
  
  // Estilos para notificación de actualización
  addUpdateNotificationStyles() {
    if (document.getElementById('pwa-update-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pwa-update-styles';
    style.textContent = `
      .pwa-update-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.5s ease;
      }
      
      .pwa-update-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .pwa-update-content i {
        color: #667eea;
        font-size: 24px;
      }
      
      .pwa-update-content span {
        font-weight: 600;
        color: #333;
      }
      
      .pwa-update-content button {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      #pwa-update-btn {
        background: #667eea;
        color: white;
      }
      
      #pwa-update-btn:hover {
        background: #5568d3;
      }
      
      #pwa-dismiss-btn {
        background: #e0e0e0;
        color: #666;
      }
      
      #pwa-dismiss-btn:hover {
        background: #d0d0d0;
      }
      
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .pwa-update-notification {
          top: 10px;
          left: 10px;
          right: 10px;
          transform: none;
        }
        
        .pwa-update-content {
          flex-direction: column;
          gap: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Aplicar actualización
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) return;
    
    // Enviar mensaje al Service Worker para que se active
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  
  // Verificar actualizaciones periódicamente
  checkForUpdates() {
    if (!this.registration) return;
    
    // Verificar cada hora
    setInterval(() => {
      this.registration.update();
    }, 60 * 60 * 1000);
  }
  
  // Tracking de instalación
  trackInstallation() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed'
      });
    }
  }
  
  // Método público para verificar el estado
  getStatus() {
    return {
      registered: !!this.registration,
      updateAvailable: this.updateAvailable,
      canInstall: !!this.deferredPrompt,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches
    };
  }
}

// Inicializar PWA Manager automáticamente de forma segura
// Solo se ejecuta cuando el DOM está completamente cargado
function initPWA() {
  try {
    window.pwaManager = new PWAManager();
  } catch (error) {
    console.error('Error inicializando PWA Manager:', error);
    // No bloquear la aplicación si falla
  }
}

if (document.readyState === 'loading') {
  // DOM aún no cargado, esperar
  window.addEventListener('load', initPWA);
} else {
  // DOM ya cargado, inicializar inmediatamente pero sin bloquear
  setTimeout(initPWA, 0);
}

// Exportar para uso global
export default PWAManager;
