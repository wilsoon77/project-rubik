/**
 * Power BI Analytics - Integración con AetherCubix
 * Permite exportar datos y simular visualizaciones de Power BI
 */

// Variables para seguimiento del informe actual
let currentReport = null;
let reportContainer = null;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 [PowerBI]: Inicializando módulo Power BI...');
    
    reportContainer = document.getElementById('powerbi-report');
    
    // Verificar si estamos en la página de Power BI
    if (!reportContainer) {
        console.log('ℹ️ [PowerBI]: No estamos en la página de Power BI');
        return;
    }
    
    // Inicializar eventos
    setupEventListeners();
    
    console.log('✅ [PowerBI]: Módulo Power BI inicializado correctamente');
});

/**
 * Configurar listeners de eventos
 */
function setupEventListeners() {
    // Añadir eventos a los botones de exportación si existen
    const exportButtons = document.querySelectorAll('[onclick*="exportToPowerBI"]');
    exportButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            exportToPowerBI();
        };
    });
    
    // Añadir eventos a las opciones de visualización
    const reportOptions = document.querySelectorAll('.powerbi-option');
    reportOptions.forEach(option => {
        option.onclick = null; // Eliminar handler inline
        option.addEventListener('click', function() {
            const reportType = this.getAttribute('data-report') || 
                             this.querySelector('h4').textContent.toLowerCase().replace('análisis de ', '');
            loadPowerBIReport(reportType);
        });
    });
}

/**
 * Exportar datos para Power BI
 */
