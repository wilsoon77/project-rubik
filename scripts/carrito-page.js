import { carritoService } from './services/carrito.js';
import { authService } from './services/auth.js';

// Variables globales
let carritoActual = [];

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛒 [Carrito Page]: Inicializando página del carrito');

    // Inicializar autenticación
    await authService.inicializar();

    // Verificar si usuario está logueado
    const usuario = await authService.obtenerUsuarioActual();
    if (!usuario) {
        // Redirigir a productos si no está logueado
        window.location.href = 'productos.html';
        return;
    }

    // Cargar carrito
    await cargarCarrito();

    // Configurar event listeners
    configurarEventListeners();
});

// ===========================
// FUNCIONES PRINCIPALES
// ===========================

/**
 * Cargar carrito y renderizar
 */
async function cargarCarrito() {
    try {
        await carritoService.cargarCarritoDesdeDB();
        carritoActual = carritoService.obtenerCarrito();

        if (carritoActual.length === 0) {
            mostrarCarritoVacio();
        } else {
            renderizarCarrito();
        }

    } catch (error) {
        console.error('❌ [Carrito Page]: Error cargando carrito:', error);
        mostrarError('Error cargando el carrito');
    }
}

/**
 * Mostrar carrito vacío
 */
function mostrarCarritoVacio() {
    document.getElementById('empty-cart').style.display = 'block';
    document.getElementById('cart-with-items').style.display = 'none';
}

/**
 * Renderizar carrito con productos
 */
function renderizarCarrito() {
    document.getElementById('empty-cart').style.display = 'none';
    document.getElementById('cart-with-items').style.display = 'block';

    const container = document.getElementById('cart-items-list');
    container.innerHTML = '';

    carritoActual.forEach(item => {
        const itemElement = crearElementoCarrito(item);
        container.appendChild(itemElement);
    });

    actualizarResumen();
}

/**
 * Crear elemento visual de producto en carrito
 */
function crearElementoCarrito(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-item-id', item.id);

    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.imagen || 'https://via.placeholder.com/80x80?text=Sin+Imagen'}" 
                 alt="${item.nombre}"
                 onerror="this.src='https://via.placeholder.com/80x80?text=Sin+Imagen'">
        </div>
        
        <div class="cart-item-info">
            <h4>${item.nombre}</h4>
            <div class="cart-item-price">Q ${item.precio.toFixed(2)}</div>
        </div>
        
        <div class="cart-item-controls">
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cambiarCantidad('${item.id}', ${item.cantidad - 1})">-</button>
                <input type="number" 
                       class="quantity-input" 
                       value="${item.cantidad}" 
                       min="1" 
                       onchange="cambiarCantidad('${item.id}', parseInt(this.value))">
                <button class="quantity-btn" onclick="cambiarCantidad('${item.id}', ${item.cantidad + 1})">+</button>
            </div>
            
            <button class="remove-btn" onclick="eliminarProducto('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return div;
}

/**
 * Actualizar resumen de precios
 */
function actualizarResumen() {
    const totales = carritoService.calcularTotales();

    document.getElementById('subtotal').textContent = `Q ${totales.subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = totales.envio === 0 ? 'GRATIS' : `Q ${totales.envio.toFixed(2)}`;
    document.getElementById('tax').textContent = `Q ${totales.impuestos.toFixed(2)}`;
    document.getElementById('total').textContent = `Q ${totales.total.toFixed(2)}`;

    // Mostrar mensaje de envío gratis
    if (totales.subtotal >= 250) {
        const shippingElement = document.getElementById('shipping');
        shippingElement.style.color = '#28a745';
        shippingElement.style.fontWeight = 'bold';
    }
}

/**
 * Cambiar cantidad de producto
 */
window.cambiarCantidad = async function (itemId, nuevaCantidad) {
    try {
        if (nuevaCantidad < 1) {
            await eliminarProducto(itemId);
            return;
        }

        await carritoService.actualizarCantidad(itemId, nuevaCantidad);
        carritoActual = carritoService.obtenerCarrito();

        // Actualizar solo el elemento específico
        const elemento = document.querySelector(`[data-item-id="${itemId}"]`);
        if (elemento) {
            const input = elemento.querySelector('.quantity-input');
            input.value = nuevaCantidad;
        }

        actualizarResumen();

    } catch (error) {
        console.error('❌ [Carrito Page]: Error actualizando cantidad:', error);
        mostrarError('Error actualizando cantidad');
    }
};

/**
 * Eliminar producto del carrito
 */
window.eliminarProducto = async function (itemId) {
    try {
        // Confirmar eliminación
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        await carritoService.eliminarProducto(itemId);
        carritoActual = carritoService.obtenerCarrito();

        // Re-renderizar carrito
        if (carritoActual.length === 0) {
            mostrarCarritoVacio();
        } else {
            renderizarCarrito();
        }

        mostrarNotificacion('Producto eliminado del carrito', 'success');

    } catch (error) {
        console.error('❌ [Carrito Page]: Error eliminando producto:', error);
        mostrarError('Error eliminando producto');
    }
};

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    // Botón de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', procederAlPago);
    }
}

/**
 * Proceder al pago - ACTUALIZADO
 */
function procederAlPago() {
    if (carritoActual.length === 0) {
        mostrarError('Tu carrito está vacío');
        return;
    }

    // Redirigir a checkout
    window.location.href = 'checkout.html';
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Reutilizar la función de main.js si existe
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}

/**
 * Mostrar error
 */
function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

// Export para uso global
window.carritoPageLoaded = true;