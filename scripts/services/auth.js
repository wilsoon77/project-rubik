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
    mostrarMenuUsuario() {
        // Cerrar menú existente si lo hay
        const menuExistente = document.querySelector('.user-menu');
        if (menuExistente) {
            menuExistente.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-item" onclick="location.href='carrito.html'">
                <i class="fas fa-shopping-cart"></i> Mi Carrito
            </div>
            <div class="user-menu-item" onclick="location.href='mis-pedidos.html'">
                <i class="fas fa-box"></i> Mis Pedidos
            </div>
            <div class="user-menu-item" onclick="authService.cerrarSesion()">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </div>
        `;

        // Posicionar menú
        const authBtn = document.getElementById('auth-btn');
        const rect = authBtn.getBoundingClientRect();

        menu.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            right: ${window.innerWidth - rect.right}px;
            z-index: 10000;
            min-width: 200px;
        `;

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