window.exportToPowerBI = async function() {
    try {
        console.log('🔄 [PowerBI]: Preparando exportación de datos...');
        
        showNotification('Preparando datos para exportar...', 'info');
        
        // Obtener datos de productos y pedidos desde el almacenamiento global
        const productos = window.todosProductos || [];
        const pedidos = window.todosPedidos || [];
        
        // Si no hay datos, intentar cargarlos
        if (productos.length === 0 || pedidos.length === 0) {
            console.log('🔄 [PowerBI]: No hay datos disponibles, intentando cargarlos...');
            await loadDataIfNeeded();
        }
        
        // Preparar datos para exportación
        const dataForExport = prepareDataForExport();
        
        // Generar archivo JSON
        const jsonData = JSON.stringify(dataForExport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aethercubix_data_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ [PowerBI]: Datos exportados correctamente');
        showNotification('Datos exportados correctamente para Power BI', 'success');
        
    } catch (error) {
        console.error('❌ [PowerBI]: Error exportando datos:', error);
        showNotification('Error al exportar datos: ' + error.message, 'error');
    }
};

/**
 * Cargar datos si es necesario
 */
async function loadDataIfNeeded() {
    try {
        // Intentar importar servicios
        const productosModule = await import('../../scripts/services/productos.js');
        const pedidosModule = await import('../../scripts/services/pedidos.js');
        
        const ProductoService = productosModule.ProductoService || productosModule.default;
        const pedidosService = pedidosModule.pedidosService || pedidosModule.default;
        
        // Obtener datos
        const [productosResponse, pedidosData] = await Promise.all([
            ProductoService.getAllProducts(),
            pedidosService.obtenerTodosPedidos()
        ]);
        
        // Actualizar variables globales
        window.todosProductos = productosResponse.documents || productosResponse;
        window.todosPedidos = pedidosData;
        
        console.log(`✅ [PowerBI]: Datos cargados: ${window.todosProductos.length} productos, ${window.todosPedidos.length} pedidos`);
        
    } catch (error) {
        console.error('❌ [PowerBI]: Error cargando datos:', error);
        throw new Error('No se pudieron cargar los datos necesarios');
    }
}

/**
 * Preparar datos para exportación
 */
function prepareDataForExport() {
    const productos = window.todosProductos || [];
    const pedidos = window.todosPedidos || [];
    
    // Preparar productos
    const productosFormatted = productos.map(p => ({
        id: p.$id || p.id,
        nombre: p.nombre,
        precio: parseFloat(p.precio) || 0,
        categoria: p.categoria || 'Sin categoría',
        stock: parseInt(p.existencia || p.stock) || 0,
        fecha_creacion: p.$createdAt || p.fecha_creacion || new Date().toISOString()
    }));
    
    // Preparar pedidos
    const pedidosFormatted = pedidos.map(p => {
        const fecha = p.fecha_creacion || p.$createdAt || new Date().toISOString();
        
        // Intentar extraer items en diferentes formatos
        let items = [];
        if (p.items && Array.isArray(p.items)) {
            items = p.items;
        } else if (p.productos && Array.isArray(p.productos)) {
            items = p.productos;
        } else if (p.detalle) {
            if (Array.isArray(p.detalle)) {
                items = p.detalle;
            } else if (typeof p.detalle === 'string') {
                try {
                    const parsed = JSON.parse(p.detalle);
                    if (Array.isArray(parsed)) {
                        items = parsed;
                    }
                } catch (e) {}
            }
        }
        
        return {
            id: p.$id || p.id,
            fecha: fecha,
            cliente: p.nombre_cliente || p.cliente || 'Cliente',
            total: parseFloat(p.total) || 0,
            estado: p.estado || 'Completado',
            items: items.map(item => ({
                producto_id: item.producto_id || item.id,
                nombre: item.nombre || item.producto || 'Producto',
                precio: parseFloat(item.precio) || 0,
                cantidad: parseInt(item.cantidad) || 1
            }))
        };
    });
    
    // Calcular datos adicionales para Power BI
    const ventasPorMes = calcularVentasPorMes(pedidosFormatted);
    const productosPorCategoria = calcularProductosPorCategoria(productosFormatted);
    
    return {
        metadata: {
            fecha_exportacion: new Date().toISOString(),
            total_productos: productosFormatted.length,
            total_pedidos: pedidosFormatted.length
        },
        productos: productosFormatted,
        pedidos: pedidosFormatted,
        analytics: {
            ventas_por_mes: ventasPorMes,
            productos_por_categoria: productosPorCategoria
        }
    };
}

/**
 * Calcular ventas por mes
 */
function calcularVentasPorMes(pedidos) {
    const ventasPorMes = {};
    
    pedidos.forEach(pedido => {
        try {
            const fecha = new Date(pedido.fecha);
            const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
            const mes = `${getMonthName(fecha.getMonth())} ${fecha.getFullYear()}`;
            
            if (!ventasPorMes[mesKey]) {
                ventasPorMes[mesKey] = {
                    mes: mes,
                    total: 0,
                    pedidos: 0
                };
            }
            
            ventasPorMes[mesKey].total += pedido.total;
            ventasPorMes[mesKey].pedidos += 1;
        } catch (e) {}
    });
    
    // Convertir a array y ordenar por fecha
    return Object.entries(ventasPorMes)
        .map(([key, data]) => ({ ...data, key }))
        .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Calcular productos por categoría
 */
function calcularProductosPorCategoria(productos) {
    const categorias = {};
    
    productos.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        
        if (!categorias[categoria]) {
            categorias[categoria] = {
                nombre: categoria,
                cantidad: 0,
                valor_stock: 0
            };
        }
        
        categorias[categoria].cantidad += 1;
        categorias[categoria].valor_stock += producto.precio * producto.stock;
    });
    
    // Convertir a array
    return Object.values(categorias);
}

/**
 * Obtener nombre del mes
 */
function getMonthName(monthIndex) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[monthIndex];
}

/**
 * Cargar informe de Power BI
 */
