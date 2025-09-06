import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const userProfile = document.getElementById('user-profile');
    const logoutBtn = document.getElementById('logout-btn');
    const authSwitchBtns = document.querySelectorAll('.auth-switch-btn');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Cambiar entre formularios de login y registro
    authSwitchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authSwitchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const formId = btn.getAttribute('data-form');
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(formId).classList.add('active');
        });
    });

    // Comprueba si hay un usuario logueado
    try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
            showUserProfile(currentUser);
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }

    // Manejo del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerError.textContent = '';

            const name = registerForm.querySelector('#register-name').value;
            const email = registerForm.querySelector('#register-email').value;
            const password = registerForm.querySelector('#register-password').value;

            // Validación básica
            if (password.length < 8) {
                registerError.textContent = 'La contraseña debe tener al menos 8 caracteres';
                return;
            }

            try {
                // Mostrar indicador de carga
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                submitBtn.disabled = true;

                // Intentar registrar al usuario
                const result = await authService.createAccount(email, password, name);
                
                if (result) {
                    // Mostrar perfil del usuario después de registro exitoso
                    const user = await authService.getCurrentUser();
                    showUserProfile(user);
                    showSuccessMessage('¡Cuenta creada exitosamente!');
                }
            } catch (error) {
                if (error.code === 409) {
                    registerError.textContent = 'Este email ya está registrado';
                } else if (error.code === 400) {
                    registerError.textContent = 'Datos inválidos. Revisa tu información';
                } else {
                    registerError.textContent = 'Error al crear la cuenta. Intenta nuevamente';
                }
                console.error('Error de registro:', error);
            } finally {
                // Restaurar botón
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Manejo del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = '';

            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;

            try {
                // Mostrar indicador de carga
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
                submitBtn.disabled = true;

                // Intentar iniciar sesión
                const result = await authService.login(email, password);
                
                if (result) {
                    // Obtener datos del usuario después de login exitoso
                    const user = await authService.getCurrentUser();
                    showUserProfile(user);
                    showSuccessMessage('¡Sesión iniciada correctamente!');
                }
            } catch (error) {
                if (error.code === 401) {
                    loginError.textContent = 'Email o contraseña incorrectos';
                } else {
                    loginError.textContent = 'Error al iniciar sesión. Intenta nuevamente';
                }
                console.error('Error de login:', error);
            } finally {
                // Restaurar botón
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Manejo del botón de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await authService.logout();
                hideUserProfile();
                showSuccessMessage('Sesión cerrada correctamente');
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

    // Función para mostrar el perfil del usuario
    function showUserProfile(user) {
        // Ocultar formularios y mostrar perfil
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.remove('active');
        if (userProfile) {
            userProfile.style.display = 'block';
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
        }
        
        // Ocultar los botones de switch
        document.querySelector('.auth-switch').style.display = 'none';
    }

    // Función para ocultar el perfil y mostrar formulario de login
    function hideUserProfile() {
        if (userProfile) userProfile.style.display = 'none';
        if (loginForm) loginForm.classList.add('active');
        
        // Mostrar los botones de switch
        document.querySelector('.auth-switch').style.display = 'flex';
        
        // Resetear formularios
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Activar el botón de login
        authSwitchBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-form') === 'login-form') {
                btn.classList.add('active');
            }
        });
    }

    // Función para mostrar mensajes de éxito
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--cube-green, #28a745);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            ">
                <i class="fas fa-check-circle"></i> ${message}
            </div>
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }
});

// Añadir estilos para animaciones
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);