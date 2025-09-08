import { pedidosService } from './services/pedidos.js';
import { authService } from './services/auth.js';

// Variables globales
let todosPedidos = [];
let pedidosFiltrados = [];
let usuario = null;
let paginaActual = 1;
let pedidosPorPagina = 5;
let pedidoActualModal = null;

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 [Mis Pedidos]: Inicializando página...');
    
    try {
        // Inicializar autenticación
        await authService.inicializar();
        
        // Verificar usuario logueado
        usuario = await authService.obtenerUsuarioActual();
        if (!usuario) {
            mostrarEstadoSinLogin();
            return;
        }
        
        // Cargar pedidos del usuario
        await cargarPedidos();
        
        // Configurar event listeners
        configurarEventListeners();
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error en inicialización:', error);
        mostrarEstadoError('Error cargando la página');
    }
});

// ===========================
// FUNCIONES PRINCIPALES
// ===========================

/**
 * Cargar pedidos del usuario desde la base de datos
 */
async function cargarPedidos() {
    try {
        mostrarEstadoCarga();
        
        // Obtener pedidos del servicio
        todosPedidos = await pedidosService.obtenerPedidosUsuario();
        
        console.log('📋 [Mis Pedidos]: Pedidos cargados:', todosPedidos);
        
        if (todosPedidos.length === 0) {
            mostrarEstadoVacio();
            return;
        }
        
        // Ordenar por fecha más reciente
        todosPedidos.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        
        // Mostrar contenido con pedidos
        pedidosFiltrados = [...todosPedidos];
        mostrarEstadoConPedidos();
        renderizarEstadisticas();
        renderizarPedidos();
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error cargando pedidos:', error);
        mostrarEstadoError(`Error cargando pedidos: ${error.message}`);
    }
}

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    // Filtros
    const estadoFilter = document.getElementById('estado-filter');
    const fechaFilter = document.getElementById('fecha-filter');
    const limpiarFiltros = document.getElementById('limpiar-filtros');
    
    if (estadoFilter) {
        estadoFilter.addEventListener('change', aplicarFiltros);
    }
    
    if (fechaFilter) {
        fechaFilter.addEventListener('change', aplicarFiltros);
    }
    
    if (limpiarFiltros) {
        limpiarFiltros.addEventListener('click', limpiarTodosFiltros);
    }
    
    // Paginación
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        prevPage.addEventListener('click', () => cambiarPagina(paginaActual - 1));
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', () => cambiarPagina(paginaActual + 1));
    }
}

/**
 * Mostrar diferentes estados de la página
 */
function mostrarEstadoCarga() {
    const states = ['loading-state', 'not-logged-state', 'empty-state', 'pedidos-content', 'error-state'];
    states.forEach(state => {
        const element = document.getElementById(state);
        if (element) {
            element.style.display = state === 'loading-state' ? 'block' : 'none';
        }
    });
}

function mostrarEstadoSinLogin() {
    const states = ['loading-state', 'not-logged-state', 'empty-state', 'pedidos-content', 'error-state'];
    states.forEach(state => {
        const element = document.getElementById(state);
        if (element) {
            element.style.display = state === 'not-logged-state' ? 'block' : 'none';
        }
    });
}

function mostrarEstadoVacio() {
    const states = ['loading-state', 'not-logged-state', 'empty-state', 'pedidos-content', 'error-state'];
    states.forEach(state => {
        const element = document.getElementById(state);
        if (element) {
            element.style.display = state === 'empty-state' ? 'block' : 'none';
        }
    });
}

function mostrarEstadoConPedidos() {
    const states = ['loading-state', 'not-logged-state', 'empty-state', 'pedidos-content', 'error-state'];
    states.forEach(state => {
        const element = document.getElementById(state);
        if (element) {
            element.style.display = state === 'pedidos-content' ? 'block' : 'none';
        }
    });
}

function mostrarEstadoError(mensaje) {
    const states = ['loading-state', 'not-logged-state', 'empty-state', 'pedidos-content', 'error-state'];
    states.forEach(state => {
        const element = document.getElementById(state);
        if (element) {
            element.style.display = state === 'error-state' ? 'block' : 'none';
        }
    });
    
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = mensaje;
    }
}

/**
 * Renderizar estadísticas del usuario
 */