window.loadPowerBIReport = function(reportType) {
    console.log(`🔄 [PowerBI]: Cargando informe de ${reportType}...`);
    
    // Activar la opción seleccionada
    document.querySelectorAll('.powerbi-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-report') === reportType || 
            option.querySelector('h4').textContent.toLowerCase().includes(reportType)) {
            option.classList.add('active');
        }
    });
    
    // Ocultar placeholder y mostrar contenedor de informe
    document.querySelector('.powerbi-placeholder').style.display = 'none';
    reportContainer.style.display = 'block';
    
    // Mostrar cargando
    reportContainer.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Cargando informe de ${reportType}...</p>
        </div>
    `;
    
    // Simular carga de informe (en una implementación real, aquí se cargaría el informe de Power BI)
    setTimeout(() => {
        renderSimulatedReport(reportType);
    }, 1500);
};

/**
 * Renderizar informe simulado
 */
function renderSimulatedReport(reportType) {
    // Diferentes visualizaciones según el tipo de informe
    let reportHtml = '';
    
    switch (reportType) {
        case 'ventas':
            reportHtml = createVentasReport();
            break;
        case 'productos':
            reportHtml = createProductosReport();
            break;
        case 'inventario':
            reportHtml = createInventarioReport();
            break;
        case 'clientes':
            reportHtml = createClientesReport();
            break;
        default:
            reportHtml = `<div class="error-message">Tipo de informe no reconocido: ${reportType}</div>`;
    }
    
    // Mostrar informe
    reportContainer.innerHTML = reportHtml;
    
    // Inicializar gráficos si es necesario
    initCharts(reportType);
    
    console.log(`✅ [PowerBI]: Informe de ${reportType} cargado correctamente`);
}

/**
 * Inicializar gráficos con Chart.js
 */
function initCharts(reportType) {
    // Si Chart.js no está disponible, cargar dinámicamente
    if (typeof Chart === 'undefined') {
        console.log('🔄 [PowerBI]: Chart.js no está disponible, cargando dinámicamente...');
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('✅ [PowerBI]: Chart.js cargado correctamente');
            createCharts(reportType);
        };
        document.head.appendChild(script);
    } else {
        createCharts(reportType);
    }
}

/**
 * Crear gráficos específicos según el tipo de informe
 */
function createCharts(reportType) {
    switch (reportType) {
        case 'ventas':
            createVentasCharts();
            break;
        case 'productos':
            createProductosCharts();
            break;
        case 'inventario':
            createInventarioCharts();
            break;
        case 'clientes':
            createClientesCharts();
            break;
    }
}

/**
 * Crear gráficos para el informe de ventas
 */
function createVentasCharts() {
    // Datos de ejemplo para los gráficos
    const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    
    // Gráfico de ventas mensuales
    const ventasMensualesCtx = document.getElementById('chart-ventas-mensuales');
    if (ventasMensualesCtx) {
        new Chart(ventasMensualesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas (Q)',
                    data: [12500, 19000, 15000, 22000, 24000, 30000],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendencia de Ventas Mensuales'
                    }
                }
            }
        });
    }
    
    // Gráfico de comparación anual
    const comparacionAnualCtx = document.getElementById('chart-comparacion-anual');
    if (comparacionAnualCtx) {
        new Chart(comparacionAnualCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '2024',
                    data: [12500, 19000, 15000, 22000, 24000, 30000],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)'
                }, {
                    label: '2023',
                    data: [10000, 15000, 12000, 18000, 20000, 25000],
                    backgroundColor: 'rgba(153, 102, 255, 0.5)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación Anual de Ventas'
                    }
                }
            }
        });
    }
}

/**
 * Crear gráficos para el informe de productos
 */
function createProductosCharts() {
    // Datos de ejemplo
    const categorias = ['Cubos 3x3', 'Cubos 4x4', 'Pyraminx', 'Megaminx', 'Accesorios'];
    
    // Gráfico de productos por categoría
    const categoriasCtx = document.getElementById('chart-categorias');
    if (categoriasCtx) {
        new Chart(categoriasCtx, {
            type: 'pie',
            data: {
                labels: categorias,
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Productos por Categoría'
                    }
                }
            }
        });
    }
    
    // Gráfico de top productos
    const topProductosCtx = document.getElementById('chart-top-productos');
    if (topProductosCtx) {
        new Chart(topProductosCtx, {
            type: 'horizontalBar',
            type: 'bar', // Fallback para versiones nuevas de Chart.js
            data: {
                labels: ['GAN 11 M Pro', 'MoYu RS3M', 'QiYi Pyraminx', 'YJ MGC 4x4', 'Kit de lubricantes'],
                datasets: [{
                    label: 'Unidades vendidas',
                    data: [120, 95, 65, 55, 40],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                }]
            },
            options: {
                indexAxis: 'y', // Para barras horizontales en Chart.js 3.x+
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 Productos Más Vendidos'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

/**
 * Crear gráficos para el informe de inventario
 */
function createInventarioCharts() {
    // Gráfico de valor de inventario por categoría
    const valorInventarioCtx = document.getElementById('chart-valor-inventario');
    if (valorInventarioCtx) {
        new Chart(valorInventarioCtx, {
            type: 'bar',
            data: {
                labels: ['Cubos 3x3', 'Cubos 4x4', 'Pyraminx', 'Megaminx', 'Accesorios'],
                datasets: [{
                    label: 'Valor (Q)',
                    data: [25000, 18000, 12000, 9000, 7500],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Valor de Inventario por Categoría'
                    }
                }
            }
        });
    }
    
    // Gráfico de estado de stock
    const estadoStockCtx = document.getElementById('chart-estado-stock');
    if (estadoStockCtx) {
        new Chart(estadoStockCtx, {
            type: 'doughnut',
            data: {
                labels: ['Stock óptimo', 'Stock bajo', 'Sobrestock'],
                datasets: [{
                    data: [70, 15, 15],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Estado del Inventario'
                    }
                }
            }
        });
    }
}

/**
 * Crear gráficos para el informe de clientes
 */
function createClientesCharts() {
    // Gráfico de frecuencia de compra
    const frecuenciaCompraCtx = document.getElementById('chart-frecuencia-compra');
    if (frecuenciaCompraCtx) {
        new Chart(frecuenciaCompraCtx, {
            type: 'pie',
            data: {
                labels: ['Primera compra', '2-5 compras', 'Más de 5 compras'],
                datasets: [{
                    data: [60, 30, 10],
                    backgroundColor: [
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Frecuencia de Compra de Clientes'
                    }
                }
            }
        });
    }
    
    // Gráfico de ticket promedio
    const ticketPromedioCtx = document.getElementById('chart-ticket-promedio');
    if (ticketPromedioCtx) {
        new Chart(ticketPromedioCtx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Ticket Promedio (Q)',
                    data: [350, 380, 400, 420, 450, 480],
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución del Ticket Promedio'
                    }
                }
            }
        });
    }
}

/**
 * Crear plantilla de informe de ventas
 */
function createVentasReport() {
    return `
        <div class="powerbi-report ventas-report">
            <div class="report-header">
                <h2>Análisis de Ventas</h2>
                <div class="report-actions">
                    <button class="btn btn-outline" onclick="exportReportToPDF('ventas')">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card positive">
                    <div class="summary-title">Ventas Totales</div>
                    <div class="summary-value">Q122,500</div>
                    <div class="summary-change positive">+15% vs. mes anterior</div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-title">Ticket Promedio</div>
                    <div class="summary-value">Q485</div>
                    <div class="summary-change positive">+5% vs. mes anterior</div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-title">Pedidos</div>
                    <div class="summary-value">253</div>
                    <div class="summary-change positive">+8% vs. mes anterior</div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-title">Tasa de Conversión</div>
                    <div class="summary-value">3.2%</div>
                    <div class="summary-change positive">+0.3% vs. mes anterior</div>
                </div>
            </div>
            
            <div class="report-charts">
                <div class="chart-container large">
                    <canvas id="chart-ventas-mensuales"></canvas>
                </div>
                
                <div class="chart-container large">
                    <canvas id="chart-comparacion-anual"></canvas>
                </div>
            </div>
            
            <div class="report-table">
                <h3>Desglose de Ventas por Mes</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>Ventas (Q)</th>
                            <th>Pedidos</th>
                            <th>Ticket Promedio</th>
                            <th>Variación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Junio 2025</td>
                            <td>30,000</td>
                            <td>62</td>
                            <td>Q484</td>
                            <td class="positive">+25%</td>
                        </tr>
                        <tr>
                            <td>Mayo 2025</td>
                            <td>24,000</td>
                            <td>52</td>
                            <td>Q461</td>
                            <td class="positive">+9%</td>
                        </tr>
                        <tr>
                            <td>Abril 2025</td>
                            <td>22,000</td>
                            <td>48</td>
                            <td>Q458</td>
                            <td class="positive">+47%</td>
                        </tr>
                        <tr>
                            <td>Marzo 2025</td>
                            <td>15,000</td>
                            <td>34</td>
                            <td>Q441</td>
                            <td class="negative">-21%</td>
                        </tr>
                        <tr>
                            <td>Febrero 2025</td>
                            <td>19,000</td>
                            <td>41</td>
                            <td>Q463</td>
                            <td class="positive">+52%</td>
                        </tr>
                        <tr>
                            <td>Enero 2025</td>
                            <td>12,500</td>
                            <td>29</td>
                            <td>Q431</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Crear plantilla de informe de productos
 */
