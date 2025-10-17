import { AppwriteClient, account, databases, ID, Query } from './appwrite.js';
import { CONFIG } from './appwrite.js';


class AuthService {
    constructor() {
        // ✅ USAR LAS INSTANCIAS YA CREADAS
        this.account = account; // Usar la instancia ya creada
        this.databases = databases; // Usar la instancia ya creada
        this.databaseId = CONFIG.databaseId;
        this.usuarioCollectionId = CONFIG.collections.usuario;
    }

    /**
      * Iniciar sesión con Google OAuth
      */
    async iniciarSesionConGoogle() {
        try {
            console.log('🔵 [Auth]: Iniciando OAuth con Google...');

            // Crear sesión OAuth con Google
            this.account.createOAuth2Session(
                'google',
                `${window.location.origin}/auth/success.html`, // Success URL
                `${window.location.origin}/auth/failure.html`  // Failure URL
            );

        } catch (error) {
            console.error('❌ [Auth]: Error con Google OAuth:', error);
            throw error;
        }
    }

    /**
     * Iniciar sesión con GitHub OAuth
     */
    async iniciarSesionConGitHub() {
        try {
            console.log('🐙 [Auth]: Iniciando OAuth con GitHub...');

            // Crear sesión OAuth con GitHub
            this.account.createOAuth2Session(
                'github',
                `${window.location.origin}/auth/success.html`, // Success URL
                `${window.location.origin}/auth/failure.html`  // Failure URL
            );

        } catch (error) {
            console.error('❌ [Auth]: Error con GitHub OAuth:', error);
            throw error;
        }
    }


