import { pedidosService } from './services/pedidos.js';
import { authService } from './services/auth.js';

// Variables globales
let pedidoActual = null;
let detallesPedido = [];

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 [Confirmación]: Inicializando página de confirmación...');
    
    try {
        // Inicializar autenticación
        await authService.inicializar();
        
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const pedidoId = urlParams.get('pedido');
        const numeroPedido = urlParams.get('numero');
        
        if (!pedidoId) {
            mostrarError('No se encontró información del pedido');
            return;
        }
        
        // Cargar datos del pedido
        await cargarDatosPedido(pedidoId);
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error en inicialización:', error);
        mostrarError('Error cargando la información del pedido');
    }
});

// ===========================
// FUNCIONES PRINCIPALES
// ===========================

/**
 * Cargar datos del pedido desde la base de datos
 */
async function cargarDatosPedido(pedidoId) {
    try {
        mostrarEstadoCarga();
        
        // Obtener pedido principal
        const { databases } = await import('./services/appwrite.js');
        const { CONFIG } = await import('./services/appwrite.js');
        
        pedidoActual = await databases.getDocument(
            CONFIG.databaseId,
            CONFIG.collections.venta,
            pedidoId
        );
        
        console.log('📋 [Confirmación]: Pedido cargado:', pedidoActual);
        
        // Obtener detalles del pedido
        detallesPedido = await pedidosService.obtenerDetallesPedido(pedidoId);
        
        console.log('📋 [Confirmación]: Detalles cargados:', detallesPedido);
        
        // Renderizar página de éxito
        mostrarEstadoExito();
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error cargando pedido:', error);
        mostrarError(`Error cargando el pedido: ${error.message}`);
    }
}

/**
 * Mostrar estado de carga
 */
function mostrarEstadoCarga() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const successState = document.getElementById('success-state');
    
    if (loadingState) loadingState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    if (successState) successState.style.display = 'none';
}

/**
 * Mostrar estado de error
 */
function mostrarError(mensaje) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const successState = document.getElementById('success-state');
    const errorMessage = document.getElementById('error-message');
    
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'block';
    if (successState) successState.style.display = 'none';
    if (errorMessage) errorMessage.textContent = mensaje;
}

/**
 * Mostrar estado de éxito y renderizar datos
 */
function mostrarEstadoExito() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const successState = document.getElementById('success-state');
    
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    if (successState) successState.style.display = 'block';
    
    // Renderizar todos los datos
    renderizarDatosPedido();
    renderizarProductos();
    renderizarTotales();
    renderizarInformacionEntrega();
    renderizarNotas();
    configurarEnlaceSoporte();
}

/**
 * Renderizar información básica del pedido
 */
function renderizarDatosPedido() {
    try {
        // Número de pedido
        const numeroPedidoElement = document.getElementById('numero-pedido');
        if (numeroPedidoElement && pedidoActual.$id) {
            // Generar número de pedido basado en ID y fecha
            const fecha = new Date(pedidoActual.fecha_creacion || pedidoActual.$createdAt);
            const numeroGenerado = `AC${fecha.getFullYear().toString().substr(-2)}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}${pedidoActual.$id.slice(-4).toUpperCase()}`;
            numeroPedidoElement.textContent = numeroGenerado;
        }
        
        // Fecha del pedido
        const fechaPedidoElement = document.getElementById('fecha-pedido');
        if (fechaPedidoElement && pedidoActual.fecha_creacion) {
            const fecha = new Date(pedidoActual.fecha_creacion);
            const fechaFormateada = fecha.toLocaleDateString('es-GT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            fechaPedidoElement.textContent = fechaFormateada;
        }
        
        // Estado del pedido
        const estadoPedidoElement = document.getElementById('estado-pedido');
        if (estadoPedidoElement && pedidoActual.estado) {
            const estado = pedidoActual.estado;
            estadoPedidoElement.textContent = capitalizeFirst(estado);
            estadoPedidoElement.className = `status-badge ${estado}`;
        }
        
        // Método de pago
        const metodoPagoElement = document.getElementById('metodo-pago');
        if (metodoPagoElement && pedidoActual.metodo_pago) {
            const metodoTexto = pedidoActual.metodo_pago === 'efectivo' 
                ? 'Pago contra entrega (Efectivo)'
                : pedidoActual.metodo_pago === 'transferencia'
                ? 'Transferencia bancaria'
                : pedidoActual.metodo_pago;
            metodoPagoElement.textContent = metodoTexto;
        }
        
        console.log('✅ [Confirmación]: Datos básicos renderizados');
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error renderizando datos básicos:', error);
    }
}

/**
 * Renderizar productos del pedido
 */
function renderizarProductos() {
    try {
        const container = document.getElementById('productos-list');
        if (!container || !detallesPedido.length) return;
        
        container.innerHTML = '';
        
        detallesPedido.forEach(detalle => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-item';
            
            productoElement.innerHTML = `
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
            `;
            
            container.appendChild(productoElement);
        });
        
        console.log('✅ [Confirmación]: Productos renderizados');
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error renderizando productos:', error);
    }
}

