import { pedidosService } from './services/pedidos.js';
import { carritoService } from './services/carrito.js';
import { authService } from './services/auth.js';

// Variables globales
let carritoActual = [];
let usuario = null;

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛒 [Checkout]: Inicializando página de checkout...');
    
    try {
        // Inicializar autenticación
        await authService.inicializar();
        
        // Verificar usuario logueado
        usuario = await authService.obtenerUsuarioActual();
        if (!usuario) {
            mostrarError('Debes iniciar sesión para continuar');
            setTimeout(() => {
                window.location.href = 'productos.html';
            }, 2000);
            return;
        }
        
        // Cargar carrito
        await cargarDatosCheckout();
        
        // Configurar formulario
        configurarFormulario();
        
        // Configurar event listeners
        configurarEventListeners();
        
    } catch (error) {
        console.error('❌ [Checkout]: Error en inicialización:', error);
        mostrarError('Error cargando la página de checkout');
    }
});

// ===========================
// FUNCIONES PRINCIPALES
// ===========================

/**
 * Cargar datos necesarios para el checkout
 */
async function cargarDatosCheckout() {
    try {
        // Cargar carrito desde BD
        await carritoService.cargarCarritoDesdeDB();
        carritoActual = carritoService.obtenerCarrito();
        
        if (carritoActual.length === 0) {
            mostrarError('Tu carrito está vacío');
            setTimeout(() => {
                window.location.href = 'productos.html';
            }, 2000);
            return;
        }
        
        // Renderizar resumen del pedido
        renderizarResumenPedido();
        
        console.log('✅ [Checkout]: Datos cargados:', carritoActual);
        
    } catch (error) {
        console.error('❌ [Checkout]: Error cargando datos:', error);
        throw error;
    }
}

/**
 * Configurar formulario con datos del usuario
 */
function configurarFormulario() {
    try {
        // Prellenar campos conocidos
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('nombre').value = usuario.name || '';
        
        // Si hay datos del perfil, usarlos
        if (usuario.telefono) {
            document.getElementById('telefono').value = usuario.telefono;
        }
        
    } catch (error) {
        console.error('❌ [Checkout]: Error configurando formulario:', error);
    }
}

/**
 * Renderizar resumen del pedido
 */