    // ✅ NUEVA FUNCIÓN: Manejar callback de OAuth
    async manejarCallbackOAuth() {
        try {
            console.log('🔄 [Auth]: Procesando callback de OAuth...');

            // Obtener usuario actual (ya autenticado por OAuth)
            const usuario = await this.obtenerUsuarioActual();
            if (!usuario) {
                throw new Error('No se pudo obtener información del usuario');
            }

            // Buscar si ya existe perfil en BD
            let perfil = await this.obtenerPerfilUsuario();

            if (!perfil) {
                // Crear perfil si no existe
                perfil = await this.databases.createDocument(
                    this.databaseId,
                    this.usuarioCollectionId,
                    ID.unique(),
                    {
                        email: usuario.email,
                        nombre: usuario.name,
                        avatar: usuario.prefs?.avatar || '',
                        proveedor: 'github',
                        rol: 'cliente'
                    }
                );
                console.log('✅ [Auth]: Perfil creado para usuario OAuth:', perfil);
            }

            // Actualizar UI
            this.actualizarUIAuth(usuario);

            return { usuario, perfil };

        } catch (error) {
            console.error('❌ [Auth]: Error procesando callback OAuth:', error);
            throw error;
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async registrar(email, password, nombre) {
        try {
            console.log('🔐 [Auth]: Registrando usuario:', email);

            // Crear cuenta en Appwrite Auth
            const cuenta = await this.account.create(ID.unique(), email, password, nombre);
            console.log('✅ [Auth]: Cuenta creada:', cuenta);

            // ✅ CORREGIR: Usar createSession en lugar de createEmailSession
            const sesion = await this.account.createEmailPasswordSession(email, password);
            console.log('✅ [Auth]: Sesión creada:', sesion);

            // Crear perfil de usuario en BD
            const perfilUsuario = await this.databases.createDocument(
                this.databaseId,
                this.usuarioCollectionId,
                ID.unique(),
                {
                    email: email,
                    nombre: nombre,
                    rol: 'cliente'
                }
            );

            console.log('✅ [Auth]: Perfil creado:', perfilUsuario);
            return { cuenta, perfil: perfilUsuario };

        } catch (error) {
            console.error('❌ [Auth]: Error en registro:', error);
            throw error;
        }
    }


    /**
     * Iniciar sesión
     */
    async iniciarSesion(email, password) {
        try {
            console.log('🔐 [Auth]: Iniciando sesión:', email);

            // ✅ CORREGIR: Usar createEmailPasswordSession
            const sesion = await this.account.createEmailPasswordSession(email, password);
            console.log('✅ [Auth]: Sesión creada:', sesion);

            // Obtener perfil del usuario
            const perfil = await this.obtenerPerfilUsuario();

            return { sesion, perfil };

        } catch (error) {
            console.error('❌ [Auth]: Error en login:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    async cerrarSesion() {
        try {
            await this.account.deleteSession('current');
            console.log('✅ [Auth]: Sesión cerrada');

            // Limpiar UI
            this.actualizarUIAuth(null);

            // Redirigir a página principal
            window.location.href = 'index.html';

        } catch (error) {
            console.error('❌ [Auth]: Error cerrando sesión:', error);
            throw error;
        }
    }

    /**
     * Obtener usuario actual
     */
    async obtenerUsuarioActual() {
        try {
            const usuario = await this.account.get();
            console.log('👤 [Auth]: Usuario actual:', usuario);
            return usuario;
        } catch (error) {
            console.log('ℹ️ [Auth]: No hay usuario logueado');
            return null;
        }
    }

    /**
     * Obtener perfil del usuario desde BD
     */
    async obtenerPerfilUsuario() {
        try {
            const usuarioActual = await this.obtenerUsuarioActual();
            if (!usuarioActual) return null;

            // Buscar perfil por email
            const perfiles = await this.databases.listDocuments(
                this.databaseId,
                this.usuarioCollectionId,
                [Query.equal('email', usuarioActual.email)]
            );

            return perfiles.documents[0] || null;

        } catch (error) {
            console.error('❌ [Auth]: Error obteniendo perfil:', error);
            return null;
        }
    }

    /**
     * Verificar si está autenticado
     */
    async estaAutenticado() {
        const usuario = await this.obtenerUsuarioActual();
        return !!usuario;
    }

    /**
     * Verificar si el usuario actual es administrador
     */
    async esAdministrador() {
        try {
            const perfil = await this.obtenerPerfilUsuario();
            return perfil && perfil.rol === 'admin';
        } catch (error) {
            console.error('❌ [Auth]: Error verificando rol admin:', error);
            return false;
        }
    }

    /**
     * Redirigir si no es administrador
     */
    async verificarAccesoAdmin() {
        try {
            const esAdmin = await this.esAdministrador();
            if (!esAdmin) {
                console.warn('🚫 [Auth]: Acceso denegado - No es administrador');
                window.location.href = '../index.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('❌ [Auth]: Error verificando acceso admin:', error);
            window.location.href = '../index.html';
            return false;
        }
    }

    /**
     * Actualizar UI de autenticación
     */
    actualizarUIAuth(usuario) {
        const authBtn = document.getElementById('auth-btn');
        const cartNavItem = document.getElementById('cart-nav-item');

        if (usuario) {
            // Usuario logueado
            if (authBtn) {
                authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${usuario.name} <i class="fas fa-chevron-down"></i>`;
                authBtn.onclick = () => this.mostrarMenuUsuario();
            }

            if (cartNavItem) {
                cartNavItem.style.display = 'block';
            }

        } else {
            // Usuario no logueado
            if (authBtn) {
                authBtn.innerHTML = `<i class="fas fa-user"></i> Iniciar Sesión`;
                authBtn.onclick = () => window.showAuthModal();
            }

            if (cartNavItem) {
                cartNavItem.style.display = 'none';
            }
        }
    }

    /**
     * Mostrar menú de usuario
     */
    async mostrarMenuUsuario() {
        // Cerrar menú existente si lo hay
        const menuExistente = document.querySelector('.user-menu');
        if (menuExistente) {
            menuExistente.remove();
            return;
        }

        // Verificar si es admin
        const esAdmin = await this.esAdministrador();

        const menu = document.createElement('div');
        menu.className = 'user-menu';
        
        let menuHTML = `
            <div class="user-menu-item" onclick="location.href='carrito.html'">
                <i class="fas fa-shopping-cart"></i> Mi Carrito
            </div>
            <div class="user-menu-item" onclick="location.href='mis-pedidos.html'">
                <i class="fas fa-box"></i> Mis Pedidos
            </div>
        `;

        // Agregar opción de admin solo si es administrador
        if (esAdmin) {
            menuHTML += `
                <div class="user-menu-separator"></div>
                <div class="user-menu-item admin-option" onclick="location.href='admin/index.html'">
                    <i class="fas fa-cogs"></i> Panel Administración
                </div>
            `;
        }

        menuHTML += `
            <div class="user-menu-separator"></div>
            <div class="user-menu-item" onclick="authService.cerrarSesion()">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </div>
        `;

        menu.innerHTML = menuHTML;

        // Posicionar menú
        const authBtn = document.getElementById('auth-btn');
        const rect = authBtn.getBoundingClientRect();
const isMobile = window.innerWidth < 600;

if (isMobile) {
  menu.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    min-width: 200px;
    max-width: 90vw;
  `;
} else {
  // Calcular posición sin salir del viewport
  const menuWidth = 200;
  let rightOffset = window.innerWidth - rect.right;
  if (rect.right + menuWidth > window.innerWidth) {
    rightOffset = 10; // mantener un margen mínimo
  }

  menu.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 10}px;
    right: ${rightOffset}px;
    z-index: 10000;
    min-width: ${menuWidth}px;
    max-width: 90vw;
  `;
}


        document.body.appendChild(menu);

        // Cerrar al hacer clic fuera
        setTimeout(() => {
            document.addEventListener('click', function cerrarMenu(e) {
                if (!menu.contains(e.target) && !authBtn.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', cerrarMenu);
                }
            });
        }, 100);
    }

    /**
     * Inicializar autenticación
     */
    async inicializar() {
        try {
            const usuario = await this.obtenerUsuarioActual();
            if (usuario) {
                const perfil = await this.obtenerPerfilUsuario();
                this.actualizarUIAuth(usuario);

                // Cargar carrito si el servicio existe
                if (window.carritoService) {
                    await window.carritoService.cargarCarritoDesdeDB();
                }
            }
        } catch (error) {
            console.log('ℹ️ [Auth]: Iniciando sin autenticación');
        }
    }
}

// Instancia global
export const authService = new AuthService();
window.authService = authService;