/**
 * Renderizar totales del pedido
 */
function renderizarTotales() {
    try {
        // Costo de envío
        const costoEnvioElement = document.getElementById('costo-envio');
        if (costoEnvioElement && pedidoActual.costo_envio !== undefined) {
            if (pedidoActual.costo_envio === 0) {
                costoEnvioElement.textContent = 'GRATIS';
                costoEnvioElement.style.color = '#28a745';
                costoEnvioElement.style.fontWeight = 'bold';
            } else {
                costoEnvioElement.textContent = `Q ${pedidoActual.costo_envio.toFixed(2)}`;
            }
        }
        
        // Total del pedido
        const totalPedidoElement = document.getElementById('total-pedido');
        if (totalPedidoElement && pedidoActual.total !== undefined) {
            totalPedidoElement.textContent = `Q ${pedidoActual.total.toFixed(2)}`;
        }
        
        console.log('✅ [Confirmación]: Totales renderizados');
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error renderizando totales:', error);
    }
}

/**
 * Renderizar información de entrega
 */
function renderizarInformacionEntrega() {
    try {
        // Dirección de entrega
        const direccionEntregaElement = document.getElementById('direccion-entrega');
        if (direccionEntregaElement && pedidoActual.direccion_envio) {
            direccionEntregaElement.textContent = pedidoActual.direccion_envio;
        }
        
        // Datos de contacto
        const nombreClienteElement = document.getElementById('nombre-cliente');
        const telefonoClienteElement = document.getElementById('telefono-cliente');
        const emailClienteElement = document.getElementById('email-cliente');
        
        if (nombreClienteElement && pedidoActual.usuario_nombre) {
            nombreClienteElement.textContent = pedidoActual.usuario_nombre;
        }
        
        if (telefonoClienteElement && pedidoActual.usuario_telefono) {
            telefonoClienteElement.textContent = pedidoActual.usuario_telefono;
        }
        
        if (emailClienteElement && pedidoActual.usuario_email) {
            emailClienteElement.textContent = pedidoActual.usuario_email;
        }
        
        console.log('✅ [Confirmación]: Información de entrega renderizada');
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error renderizando información de entrega:', error);
    }
}

/**
 * Renderizar notas del pedido (si existen)
 */
