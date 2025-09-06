import { ProductoService } from '../../scripts/services/productos.js';

// Variables globales para las gráficas
let categoryChart = null;
let stockChart = null;
let valueChart = null;

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    console.log('📊 [Admin]: Inicializando dashboard');
    
    try {
        await loadDashboardStats();
        console.log('✅ [Admin]: Dashboard inicializado');
    } catch (error) {
        console.error('❌ [Admin]: Error inicializando dashboard:', error);
    }
}

// Cargar estadísticas del dashboard
async function loadDashboardStats() {
    try {
        console.log('📈 [Admin]: Cargando estadísticas...');
        
        // Obtener todos los productos
        const response = await ProductoService.getAllProducts();
        const products = response.documents || [];
        
        console.log('📦 [Admin]: Productos obtenidos:', products.length);
        
        // Calcular estadísticas
        const stats = calculateStats(products);
        
        console.log('📊 [Admin]: Estadísticas calculadas:', stats);
        
        // Actualizar interfaz
        updateStatsUI(stats);
        
        console.log('✅ [Admin]: Estadísticas cargadas:', stats);
        
    } catch (error) {
        console.error('❌ [Admin]: Error cargando estadísticas:', error);
        
        // Mostrar error en la UI
        const totalProductsEl = document.getElementById('total-products');
        const totalCategoriesEl = document.getElementById('total-categories');
        const totalValueEl = document.getElementById('total-value');
        const lowStockEl = document.getElementById('low-stock-products');
        
        if (totalProductsEl) totalProductsEl.textContent = 'Error';
        if (totalCategoriesEl) totalCategoriesEl.textContent = 'Error';
        if (totalValueEl) totalValueEl.textContent = 'Error';
        if (lowStockEl) lowStockEl.textContent = 'Error';
    }
}

// ✅ FUNCIÓN UNIFICADA PARA CALCULAR ESTADÍSTICAS
function calculateStats(products) {
    const stats = {
        totalProducts: products.length,
        totalCategories: 0,
        totalValue: 0,
        categoriesCount: {},
        categoriesValue: {},
        lowStockProducts: 0
    };
    
    const categories = new Set();
    
    products.forEach(product => {
        if (product.categoria) {
            categories.add(product.categoria);
            stats.categoriesCount[product.categoria] = (stats.categoriesCount[product.categoria] || 0) + 1;
            
            const price = parseFloat(product.precio || 0);
            const stock = parseInt(product.existencia || 0);
            const categoryValue = price * stock;
            
            stats.categoriesValue[product.categoria] = (stats.categoriesValue[product.categoria] || 0) + categoryValue;
            stats.totalValue += categoryValue;
            
            if (stock <= 5) {
                stats.lowStockProducts++;
            }
        }
    });
    
    stats.totalCategories = categories.size;
    
    console.log('📊 [Debug]: Stats calculadas:', {
        totalProducts: stats.totalProducts,
        totalCategories: stats.totalCategories,
        totalValue: stats.totalValue,
        categoriesCount: stats.categoriesCount,
        categoriesValue: stats.categoriesValue,
        lowStockProducts: stats.lowStockProducts
    });
    
    return stats;
}

// ✅ FUNCIÓN UNIFICADA PARA ACTUALIZAR UI
function updateStatsUI(stats) {
    console.log('🎨 [Admin]: Actualizando UI con stats:', stats);
    
    // Actualizar contadores con animación
    const totalProductsEl = document.getElementById('total-products');
    const totalCategoriesEl = document.getElementById('total-categories');
    const totalValueEl = document.getElementById('total-value');
    const lowStockEl = document.getElementById('low-stock-products');
    
    if (totalProductsEl) {
        animateCountUp(totalProductsEl, 0, stats.totalProducts, 1000);
    }
    
    if (totalCategoriesEl) {
        animateCountUp(totalCategoriesEl, 0, stats.totalCategories, 800);
    }
    
    if (totalValueEl) {
        totalValueEl.textContent = `Q ${stats.totalValue.toFixed(2)}`;
    }
    
    if (lowStockEl) {
        animateCountUp(lowStockEl, 0, stats.lowStockProducts, 600);
    }
    
    // ✅ CREAR LAS GRÁFICAS
    console.log('📈 [Admin]: Creando gráficas...');
    createCharts(stats);
}

