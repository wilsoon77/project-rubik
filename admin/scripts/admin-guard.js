import { authService } from '../../scripts/services/auth.js';

/**
 * Proteger páginas de administración - VERSIÓN MEJORADA
 */
class AdminGuard {
    constructor() {
        this.paginaActual = window.location.pathname.split('/').pop();
        console.log(`🛡️ [AdminGuard]: Protegiendo página: ${this.paginaActual}`);
        this.init();
    }

    async init() {
        try {
            console.log('🛡️ [AdminGuard]: Verificando acceso...');
            
            // Verificar autenticación de forma rápida y silenciosa
            const estaAutenticado = await authService.estaAutenticado();
            if (!estaAutenticado) {
                console.warn('🚫 [AdminGuard]: Usuario no autenticado');
                this.redirigirConMensaje('login', 'Debes sión para acceder al panel de administración');
                return;
            }

            const esAdmin = await authService.esAdministrador();
            if (!esAdmin) {
                console.warn('🚫 [AdminGuard]: Usuario no es administrador');
                this.redirigirConMensaje('denegado', 'No tienes permisos para acceder al panel de administración');
                return;
            }

            console.log('✅ [AdminGuard]: Acceso autorizado - Página cargada correctamente');
            // NO hacer nada más, dejar que la página funcione normalmente

        } catch (error) {
            console.error('❌ [AdminGuard]: Error verificando acceso:', error);
            this.mostrarError();
        }
    }

    redirigirConMensaje(tipo, mensaje) {
        // En lugar de reemplazar el body, redirigir directamente
        if (tipo === 'login') {
            // Guardar la página a la que quería acceder
            sessionStorage.setItem('adminRedirectAfterLogin', window.location.href);
            
            // Mostrar mensaje breve y redirigir
            this.mostrarMensajeYRedirigir(mensaje, '../index.html');
            
        } else if (tipo === 'denegado') {
            this.mostrarMensajeYRedirigir(mensaje, '../index.html');
        }
    }

    mostrarMensajeYRedirigir(mensaje, url) {
        // Crear overlay temporal
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                color: #333;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
            ">
                <i class="fas fa-shield-alt" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <h3>Acceso Restringido</h3>
                <p>${mensaje}</p>
                <p><small>Redirigiendo en 3 segundos...</small></p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = url;
        }, 3000);
    }

    mostrarError() {
        console.error('❌ [AdminGuard]: Error crítico, redirigiendo...');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

// Instanciar guard al cargar la página
new AdminGuard();