function renderizarNotas() {
    try {
        const notasContainer = document.getElementById('notas-container');
        const notasPedidoElement = document.getElementById('notas-pedido');
        
        if (notasContainer && notasPedidoElement && pedidoActual.notas && pedidoActual.notas.trim()) {
            notasPedidoElement.textContent = pedidoActual.notas;
            notasContainer.style.display = 'block';
            console.log('✅ [Confirmación]: Notas renderizadas');
        } else {
            if (notasContainer) notasContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error renderizando notas:', error);
    }
}

/**
 * Configurar enlace de soporte con información del pedido
 */
function configurarEnlaceSoporte() {
    try {
        const emailSoporte = document.getElementById('email-soporte');
        if (emailSoporte && pedidoActual) {
            const numeroPedido = document.getElementById('numero-pedido')?.textContent || 'N/A';
            const asunto = `Consulta sobre pedido ${numeroPedido}`;
            const cuerpo = `Hola,\n\nTengo una consulta sobre mi pedido:\n- Número: ${numeroPedido}\n- Total: Q ${pedidoActual.total?.toFixed(2) || '0.00'}\n\nConsulta:\n\n`;
            
            emailSoporte.href = `mailto:info@aethercubix.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        }
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error configurando enlace de soporte:', error);
    }
}

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
 * Función para imprimir pedido
 */
window.imprimirPedido = function() {
    try {
        // Crear ventana de impresión con estilos específicos
        const printWindow = window.open('', '_blank');
        const numeroPedido = document.getElementById('numero-pedido')?.textContent || 'N/A';
        
        let productosHTML = '';
        detallesPedido.forEach(detalle => {
            productosHTML += `
                <tr>
                    <td>${detalle.producto_nombre}</td>
                    <td>${detalle.cantidad}</td>
                    <td>Q ${detalle.precio_unitario.toFixed(2)}</td>
                    <td>Q ${detalle.precio_total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pedido ${numeroPedido} - AetherCubix</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #dc143c; margin-bottom: 20px; padding-bottom: 10px; }
                    .logo { color: #dc143c; font-size: 24px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; background-color: #f8f9fa; }
                    .info-section { margin: 20px 0; }
                    .info-title { font-weight: bold; color: #dc143c; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🟥 AetherCubix</div>
                    <h2>Confirmación de Pedido</h2>
                    <p>Pedido #${numeroPedido}</p>
                </div>
                
                <div class="info-section">
                    <div class="info-title">Datos del Cliente:</div>
                    <p><strong>Nombre:</strong> ${pedidoActual.usuario_nombre || 'N/A'}</p>
                    <p><strong>Email:</strong> ${pedidoActual.usuario_email || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> ${pedidoActual.usuario_telefono || 'N/A'}</p>
                </div>
                
                <div class="info-section">
                    <div class="info-title">Dirección de Entrega:</div>
                    <p>${pedidoActual.direccion_envio || 'N/A'}</p>
                </div>
                
                <div class="info-section">
                    <div class="info-title">Productos:</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                        </tbody>
                        <tfoot>
                            <tr class="total">
                                <td colspan="3">Costo de Envío:</td>
                                <td>Q ${pedidoActual.costo_envio?.toFixed(2) || '0.00'}</td>
                            </tr>
                            <tr class="total">
                                <td colspan="3"><strong>TOTAL:</strong></td>
                                <td><strong>Q ${pedidoActual.total?.toFixed(2) || '0.00'}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="info-section">
                    <div class="info-title">Método de Pago:</div>
                    <p>${pedidoActual.metodo_pago === 'efectivo' ? 'Pago contra entrega (Efectivo)' : pedidoActual.metodo_pago}</p>
                </div>
                
                ${pedidoActual.notas && pedidoActual.notas.trim() ? `
                <div class="info-section">
                    <div class="info-title">Notas:</div>
                    <p>${pedidoActual.notas}</p>
                </div>
                ` : ''}
                
                <div class="info-section">
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-GT')}</p>
                    <p><strong>Estado:</strong> ${capitalizeFirst(pedidoActual.estado || 'pendiente')}</p>
                    <p><strong>Tiempo estimado de entrega:</strong> 2-3 días hábiles</p>
                </div>
                
                <div class="info-section">
                    <p><strong>Contacto:</strong> info@aethercubix.com | +502 1234-5678</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Imprimir después de que se cargue el contenido
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
        
        console.log('✅ [Confirmación]: Impresión iniciada');
        
    } catch (error) {
        console.error('❌ [Confirmación]: Error imprimiendo pedido:', error);
        alert('Error al generar la impresión del pedido');
    }
};

console.log('✅ [Confirmación]: Archivo cargado correctamente');