// Animación de conteo
function animateCountUp(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ✅ FUNCIÓN PARA CREAR GRÁFICAS
function createCharts(stats) {
    console.log('📊 [Charts]: Iniciando creación de gráficas con:', stats);
    
    const colors = {
        primary: '#dc143c',
        secondary: '#74b9ff',
        success: '#00b894',
        warning: '#fdcb6e',
        danger: '#e17055',
        info: '#00cec9'
    };

    // 1. Gráfica de productos por categoría (Doughnut)
    const categoryCtx = document.getElementById('categoryChart');
    console.log('🍩 [Charts]: CategoryChart element:', categoryCtx);
    console.log('🍩 [Charts]: Categories data:', stats.categoriesCount);
    
    if (categoryCtx && stats.categoriesCount && Object.keys(stats.categoriesCount).length > 0) {
        if (categoryChart) {
            categoryChart.destroy();
            console.log('🍩 [Charts]: Destruyendo gráfica anterior');
        }
        
        const categoryData = Object.entries(stats.categoriesCount);
        console.log('🍩 [Charts]: Datos para gráfica:', categoryData);
        
        try {
            categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.map(([cat]) => 
                        cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')
                    ),
                    datasets: [{
                        data: categoryData.map(([, count]) => count),
                        backgroundColor: [
                            colors.primary,
                            colors.secondary,
                            colors.success,
                            colors.warning,
                            colors.info,
                            colors.danger
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 4,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed * 100) / total).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            });
            console.log('✅ [Charts]: Gráfica de categorías creada exitosamente');
        } catch (error) {
            console.error('❌ [Charts]: Error creando gráfica de categorías:', error);
        }
    } else {
        console.log('⚠️ [Charts]: No se puede crear gráfica de categorías - datos insuficientes');
    }

    // 2. Gráfica de estado del stock (Bar)
    const stockCtx = document.getElementById('stockChart');
    console.log('📊 [Charts]: StockChart element:', stockCtx);
    
    if (stockCtx) {
        if (stockChart) {
            stockChart.destroy();
            console.log('📊 [Charts]: Destruyendo gráfica de stock anterior');
        }
        
        const normalStock = stats.totalProducts - stats.lowStockProducts;
        console.log('📊 [Charts]: Stock data - Normal:', normalStock, 'Bajo:', stats.lowStockProducts);
        
        try {
            stockChart = new Chart(stockCtx, {
                type: 'bar',
                data: {
                    labels: ['Stock Normal', 'Stock Bajo'],
                    datasets: [{
                        label: 'Cantidad de Productos',
                        data: [normalStock, stats.lowStockProducts],
                        backgroundColor: [colors.success, colors.danger],
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = normalStock + stats.lowStockProducts;
                                    const percentage = total > 0 ? ((context.parsed.y * 100) / total).toFixed(1) : 0;
                                    return `${context.parsed.y} productos (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ [Charts]: Gráfica de stock creada exitosamente');
        } catch (error) {
            console.error('❌ [Charts]: Error creando gráfica de stock:', error);
        }
    }

    // 3. Gráfica de valor por categoría (Line/Area)
    const valueCtx = document.getElementById('valueChart');
    console.log('📈 [Charts]: ValueChart element:', valueCtx);
    console.log('📈 [Charts]: Value data:', stats.categoriesValue);
    
    if (valueCtx && stats.categoriesValue && Object.keys(stats.categoriesValue).length > 0) {
        if (valueChart) {
            valueChart.destroy();
            console.log('📈 [Charts]: Destruyendo gráfica de valor anterior');
        }
        
        const valueData = Object.entries(stats.categoriesValue);
        console.log('📈 [Charts]: Datos de valor:', valueData);
        
        try {
            valueChart = new Chart(valueCtx, {
                type: 'line',
                data: {
                    labels: valueData.map(([cat]) => 
                        cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')
                    ),
                    datasets: [{
                        label: 'Valor del Inventario',
                        data: valueData.map(([, value]) => value),
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '20',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Valor: Q${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Q' + value.toFixed(0);
                                },
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ [Charts]: Gráfica de valor creada exitosamente');
        } catch (error) {
            console.error('❌ [Charts]: Error creando gráfica de valor:', error);
        }
    } else {
        console.log('⚠️ [Charts]: No se puede crear gráfica de valor - datos insuficientes');
    }
}

// Función para exportar estadísticas
window.exportStats = function() {
    console.log('📊 Exportando estadísticas...');
    
    // Crear modal de opciones de exportación
    showExportModal();
};

// Función para mostrar modal de exportación
function showExportModal() {
    const modal = document.createElement('div');
    modal.className = 'export-modal-overlay';
    modal.innerHTML = `
        <div class="export-modal">
            <div class="export-header">
                <h3><i class="fas fa-download"></i> Exportar Estadísticas</h3>
                <button class="close-btn" onclick="closeExportModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="export-content">
                <p>Selecciona el formato de exportación:</p>
                
                <div class="export-options">
                    <button class="export-option-btn" onclick="exportToCSV()">
                        <i class="fas fa-file-csv"></i>
                        <span>Exportar CSV</span>
                        <small>Datos en formato tabla</small>
                    </button>
                    
                    <button class="export-option-btn" onclick="exportToJSON()">
                        <i class="fas fa-file-code"></i>
                        <span>Exportar JSON</span>
                        <small>Datos estructurados</small>
                    </button>
                    
                    <button class="export-option-btn" onclick="exportToPDF()">
                        <i class="fas fa-file-pdf"></i>
                        <span>Exportar PDF</span>
                        <small>Reporte completo</small>
                    </button>
                    
                    <button class="export-option-btn" onclick="exportToExcel()">
                        <i class="fas fa-file-excel"></i>
                        <span>Exportar Excel</span>
                        <small>Hoja de cálculo</small>
                    </button>
                </div>
                
                <div class="export-settings">
                    <h4>Opciones:</h4>
                    <label>
                        <input type="checkbox" id="includeCharts" checked>
                        Incluir gráficas (solo PDF)
                    </label>
                    <label>
                        <input type="checkbox" id="includeDetails" checked>
                        Incluir detalles de productos
                    </label>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Efecto de fade in
    setTimeout(() => modal.classList.add('show'), 10);
}

// Función para cerrar modal
window.closeExportModal = function() {
    const modal = document.querySelector('.export-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

// Función para obtener datos actuales
async function getCurrentData() {
    try {
        const response = await ProductoService.getAllProducts();
        const products = response.documents || [];
        const stats = calculateStats(products);
        
        return {
            stats,
            products,
            timestamp: new Date().toISOString(),
            generatedBy: 'AetherCubix Admin Panel'
        };
    } catch (error) {
        console.error('❌ Error obteniendo datos:', error);
        return null;
    }
}

// 1. Exportar a CSV
window.exportToCSV = async function() {
    try {
        const data = await getCurrentData();
        if (!data) return;
        
        // Crear CSV de estadísticas generales
        let csvContent = "Estadísticas Generales\n";
        csvContent += "Métrica,Valor\n";
        csvContent += `Total de Productos,${data.stats.totalProducts}\n`;
        csvContent += `Total de Categorías,${data.stats.totalCategories}\n`;
        csvContent += `Valor Total del Inventario,Q${data.stats.totalValue.toFixed(2)}\n`;
        csvContent += `Productos con Stock Bajo,${data.stats.lowStockProducts}\n\n`;
        
        // Agregar datos por categoría
        csvContent += "Datos por Categoría\n";
        csvContent += "Categoría,Cantidad de Productos,Valor Total\n";
        
        Object.keys(data.stats.categoriesCount).forEach(category => {
            const count = data.stats.categoriesCount[category];
            const value = data.stats.categoriesValue[category] || 0;
            csvContent += `${category},${count},Q${value.toFixed(2)}\n`;
        });
        
        // Incluir detalles de productos si está seleccionado
        if (document.getElementById('includeDetails')?.checked) {
            csvContent += "\nDetalle de Productos\n";
            csvContent += "Nombre,Categoría,Precio,Stock,Valor Total\n";
            
            data.products.forEach(product => {
                const precio = parseFloat(product.precio || 0);
                const stock = parseInt(product.existencia || 0);
                const valorTotal = precio * stock;
                
                csvContent += `"${product.nombre}","${product.categoria}",Q${precio.toFixed(2)},${stock},Q${valorTotal.toFixed(2)}\n`;
            });
        }
        
        // Descargar archivo
        downloadFile(csvContent, `estadisticas_${getFormattedDate()}.csv`, 'text/csv');
        
        closeExportModal();
        showNotification('Archivo CSV exportado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error exportando CSV:', error);
        showNotification('Error al exportar CSV', 'error');
    }
};

// 2. Exportar a JSON
window.exportToJSON = async function() {
    try {
        const data = await getCurrentData();
        if (!data) return;
        
        const exportData = {
            metadata: {
                generatedAt: data.timestamp,
                generatedBy: data.generatedBy,
                format: 'JSON',
                version: '1.0'
            },
            statistics: {
                general: {
                    totalProducts: data.stats.totalProducts,
                    totalCategories: data.stats.totalCategories,
                    totalValue: data.stats.totalValue,
                    lowStockProducts: data.stats.lowStockProducts
                },
                byCategory: {
                    counts: data.stats.categoriesCount,
                    values: data.stats.categoriesValue
                }
            }
        };
        
        // Incluir productos si está seleccionado
        if (document.getElementById('includeDetails')?.checked) {
            exportData.products = data.products.map(product => ({
                id: product.$id,
                name: product.nombre,
                category: product.categoria,
                price: parseFloat(product.precio || 0),
                stock: parseInt(product.existencia || 0),
                description: product.descripcion,
                image: product.imagen
            }));
        }
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `estadisticas_${getFormattedDate()}.json`, 'application/json');
        
        closeExportModal();
        showNotification('Archivo JSON exportado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error exportando JSON:', error);
        showNotification('Error al exportar JSON', 'error');
    }
};

// 3. Exportar a PDF con gráficas (versión mejorada)
window.exportToPDF = async function() {
    try {
        // Cargar jsPDF dinámicamente
        if (!window.jsPDF) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => {
                script.onload = resolve;
            });
        }
        
        const data = await getCurrentData();
        if (!data) return;
        
        await ensureChartsRendered();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración
        const margin = 20;
        let yPosition = margin;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        
        // Función para verificar si necesitamos nueva página
        const checkNewPage = (neededSpace) => {
            if (yPosition + neededSpace > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
                return true;
            }
            return false;
        };
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(220, 20, 60); // Color rojo del tema
        doc.text('AetherCubix - Reporte de Estadísticas', margin, yPosition);
        yPosition += 15;
        
        // Fecha
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, margin, yPosition);
        yPosition += 20;
        
        // Estadísticas generales
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Estadísticas Generales', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.text(`• Total de Productos: ${data.stats.totalProducts}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Total de Categorías: ${data.stats.totalCategories}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Valor Total del Inventario: Q${data.stats.totalValue.toFixed(2)}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Productos con Stock Bajo: ${data.stats.lowStockProducts}`, margin, yPosition);
        yPosition += 20;
        
        // Datos por categoría
        checkNewPage(100);
        doc.setFontSize(16);
        doc.text('Distribución por Categorías', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        Object.keys(data.stats.categoriesCount).forEach(category => {
            const count = data.stats.categoriesCount[category];
            const value = data.stats.categoriesValue[category] || 0;
            const percentage = ((count / data.stats.totalProducts) * 100).toFixed(1);
            
            checkNewPage(16);
            doc.text(`• ${category.charAt(0).toUpperCase() + category.slice(1)}:`, margin, yPosition);
            doc.text(`${count} productos (${percentage}%) - Valor: Q${value.toFixed(2)}`, margin + 10, yPosition + 6);
            yPosition += 16;
        });
        
        // 🎯 AGREGAR GRÁFICAS SI ESTÁ SELECCIONADO
        if (document.getElementById('includeCharts')?.checked) {
            yPosition += 10;
            checkNewPage(60);
            
            doc.setFontSize(16);
            doc.setTextColor(220, 20, 60);
            doc.text('Gráficas de Análisis', margin, yPosition);
            yPosition += 20;
            
            // Función para agregar gráfica al PDF
            const addChartToPDF = async (chartId, title) => {
                const canvas = document.getElementById(chartId);
                if (canvas && window[chartId.replace('Chart', 'Chart')]) {
                    try {
                        // Verificar espacio para la gráfica
                        checkNewPage(120);
                        
                        // Título de la gráfica
                        doc.setFontSize(14);
                        doc.setTextColor(0, 0, 0);
                        doc.text(title, margin, yPosition);
                        yPosition += 10;
                        
                        // Convertir canvas a imagen
                        const chartImage = canvas.toDataURL('image/png', 0.8);
                        
                        // Calcular dimensiones para mantener proporción
                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;
                        const maxWidth = pageWidth - (margin * 2);
                        const maxHeight = 100; // Altura máxima para la gráfica
                        
                        let imgWidth = maxWidth;
                        let imgHeight = (canvasHeight * maxWidth) / canvasWidth;
                        
                        if (imgHeight > maxHeight) {
                            imgHeight = maxHeight;
                            imgWidth = (canvasWidth * maxHeight) / canvasHeight;
                        }
                        
                        // Centrar horizontalmente
                        const xPosition = (pageWidth - imgWidth) / 2;
                        
                        // Agregar imagen al PDF
                        doc.addImage(chartImage, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
                        yPosition += imgHeight + 15;
                        
                        console.log(`✅ Gráfica ${title} agregada al PDF`);
                        
                    } catch (error) {
                        console.error(`❌ Error agregando gráfica ${title}:`, error);
                        doc.setFontSize(10);
                        doc.setTextColor(150, 150, 150);
                        doc.text(`[Error al cargar gráfica: ${title}]`, margin, yPosition);
                        yPosition += 15;
                    }
                }
            };
            
            // Agregar cada gráfica
            await addChartToPDF('categoryChart', '1. Distribución de Productos por Categoría');
            await addChartToPDF('stockChart', '2. Estado del Stock (Normal vs Bajo)');
            await addChartToPDF('valueChart', '3. Valor del Inventario por Categoría');
        }
        
        // Nueva página para productos si está seleccionado
        if (document.getElementById('includeDetails')?.checked && data.products.length > 0) {
            doc.addPage();
            yPosition = margin;
            
            doc.setFontSize(16);
            doc.setTextColor(220, 20, 60);
            doc.text('Detalle de Productos', margin, yPosition);
            yPosition += 15;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            // Cabeceras de tabla
            const headers = ['#', 'Producto', 'Categoría', 'Precio', 'Stock', 'Valor Total'];
            const colWidths = [15, 60, 40, 25, 20, 30];
            let xPos = margin;
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            headers.forEach((header, index) => {
                doc.text(header, xPos, yPosition);
                xPos += colWidths[index];
            });
            yPosition += 8;
            
            // Línea separadora
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            
            // Limitar productos mostrados para evitar archivos muy grandes
            const maxProducts = 50;
            const productsToShow = data.products.slice(0, maxProducts);
            
            productsToShow.forEach((product, index) => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                const precio = parseFloat(product.precio || 0);
                const stock = parseInt(product.existencia || 0);
                const valorTotal = precio * stock;
                
                xPos = margin;
                const rowData = [
                    (index + 1).toString(),
                    product.nombre.substring(0, 25) + (product.nombre.length > 25 ? '...' : ''),
                    product.categoria,
                    `Q${precio.toFixed(2)}`,
                    stock.toString(),
                    `Q${valorTotal.toFixed(2)}`
                ];
                
                rowData.forEach((data, colIndex) => {
                    doc.text(data, xPos, yPosition);
                    xPos += colWidths[colIndex];
                });
                
                yPosition += 6;
            });
            
            if (data.products.length > maxProducts) {
                yPosition += 10;
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`... y ${data.products.length - maxProducts} productos más`, margin, yPosition);
            }
        }
        
        // Pie de página con información adicional
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
            doc.text('Generado por AetherCubix Admin Panel', margin, pageHeight - 10);
        }
        
        // Guardar PDF
        doc.save(`estadisticas_completas_${getFormattedDate()}.pdf`);
        
        closeExportModal();
        showNotification('Archivo PDF con gráficas exportado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error exportando PDF:', error);
        showNotification('Error al exportar PDF: ' + error.message, 'error');
    }
};

// Función auxiliar para asegurar que las gráficas estén completamente renderizadas
function ensureChartsRendered() {
    return new Promise((resolve) => {
        // Esperar un momento para que las gráficas se rendericen completamente
        setTimeout(() => {
            // Verificar que todas las gráficas existan
            const charts = [categoryChart, stockChart, valueChart];
            const allChartsReady = charts.every(chart => chart && chart.canvas);
            
            if (allChartsReady) {
                console.log('✅ Todas las gráficas están listas para exportar');
            } else {
                console.log('⚠️ Algunas gráficas no están disponibles');
            }
            
            resolve();
        }, 500);
    });
}

// 4. Exportar a Excel (usando SheetJS)
window.exportToExcel = async function() {
    try {
        // Cargar SheetJS dinámicamente
        if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => {
                script.onload = resolve;
            });
        }
        
        const data = await getCurrentData();
        if (!data) return;
        
        // Crear workbook
        const wb = window.XLSX.utils.book_new();
        
        // Hoja 1: Estadísticas generales
        const statsData = [
            ['Métrica', 'Valor'],
            ['Total de Productos', data.stats.totalProducts],
            ['Total de Categorías', data.stats.totalCategories],
            ['Valor Total del Inventario', `Q${data.stats.totalValue.toFixed(2)}`],
            ['Productos con Stock Bajo', data.stats.lowStockProducts],
            [],
            ['Categoría', 'Cantidad', 'Valor Total'],
            ...Object.keys(data.stats.categoriesCount).map(category => [
                category,
                data.stats.categoriesCount[category],
                `Q${(data.stats.categoriesValue[category] || 0).toFixed(2)}`
            ])
        ];
        
        const statsWs = window.XLSX.utils.aoa_to_sheet(statsData);
        window.XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');
        
        // Hoja 2: Productos (si está seleccionado)
        if (document.getElementById('includeDetails')?.checked) {
            const productsData = [
                ['Nombre', 'Categoría', 'Precio', 'Stock', 'Valor Total', 'Descripción']
            ];
            
            data.products.forEach(product => {
                const precio = parseFloat(product.precio || 0);
                const stock = parseInt(product.existencia || 0);
                const valorTotal = precio * stock;
                
                productsData.push([
                    product.nombre,
                    product.categoria,
                    precio,
                    stock,
                    valorTotal,
                    product.descripcion || ''
                ]);
            });
            
            const productsWs = window.XLSX.utils.aoa_to_sheet(productsData);
            window.XLSX.utils.book_append_sheet(wb, productsWs, 'Productos');
        }
        
        // Descargar archivo
        window.XLSX.writeFile(wb, `estadisticas_${getFormattedDate()}.xlsx`);
        
        closeExportModal();
        showNotification('Archivo Excel exportado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error exportando Excel:', error);
        showNotification('Error al exportar Excel', 'error');
    }
};

// Funciones auxiliares
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}