function renderizarEstadisticas() {
    try {
        const totalPedidos = todosPedidos.length;
        const totalGastado = todosPedidos.reduce((total, pedido) => total + (pedido.total || 0), 0);
        const pedidosPendientes = todosPedidos.filter(p => p.estado === 'pendiente').length;
        const pedidosEntregados = todosPedidos.filter(p => p.estado === 'entregado').length;
        
        // Actualizar elementos del DOM
        const elements = {
            'total-pedidos': totalPedidos.toString(),
            'total-gastado': `Q ${totalGastado.toFixed(2)}`,
            'pedidos-pendientes': pedidosPendientes.toString(),
            'pedidos-entregados': pedidosEntregados.toString()
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        console.log('✅ [Mis Pedidos]: Estadísticas renderizadas');
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error renderizando estadísticas:', error);
    }
}

/**
 * Renderizar lista de pedidos con paginación
 */
function renderizarPedidos() {
    try {
        const container = document.getElementById('pedidos-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Calcular paginación
        const totalPedidos = pedidosFiltrados.length;
        const totalPaginas = Math.ceil(totalPedidos / pedidosPorPagina);
        const inicio = (paginaActual - 1) * pedidosPorPagina;
        const fin = inicio + pedidosPorPagina;
        const pedidosEnPagina = pedidosFiltrados.slice(inicio, fin);
        
        // Renderizar pedidos de la página actual
        pedidosEnPagina.forEach(pedido => {
            const pedidoElement = crearElementoPedido(pedido);
            container.appendChild(pedidoElement);
        });
        
        // Actualizar paginación
        actualizarPaginacion(totalPaginas);
        
        console.log(`✅ [Mis Pedidos]: ${pedidosEnPagina.length} pedidos renderizados (página ${paginaActual}/${totalPaginas})`);
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error renderizando pedidos:', error);
    }
}

/**
 * Crear elemento HTML para un pedido
 */
function crearElementoPedido(pedido) {
    const pedidoElement = document.createElement('div');
    pedidoElement.className = 'pedido-card';
    
    // Generar número de pedido
    const fecha = new Date(pedido.fecha_creacion);
    const numeroPedido = `AC${fecha.getFullYear().toString().substr(-2)}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}${pedido.$id.slice(-4).toUpperCase()}`;
    
    // Formatear fecha
    const fechaFormateada = fecha.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    pedidoElement.innerHTML = `
        <div class="pedido-header">
            <div class="pedido-info">
                <h3>Pedido ${numeroPedido}</h3>
                <div class="pedido-date">${fechaFormateada}</div>
            </div>
            <div class="pedido-status">
                <span class="status-badge ${pedido.estado}">
                    <i class="fas fa-${getIconForStatus(pedido.estado)}"></i>
                    ${capitalizeFirst(pedido.estado)}
                </span>
                <div class="pedido-total">Q ${pedido.total.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="pedido-details">
            <div class="pedido-productos" id="productos-${pedido.$id}">
                <!-- Los productos se cargarán dinámicamente -->
            </div>
            
            <div class="pedido-actions">
                <button class="action-btn primary" onclick="verDetallesPedido('${pedido.$id}')">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
                <a href="confirmacion.html?pedido=${pedido.$id}" class="action-btn secondary">
                    <i class="fas fa-receipt"></i> Ver Confirmación
                </a>
            </div>
        </div>
    `;
    
    // Cargar productos del pedido (async)
    cargarProductosPedido(pedido.$id);
    
    return pedidoElement;
}

/**
 * Cargar y mostrar productos de un pedido específico
 */
async function cargarProductosPedido(pedidoId) {
    try {
        const detalles = await pedidosService.obtenerDetallesPedido(pedidoId);
        const container = document.getElementById(`productos-${pedidoId}`);
        
        if (!container || !detalles.length) return;
        
        container.innerHTML = '';
        
        // Mostrar hasta 3 productos como preview
        const productosPreview = detalles.slice(0, 3);
        
        productosPreview.forEach(detalle => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-preview';
            productoElement.innerHTML = `
                <img src="${detalle.producto_imagen || 'https://via.placeholder.com/40x40?text=Sin+Imagen'}" 
                     alt="${detalle.producto_nombre}"
                     title="${detalle.producto_nombre} (${detalle.cantidad}x)"
                     onerror="this.src='https://via.placeholder.com/40x40?text=Sin+Imagen'">
            `;
            container.appendChild(productoElement);
        });
        
        // Si hay más productos, mostrar contador
        if (detalles.length > 3) {
            const countElement = document.createElement('div');
            countElement.className = 'productos-count';
            countElement.textContent = `+${detalles.length - 3}`;
            countElement.title = `${detalles.length - 3} productos más`;
            container.appendChild(countElement);
        }
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error cargando productos del pedido:', error);
    }
}

/**
 * Aplicar filtros a los pedidos
 */
function aplicarFiltros() {
    try {
        const estadoFilter = document.getElementById('estado-filter')?.value;
        const fechaFilter = document.getElementById('fecha-filter')?.value;
        
        let pedidosFiltradosTemp = [...todosPedidos];
        
        // Filtrar por estado
        if (estadoFilter) {
            pedidosFiltradosTemp = pedidosFiltradosTemp.filter(p => p.estado === estadoFilter);
        }
        
        // Filtrar por fecha
        if (fechaFilter) {
            const ahora = new Date();
            let fechaLimite;
            
            switch (fechaFilter) {
                case 'ultima-semana':
                    fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'ultimo-mes':
                    fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'ultimos-3-meses':
                    fechaLimite = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'ultimo-año':
                    fechaLimite = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (fechaLimite) {
                pedidosFiltradosTemp = pedidosFiltradosTemp.filter(p => 
                    new Date(p.fecha_creacion) >= fechaLimite
                );
            }
        }
        
        pedidosFiltrados = pedidosFiltradosTemp;
        paginaActual = 1; // Reset a primera página
        renderizarPedidos();
        
        console.log(`✅ [Mis Pedidos]: Filtros aplicados. ${pedidosFiltrados.length} pedidos encontrados`);
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error aplicando filtros:', error);
    }
}

/**
 * Limpiar todos los filtros
 */
function limpiarTodosFiltros() {
    try {
        const estadoFilter = document.getElementById('estado-filter');
        const fechaFilter = document.getElementById('fecha-filter');
        
        if (estadoFilter) estadoFilter.value = '';
        if (fechaFilter) fechaFilter.value = '';
        
        pedidosFiltrados = [...todosPedidos];
        paginaActual = 1;
        renderizarPedidos();
        
        console.log('✅ [Mis Pedidos]: Filtros limpiados');
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error limpiando filtros:', error);
    }
}

/**
 * Cambiar página de la paginación
 */
function cambiarPagina(nuevaPagina) {
    try {
        const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
        
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
        
        paginaActual = nuevaPagina;
        renderizarPedidos();
        
        // Scroll hacia arriba
        document.getElementById('pedidos-content').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error cambiando página:', error);
    }
}

/**
 * Actualizar controles de paginación
 */
function actualizarPaginacion(totalPaginas) {
    try {
        const paginationContainer = document.getElementById('pagination-container');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (totalPaginas <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        if (paginationContainer) paginationContainer.style.display = 'block';
        
        // Actualizar botones
        if (prevBtn) {
            prevBtn.disabled = paginaActual <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = paginaActual >= totalPaginas;
        }
        
        // Actualizar información de página
        if (currentPageElement) currentPageElement.textContent = paginaActual;
        if (totalPagesElement) totalPagesElement.textContent = totalPaginas;
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error actualizando paginación:', error);
    }
}

/**
 * Ver detalles completos de un pedido en modal
 */
window.verDetallesPedido = async function(pedidoId) {
    try {
        console.log('👁️ [Mis Pedidos]: Abriendo detalles del pedido:', pedidoId);
        
        // Encontrar el pedido
        pedidoActualModal = todosPedidos.find(p => p.$id === pedidoId);
        if (!pedidoActualModal) {
            throw new Error('Pedido no encontrado');
        }
        
        // Cargar detalles del pedido
        const detalles = await pedidosService.obtenerDetallesPedido(pedidoId);
        
        // Renderizar modal
        await renderizarModalPedido(pedidoActualModal, detalles);
        
        // Mostrar modal
        const modal = document.getElementById('pedido-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
    } catch (error) {
        console.error('❌ [Mis Pedidos]: Error abriendo detalles:', error);
        alert(`Error cargando detalles del pedido: ${error.message}`);
    }
};

/**
 * Renderizar contenido del modal con detalles del pedido
 */
async function renderizarModalPedido(pedido, detalles) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    // Generar número de pedido
    const fecha = new Date(pedido.fecha_creacion);
    const numeroPedido = `AC${fecha.getFullYear().toString().substr(-2)}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}${pedido.$id.slice(-4).toUpperCase()}`;
    
    // Formatear fecha
    const fechaFormateada = fecha.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let productosHTML = '';
    detalles.forEach(detalle => {
        productosHTML += `
            <div class="producto-item">
                <div class="producto-imagen">
                    <img src="${detalle.producto_imagen || 'https://via.placeholder.com/60x60?text=Sin+Imagen'}" 
                         alt="${detalle.producto_nombre}"
                         onerror="this.src='https://via.placeholder.com/60x60?text=Sin+Imagen'">
                </div>
                <div class="producto-info">
                    <h5>${detalle.producto_nombre}</h5>
                    <p>Cantidad: ${detalle.cantidad} | Precio unitario: Q ${detalle.precio_unitario.toFixed(2)}</p>
                </div>
                <div class="producto-precio">
                    Q ${detalle.precio_total.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    modalBody.innerHTML = `
        <div class="order-summary-card">
            <div class="card-header">
                <h3><i class="fas fa-receipt"></i> Información del Pedido</h3>
                <div class="order-id">
                    <span>Pedido:</span>
                    <strong>${numeroPedido}</strong>
                </div>
            </div>
            
            <div class="order-details">
                <div class="detail-row">
                    <span>Fecha:</span>
                    <span>${fechaFormateada}</span>
                </div>
                <div class="detail-row">
                    <span>Estado:</span>
                    <span class="status-badge ${pedido.estado}">${capitalizeFirst(pedido.estado)}</span>
                </div>
                <div class="detail-row">
                    <span>Método de Pago:</span>
                    <span>${getMetodoPagoTexto(pedido.metodo_pago)}</span>
                </div>
            </div>
            
            <div class="order-items">
                <h4><i class="fas fa-cube"></i> Productos</h4>
                <div>
                    ${productosHTML}
                </div>
            </div>
            
            <div class="order-totals">
                <div class="total-row">
                    <span>Costo de Envío:</span>
                    <span>${pedido.costo_envio === 0 ? 'GRATIS' : `Q ${pedido.costo_envio.toFixed(2)}`}</span>
                </div>
                <div class="total-row final-total">
                    <span>Total:</span>
                    <span>Q ${pedido.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="delivery-info-card" style="margin-top: 2rem;">
            <div class="card-header">
                <h3><i class="fas fa-truck"></i> Información de Entrega</h3>
            </div>
            
            <div class="delivery-details">
                <div>
                    <h4>Dirección de Entrega</h4>
                    <p>${pedido.direccion_envio}</p>
                </div>
                
                <div>
                    <h4>Datos de Contacto</h4>
                    <p><strong>Nombre:</strong> ${pedido.usuario_nombre}</p>
                    <p><strong>Teléfono:</strong> ${pedido.usuario_telefono}</p>
                    <p><strong>Email:</strong> ${pedido.usuario_email}</p>
                </div>
                
                ${pedido.notas && pedido.notas.trim() ? `
                <div>
                    <h4>Notas del Pedido</h4>
                    <p>${pedido.notas}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Cerrar modal de detalles del pedido
 */
window.cerrarModalPedido = function() {
    const modal = document.getElementById('pedido-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    pedidoActualModal = null;
};

/**
 * Imprimir pedido desde el modal
 */
window.imprimirPedidoModal = function() {
    if (!pedidoActualModal) {
        alert('Error: No hay pedido seleccionado para imprimir');
        return;
    }
    
    // Redirigir a página de confirmación para imprimir
    const url = `confirmacion.html?pedido=${pedidoActualModal.$id}`;
    window.open(url, '_blank');
};

// ===========================
// FUNCIONES DE UTILIDAD
// ===========================

/**
 * Capitalizar primera letra
 */
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Obtener icono para estado del pedido
 */
function getIconForStatus(estado) {
    switch (estado) {
        case 'pendiente': return 'clock';
        case 'confirmado': return 'check';
        case 'enviado': return 'truck';
        case 'entregado': return 'check-circle';
        case 'cancelado': return 'times-circle';
        default: return 'question-circle';
    }
}

/**
 * Obtener texto descriptivo del método de pago
 */
function getMetodoPagoTexto(metodoPago) {
    switch (metodoPago) {
        case 'efectivo':
            return 'Pago contra entrega (Efectivo)';
        case 'transferencia':
            return 'Transferencia bancaria';
        default:
            return metodoPago || 'No especificado';
    }
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (e) => {
    const modal = document.getElementById('pedido-modal');
    if (modal && e.target === modal) {
        cerrarModalPedido();
    }
});

console.log('✅ [Mis Pedidos]: Archivo cargado correctamente');