function createProductosReport() {
    return `
        <div class="powerbi-report productos-report">
            <div class="report-header">
                <h2>Análisis de Productos</h2>
                <div class="report-actions">
                    <button class="btn btn-outline" onclick="exportReportToPDF('productos')">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <div class="summary-title">Total Productos</div>
                    <div class="summary-value">75</div>
                    <div class="summary-change">5 categorías</div>
                </div>
                
                <div class="summary-card positive">
                    <div class="summary-title">Mejor Vendedor</div>
                    <div class="summary-value">GAN 11 M Pro</div>
                    <div class="summary-change positive">120 unidades</div>
                </div>
                
                <div class="summary-card warning">
                    <div class="summary-title">Baja Rotación</div>
                    <div class="summary-value">12 productos</div>
                    <div class="summary-change negative">16% del catálogo</div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-title">Nuevos Productos</div>
                    <div class="summary-value">3</div>
                    <div class="summary-change">Último mes</div>
                </div>
            </div>
            
            <div class="report-charts">
                <div class="chart-container medium">
                    <canvas id="chart-categorias"></canvas>
                </div>
                
                <div class="chart-container medium">
                    <canvas id="chart-top-productos"></canvas>
                </div>
            </div>
            
            <div class="report-table">
                <h3>Top 10 Productos por Rendimiento</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Unidades Vendidas</th>
                            <th>Ingresos (Q)</th>
                            <th>Rentabilidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>GAN 11 M Pro</td>
                            <td>Cubos 3x3</td>
                            <td>120</td>
                            <td>47,880</td>
                            <td class="positive">Alta</td>
                        </tr>
                        <tr>
                            <td>MoYu RS3M</td>
                            <td>Cubos 3x3</td>
                            <td>95</td>
                            <td>18,050</td>
                            <td class="positive">Alta</td>
                        </tr>
                        <tr>
                            <td>QiYi Pyraminx</td>
                            <td>Pyraminx</td>
                            <td>65</td>
                            <td>9,750</td>
                            <td class="neutral">Media</td>
                        </tr>
                        <tr>
                            <td>YJ MGC 4x4</td>
                            <td>Cubos 4x4</td>
                            <td>55</td>
                            <td>13,750</td>
                            <td class="positive">Alta</td>
                        </tr>
                        <tr>
                            <td>Kit de lubricantes</td>
                            <td>Accesorios</td>
                            <td>40</td>
                            <td>7,960</td>
                            <td class="positive">Alta</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Crear plantilla de informe de inventario
 */
function createInventarioReport() {
    return `
        <div class="powerbi-report inventario-report">
            <div class="report-header">
                <h2>Análisis de Inventario</h2>
                <div class="report-actions">
                    <button class="btn btn-outline" onclick="exportReportToPDF('inventario')">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <div class="summary-title">Valor Total</div>
                    <div class="summary-value">Q71,500</div>
                    <div class="summary-change">75 productos</div>
                </div>
                
                <div class="summary-card warning">
                    <div class="summary-title">Stock Bajo</div>
                    <div class="summary-value">8 productos</div>
                    <div class="summary-change negative">Requieren reabastecimiento</div>
                </div>
                
                <div class="summary-card warning">
                    <div class="summary-title">Sobrestock</div>
                    <div class="summary-value">5 productos</div>
                    <div class="summary-change negative">Capital inmovilizado</div>
                </div>
                
                <div class="summary-card positive">
                    <div class="summary-title">Rotación</div>
                    <div class="summary-value">4.2</div>
                    <div class="summary-change positive">Rotación saludable</div>
                </div>
            </div>
            
            <div class="report-charts">
                <div class="chart-container medium">
                    <canvas id="chart-valor-inventario"></canvas>
                </div>
                
                <div class="chart-container medium">
                    <canvas id="chart-estado-stock"></canvas>
                </div>
            </div>
            
            <div class="report-table">
                <h3>Productos con Stock Crítico</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>GAN 11 M Pro</td>
                            <td>Cubos 3x3</td>
                            <td>3</td>
                            <td>10</td>
                            <td class="negative">Crítico</td>
                        </tr>
                        <tr>
                            <td>MoYu RS3M</td>
                            <td>Cubos 3x3</td>
                            <td>5</td>
                            <td>15</td>
                            <td class="negative">Crítico</td>
                        </tr>
                        <tr>
                            <td>Lubricante Speedy</td>
                            <td>Accesorios</td>
                            <td>7</td>
                            <td>10</td>
                            <td class="warning">Bajo</td>
                        </tr>
                        <tr>
                            <td>QiYi Pyraminx</td>
                            <td>Pyraminx</td>
                            <td>8</td>
                            <td>10</td>
                            <td class="warning">Bajo</td>
                        </tr>
                        <tr>
                            <td>Tapete de competición</td>
                            <td>Accesorios</td>
                            <td>6</td>
                            <td>5</td>
                            <td class="positive">Normal</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Crear plantilla de informe de clientes
 */
function createClientesReport() {
    return `
        <div class="powerbi-report clientes-report">
            <div class="report-header">
                <h2>Análisis de Clientes</h2>
                <div class="report-actions">
                    <button class="btn btn-outline" onclick="exportReportToPDF('clientes')">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                </div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <div class="summary-title">Total Clientes</div>
                    <div class="summary-value">425</div>
                    <div class="summary-change positive">+18% vs. mes anterior</div>
                </div>
                
                <div class="summary-card positive">
                    <div class="summary-title">Ticket Promedio</div>
                    <div class="summary-value">Q485</div>
                    <div class="summary-change positive">+5% vs. mes anterior</div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-title">Tasa de Retención</div>
                    <div class="summary-value">32%</div>
                    <div class="summary-change positive">+3% vs. mes anterior</div>
                </div>
                
                <div class="summary-card positive">
                    <div class="summary-title">Nuevos Clientes</div>
                    <div class="summary-value">65</div>
                    <div class="summary-change">Último mes</div>
                </div>
            </div>
            
            <div class="report-charts">
                <div class="chart-container medium">
                    <canvas id="chart-frecuencia-compra"></canvas>
                </div>
                
                <div class="chart-container medium">
                    <canvas id="chart-ticket-promedio"></canvas>
                </div>
            </div>
            
            <div class="report-table">
                <h3>Segmentación de Clientes</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Segmento</th>
                            <th>Clientes</th>
                            <th>% del Total</th>
                            <th>Ticket Promedio</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Competidores</td>
                            <td>85</td>
                            <td>20%</td>
                            <td>Q750</td>
                            <td>Q63,750</td>
                        </tr>
                        <tr>
                            <td>Entusiastas</td>
                            <td>127</td>
                            <td>30%</td>
                            <td>Q500</td>
                            <td>Q63,500</td>
                        </tr>
                        <tr>
                            <td>Principiantes</td>
                            <td>170</td>
                            <td>40%</td>
                            <td>Q350</td>
                            <td>Q59,500</td>
                        </tr>
                        <tr>
                            <td>Regalo</td>
                            <td>43</td>
                            <td>10%</td>
                            <td>Q400</td>
                            <td>Q17,200</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Exportar informe a PDF
 */
window.exportReportToPDF = function(reportType) {
    try {
        console.log(`🔄 [PowerBI]: Exportando informe ${reportType} a PDF...`);
        
        showNotification('Preparando PDF para descargar...', 'info');
        
        // Simular generación de PDF
        setTimeout(() => {
            showNotification('PDF generado correctamente', 'success');
            console.log('✅ [PowerBI]: PDF exportado correctamente (simulación)');
        }, 1500);
        
    } catch (error) {
        console.error('❌ [PowerBI]: Error exportando a PDF:', error);
        showNotification('Error al exportar PDF', 'error');
    }
};

/**
 * Muestra una notificación en pantalla
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'info', 'warning')
 */
window.showNotification = function(message, type = 'info') {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Iconos según el tipo de notificación
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'times-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Estilos para la notificación
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.padding = '15px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.backgroundColor = 'white';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Estilos específicos según tipo
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #4CAF50';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #F44336';
    } else if (type === 'warning') {
        notification.style.borderLeft = '4px solid #FF9800';
    } else {
        notification.style.borderLeft = '4px solid #2196F3';
    }
    
    // Estilos para el contenido
    const content = notification.querySelector('.notification-content');
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    
    // Estilos para el icono
    const iconElement = notification.querySelector('.fa-' + icon);
    iconElement.style.marginRight = '10px';
    iconElement.style.fontSize = '18px';
    
    if (type === 'success') {
        iconElement.style.color = '#4CAF50';
    } else if (type === 'error') {
        iconElement.style.color = '#F44336';
    } else if (type === 'warning') {
        iconElement.style.color = '#FF9800';
    } else {
        iconElement.style.color = '#2196F3';
    }
    
    // Estilos para el botón de cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0';
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.fontSize = '14px';
    closeBtn.style.color = '#999';
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Evento para cerrar notificación
    closeBtn.addEventListener('click', () => {
        closeNotification();
    });
    
    // Cerrar automáticamente después de un tiempo
    const timeout = setTimeout(() => {
        closeNotification();
    }, 5000);
    
    // Función para cerrar
    function closeNotification() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
        
        clearTimeout(timeout);
    }
};

// Crear estilos para la exportación de Power BI
const style = document.createElement('style');
style.textContent = `
    .export-options {
        display: flex;
        gap: 15px;
        margin: 20px 0;
    }
    
    .export-option {
        flex: 1;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .export-option:hover {
        border-color: #667eea;
        transform: translateY(-2px);
    }
    
    .export-option.selected {
        border-color: #667eea;
        background-color: rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
    
    .export-option i {
        font-size: 2rem;
        margin-bottom: 10px;
        color: #667eea;
    }
    
    .export-option span {
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .export-option small {
        color: #718096;
    }
    
    .date-inputs {
        display: flex;
        gap: 15px;
        margin-top: 10px;
    }
    
    .date-inputs > div {
        flex: 1;
    }
    
    .date-inputs label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
    
    .date-inputs input {
        width: 100%;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
    }
    
    .api-url {
        background: #f8fafc;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .api-url code {
        font-family: monospace;
        font-size: 0.9rem;
    }
    
    .credential-field {
        display: flex;
        align-items: center;
        margin: 10px 0;
    }
    
    .credential-field input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px 0 0 4px;
        font-family: monospace;
        background: #f8fafc;
    }
    
    .btn-icon {
        background: #e2e8f0;
        border: none;
        padding: 8px 10px;
        cursor: pointer;
        border-left: 1px solid #cbd5e0;
    }
    
    .btn-icon:last-child {
        border-radius: 0 4px 4px 0;
    }
    
    .btn-icon:hover {
        background: #cbd5e0;
    }
    
    .api-instructions ol {
        padding-left: 20px;
        line-height: 1.6;
    }
    
    .api-note {
        background: #ebf8ff;
        border-left: 4px solid #4299e1;
        padding: 10px 15px;
        margin-top: 15px;
        border-radius: 0 4px 4px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .api-note i {
        color: #4299e1;
        margin-top: 3px;
    }
    
    .powerbi-simulation {
        padding: 20px;
        text-align: center;
    }
    
    .simulation-message {
        background: #f8fafc;
        border: 1px dashed #cbd5e0;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        display: flex;
        align-items: flex-start;
        gap: 15px;
        text-align: left;
    }
    
    .simulation-message i {
        font-size: 1.5rem;
        color: #4299e1;
    }
    
    .simulation-image {
        margin: 20px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .simulation-image img {
        max-width: 100%;
        height: auto;
        display: block;
    }
    
    .simulation-actions {
        margin-top: 20px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;

document.head.appendChild(style);

// Log que la integración se cargó correctamente
console.log('✅ [PowerBI]: Módulo de integración cargado correctamente');