function renderizarResumenPedido() {
    const container = document.getElementById('order-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Agregar cada producto
    carritoActual.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.imagen || 'https://via.placeholder.com/50x50?text=Sin+Imagen'}" 
                     alt="${item.nombre}"
                     onerror="this.src='https://via.placeholder.com/50x50?text=Sin+Imagen'">
            </div>
            <div class="order-item-info">
                <h4>${item.nombre}</h4>
                <div class="order-item-price">Q ${item.precio.toFixed(2)} c/u</div>
                <div class="order-item-quantity">Cantidad: ${item.cantidad}</div>
            </div>
        `;
        
        container.appendChild(itemElement);
    });
    
    // Actualizar totales
    actualizarTotales();
}

/**
 * Actualizar totales del resumen
 */
function actualizarTotales() {
    const totales = carritoService.calcularTotales();
    
    const elements = {
        subtotal: document.getElementById('subtotal'),
        shipping: document.getElementById('shipping'),
        tax: document.getElementById('tax'),
        total: document.getElementById('total')
    };
    
    if (elements.subtotal) elements.subtotal.textContent = `Q ${totales.subtotal.toFixed(2)}`;
    if (elements.shipping) {
        elements.shipping.textContent = totales.envio === 0 ? 'GRATIS' : `Q ${totales.envio.toFixed(2)}`;
        if (totales.envio === 0) {
            elements.shipping.style.color = '#28a745';
            elements.shipping.style.fontWeight = 'bold';
        }
    }
    if (elements.tax) elements.tax.textContent = `Q ${totales.impuestos.toFixed(2)}`;
    if (elements.total) elements.total.textContent = `Q ${totales.total.toFixed(2)}`;
}

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validarCampo(input));
        input.addEventListener('input', () => limpiarError(input));
    });
}

/**
 * Manejar envío del formulario
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    
    try {
        // Mostrar loading
        submitBtn.classList.add('btn-loading');
        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;
        
        // Validar formulario
        if (!validarFormulario()) {
            throw new Error('Por favor completa todos los campos requeridos');
        }
        
        // Obtener datos del formulario
        const formData = new FormData(e.target);
        const datosCheckout = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            departamento: formData.get('departamento'),
            municipio: formData.get('municipio'),
            direccion: formData.get('direccion'),
            metodoPago: formData.get('metodoPago'),
            notas: formData.get('notas') || ''
        };
        
        console.log('🛒 [Checkout]: Datos del formulario:', datosCheckout);
        
        // Crear pedido
        const pedido = await pedidosService.crearPedido(datosCheckout);
        
        // Mostrar éxito
        mostrarNotificacion('¡Pedido creado exitosamente!', 'success');
        
        // Redirigir a página de confirmación
        setTimeout(() => {
            window.location.href = `confirmacion.html?pedido=${pedido.$id}&numero=${pedido.numero_pedido}`;
        }, 1500);
        
    } catch (error) {
        console.error('❌ [Checkout]: Error procesando pedido:', error);
        
        let mensaje = 'Error procesando el pedido';
        if (error.message.includes('Stock insuficiente')) {
            mensaje = error.message;
        } else if (error.message.includes('campos requeridos')) {
            mensaje = error.message;
        } else if (error.message.includes('carrito está vacío')) {
            mensaje = 'Tu carrito está vacío';
        }
        
        mostrarError(mensaje);
        
    } finally {
        // Restaurar botón
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = textoOriginal;
        submitBtn.disabled = false;
    }
}

/**
 * Validar formulario completo
 */
function validarFormulario() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    let esValido = true;
    
    inputs.forEach(input => {
        if (!validarCampo(input)) {
            esValido = false;
        }
    });
    
    return esValido;
}

/**
 * Validar campo individual
 */
function validarCampo(input) {
    const grupo = input.closest('.form-group');
    const valor = input.value.trim();
    
    // Limpiar estados previos
    limpiarError(input);
    
    // Validar campo requerido
    if (input.hasAttribute('required') && !valor) {
        mostrarErrorCampo(grupo, 'Este campo es requerido');
        return false;
    }
    
    // Validaciones específicas
    switch (input.type) {
        case 'email':
            if (valor && !validarEmail(valor)) {
                mostrarErrorCampo(grupo, 'Email inválido');
                return false;
            }
            break;
            
        case 'tel':
            if (valor && !validarTelefono(valor)) {
                mostrarErrorCampo(grupo, 'Teléfono inválido');
                return false;
            }
            break;
    }
    
    // Campo válido
    grupo.classList.add('success');
    return true;
}

/**
 * Mostrar error en campo específico
 */
function mostrarErrorCampo(grupo, mensaje) {
    grupo.classList.remove('success');
    grupo.classList.add('error');
    
    // Eliminar mensaje previo
    const mensajePrevio = grupo.querySelector('.error-message');
    if (mensajePrevio) {
        mensajePrevio.remove();
    }
    
    // Agregar nuevo mensaje
    const mensajeError = document.createElement('div');
    mensajeError.className = 'error-message';
    mensajeError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
    grupo.appendChild(mensajeError);
}

/**
 * Limpiar error de campo
 */
function limpiarError(input) {
    const grupo = input.closest('.form-group');
    grupo.classList.remove('error', 'success');
    
    const mensajeError = grupo.querySelector('.error-message');
    if (mensajeError) {
        mensajeError.remove();
    }
}

/**
 * Validar email
 */
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validar teléfono guatemalteco
 */
function validarTelefono(telefono) {
    return /^[0-9]{8}$/.test(telefono.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${getIconForType(tipo)}"></i>
        <span>${mensaje}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getColorForType(tipo)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, tipo === 'error' ? 5000 : 3000);
}

function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

function getIconForType(tipo) {
    switch(tipo) {
        case 'success': return 'check';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getColorForType(tipo) {
    switch(tipo) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

console.log('✅ [Checkout]: Archivo cargado correctamente');