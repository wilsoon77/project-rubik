/**
 * Sistema de Insights Inteligentes - VERSIÓN SIMPLIFICADA Y ROBUSTA
 * Se integra con el dashboard existente y utiliza los datos ya cargados
 */

class InsightsSystem {
    constructor() {
        this.initialized = false;

        // Referencias a contenedores
        this.containers = {
            ventas: document.getElementById('ventas-insights'),
            productos: document.getElementById('productos-insights'),
            stock: document.getElementById('stock-insights'),
            predicciones: document.getElementById('predicciones-insights')
        };
    }

    /**
     * Inicializar el sistema
     */
    async initialize() {
        try {
            console.log('🧠 [Insights]: Inicializando sistema de insights...');

            // Verificar que los contenedores existan
            if (!this.verificarContenedores()) {
                console.log('⚠️ [Insights]: Contenedores no encontrados, posiblemente en otra página');
                return;
            }

            // NUEVO: Diagnóstico de datos
        await this.diagnosticarDatos();

            // Configurar las pestañas
            this.setupTabs();

            // Mostrar estado de carga
            this.showLoadingState();

            // Actualizar insights con datos actuales (se obtienen directamente)
            await this.refreshInsights();

            this.initialized = true;
            console.log('✅ [Insights]: Sistema inicializado correctamente');

        } catch (error) {
            console.error('❌ [Insights]: Error inicializando sistema:', error);
            this.showErrorState(error);
        }
    }

    /**
     * Verificar que los contenedores existan
     */
    verificarContenedores() {
        // Al menos uno debe existir para considerarse como página válida
        return Object.values(this.containers).some(container => container !== null);
    }

    /**
     * Configurar las pestañas
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.insight-tab');

        if (tabs.length === 0) {
            console.warn('⚠️ [Insights]: No se encontraron pestañas de insights');
            return;
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');

                // Desactivar todas las pestañas
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.insight-tab-content').forEach(c => c.classList.remove('active'));

                // Activar la pestaña seleccionada
                tab.classList.add('active');

                const targetContent = document.getElementById(`insights-${target}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        // Activar la primera pestaña por defecto
        if (tabs[0] && !tabs[0].classList.contains('active')) {
            tabs[0].click();
        }
    }

    /**
     * Refrescar todos los insights
     */
    async refreshInsights() {
        try {
            console.log('🔄 [Insights]: Actualizando insights...');

            // Obtener datos directamente de las variables globales - MEJORADO
            const productos = window.todosProductos || [];
            const pedidos = window.todosPedidos || [];

            // Verificar si hay datos disponibles
            console.log(`📊 [Insights]: Datos para análisis - ${productos.length} productos y ${pedidos.length} pedidos`);

            // Mostrar advertencia si no hay datos
            if (productos.length === 0) {
                console.warn('⚠️ [Insights]: No hay datos de productos disponibles');
            }
            if (pedidos.length === 0) {
                console.warn('⚠️ [Insights]: No hay datos de pedidos disponibles');
            }

            // Mostrar estado de carga
            this.showLoadingState();

            // Generar los insights solo si hay datos
            if (productos.length > 0 || pedidos.length > 0) {
                await this.generateAllInsights(productos, pedidos);
                console.log('✅ [Insights]: Insights actualizados correctamente');
            } else {
                this.showNoDataState();
                console.warn('⚠️ [Insights]: No hay datos suficientes para generar insights');
            }

        } catch (error) {
            console.error('❌ [Insights]: Error actualizando insights:', error);
            this.showErrorState(error);
        }
    }

    /**
     * Mostrar estado de carga
     */
    showLoadingState() {
        Object.values(this.containers).forEach(container => {
            if (!container) return;

            container.innerHTML = `
                <div class="insight-card loading">
                    <div class="insight-icon"><i class="fas fa-sync fa-spin"></i></div>
                    <div class="insight-content">
                        <h4>Analizando datos...</h4>
                        <p>Generando insights inteligentes...</p>
                    </div>
                </div>
            `;
        });
    }

    /**
     * Mostrar estado de no datos
     */
    showNoDataState() {
        Object.values(this.containers).forEach(container => {
            if (!container) return;

            container.innerHTML = `
                <div class="insight-card info">
                    <div class="insight-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="insight-content">
                        <h4>Sin datos suficientes</h4>
                        <p>Se necesitan datos de productos y ventas para generar insights.</p>
                    </div>
                </div>
            `;
        });
    }

    /**
     * Mostrar estado de error
     */
    showErrorState(error) {
        Object.values(this.containers).forEach(container => {
            if (!container) return;

            container.innerHTML = `
                <div class="insight-card error">
                    <div class="insight-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="insight-content">
                        <h4>Error generando insights</h4>
                        <p>No se pudieron analizar los datos: ${error.message}</p>
                    </div>
                </div>
            `;
        });
    }

    /**
     * Generar todos los insights
     */
    async generateAllInsights(productos, pedidos) {
        try {
            // Generar insights para cada sección
            if (this.containers.ventas) await this.generateVentasInsights(pedidos);
            if (this.containers.productos) await this.generateProductosInsights(productos, pedidos);
            if (this.containers.stock) await this.generateStockInsights(productos);
            if (this.containers.predicciones) await this.generatePrediccionesInsights(productos, pedidos);
        } catch (error) {
            console.error('❌ [Insights]: Error generando insights:', error);
            throw error;
        }
    }

    /**
     * Añadir tarjeta de insight
     */
    addInsightCard(container, insight) {
        // Crear elemento
        const card = document.createElement('div');
        card.className = `insight-card ${insight.type || 'info'}`;

        // Preparar el valor si existe
        let valueSpan = '';
        if (insight.value) {
            const valueClass = insight.value.toString().startsWith('+') ? 'positive' :
                insight.value.toString().startsWith('-') ? 'negative' : 'neutral';

            valueSpan = `<span class="insight-value ${valueClass}">${insight.value}</span>`;
        }

        // Preparar acción si existe
        let actionButton = '';
        if (insight.action) {
            actionButton = `
                <button class="insight-action" onclick="${insight.action.callback}('${insight.action.data || ''}')">
                    ${insight.action.text}
                </button>
            `;
        }

        // HTML interno
        card.innerHTML = `
            <div class="insight-icon">
                <i class="fas fa-${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-header">
                    <h4>${insight.title}</h4>
                    ${valueSpan}
                </div>
                <p>${insight.description}</p>
                ${actionButton}
            </div>
        `;

        // Agregar al contenedor
        container.appendChild(card);
    }

    /**
     * Generar insights de ventas
     */
    async generateVentasInsights(pedidos) {
        const container = this.containers.ventas;
        container.innerHTML = '';

        if (pedidos.length === 0) {
            this.addInsightCard(container, {
                icon: 'info-circle',
                title: 'Sin datos de ventas',
                description: 'No hay suficientes datos para generar insights de ventas.',
                type: 'info'
            });
            return;
        }

        // 1. Insight sobre mejor día de ventas
        const ventasPorDia = this.analizarVentasPorDia(pedidos);
        const mejorDia = this.obtenerMejorDia(ventasPorDia);

        if (mejorDia) {
            this.addInsightCard(container, {
                icon: 'calendar-check',
                title: 'Mejor día de ventas',
                description: `${mejorDia.dia} es tu día con más ventas (Q${mejorDia.total.toFixed(2)}), un ${mejorDia.porcentaje}% por encima del promedio.`,
                value: `+${mejorDia.porcentaje}%`,
                type: 'success'
            });
        }

        // 2. Insight sobre tendencia de ventas
        const tendencia = this.analizarTendenciaVentas(pedidos);
        this.addInsightCard(container, {
            icon: tendencia.icono,
            title: 'Tendencia de ventas',
            description: tendencia.mensaje,
            value: tendencia.valor,
            type: tendencia.tipo
        });

        // 3. Insight sobre horario pico
        const horaPico = this.analizarHorarioPico(pedidos);
        this.addInsightCard(container, {
            icon: 'clock',
            title: 'Hora pico de ventas',
            description: `La mayoría de tus ventas ocurren entre las ${horaPico.inicio} y ${horaPico.fin}. Considera promociones especiales durante este horario.`,
            value: `${horaPico.porcentaje}%`,
            type: 'info'
        });
    }

    /**
     * Generar insights de productos
     */
    // En la función generateProductosInsights (línea ~300)

    async generateProductosInsights(productos, pedidos) {
        const container = this.containers.productos;
        container.innerHTML = '';

        // Información detallada para depuración
        console.log(`🔍 [Insights]: Generando insights de productos con ${productos.length} productos y ${pedidos.length} pedidos`);

        // Verificar estructura de datos
        if (productos.length > 0) {
            console.log('📦 [Insights]: Muestra del primer producto:', productos[0]);
        }

        if (pedidos.length > 0 && pedidos[0].items) {
            console.log('🛒 [Insights]: Muestra del primer pedido con items:',
                pedidos[0].items.length > 0 ? pedidos[0].items[0] : 'No hay items');
        }

        // Resto del código actual...
        if (productos.length === 0 || pedidos.length === 0) {
            this.addInsightCard(container, {
                icon: 'info-circle',
                title: 'Sin datos suficientes',
                description: 'Se necesitan datos de productos y ventas para generar insights.',
                type: 'info'
            });
            return;
        }

        try {
            // 1. Producto más vendido
            const productoMasVendido = this.obtenerProductoMasVendido(pedidos);
            console.log('📊 [Insights]: Producto más vendido:', productoMasVendido);

            if (productoMasVendido) {
                this.addInsightCard(container, {
                    icon: 'trophy',
                    title: 'Producto estrella',
                    description: `"${productoMasVendido.nombre}" es tu producto más vendido con ${productoMasVendido.cantidad} unidades vendidas.`,
                    value: `${productoMasVendido.porcentaje}%`,
                    type: 'success'
                });
            } else {
                // Si no se encontró producto más vendido
                this.addInsightCard(container, {
                    icon: 'info-circle',
                    title: 'Sin datos de ventas por producto',
                    description: 'No se encontraron datos suficientes sobre productos vendidos.',
                    type: 'info'
                });
            }

            // Continuar con el resto de insights si hay datos
            if (productoMasVendido) {
                // 2. Categoría más rentable
                const categoriaMasRentable = this.obtenerCategoriaMasRentable(pedidos);
                if (categoriaMasRentable) {
                    this.addInsightCard(container, {
                        icon: 'star',
                        title: 'Categoría más rentable',
                        description: `La categoría "${categoriaMasRentable.nombre}" genera el mayor ingreso: Q${categoriaMasRentable.total.toFixed(2)}.`,
                        value: `${categoriaMasRentable.porcentaje}%`,
                        type: 'success'
                    });
                }

                // 3. Producto con baja rotación
                const productoPocoVendido = this.obtenerProductoPocoVendido(productos, pedidos);
                if (productoPocoVendido) {
                    this.addInsightCard(container, {
                        icon: 'exclamation-circle',
                        title: 'Producto con baja rotación',
                        description: `"${productoPocoVendido.nombre}" tiene ventas bajas. Considera promocionarlo o revisar su estrategia.`,
                        value: `-${productoPocoVendido.porcentaje}%`,
                        type: 'warning'
                    });
                }
            }
        } catch (error) {
            console.error('❌ [Insights]: Error generando insights de productos:', error);
            this.addInsightCard(container, {
                icon: 'exclamation-triangle',
                title: 'Error en análisis',
                description: `No se pudieron generar insights para productos: ${error.message}`,
                type: 'error'
            });
        }
    }

    /**
     * Generar insights de stock
     */
    async generateStockInsights(productos) {
        const container = this.containers.stock;
        container.innerHTML = '';

        if (productos.length === 0) {
            this.addInsightCard(container, {
                icon: 'info-circle',
                title: 'Sin datos de inventario',
                description: 'No hay suficientes datos para generar insights de inventario.',
                type: 'info'
            });
            return;
        }

        // 1. Productos con stock bajo
        const stockBajo = this.obtenerProductosStockBajo(productos);
        if (stockBajo.length > 0) {
            this.addInsightCard(container, {
                icon: 'exclamation-triangle',
                title: 'Productos con stock bajo',
                description: `${stockBajo.length} productos necesitan reabastecimiento urgente.`,
                value: `${stockBajo.length}`,
                type: 'danger',
                action: {
                    text: 'Ver detalles',
                    callback: 'mostrarDetallesStockBajo'
                }
            });
        } else {
            this.addInsightCard(container, {
                icon: 'check-circle',
                title: 'Inventario saludable',
                description: 'Todos los productos tienen niveles de stock adecuados.',
                type: 'success'
            });
        }

        // 2. Productos sobreabastecidos
        const sobreStock = this.obtenerProductosSobreStock(productos);
        if (sobreStock.length > 0) {
            this.addInsightCard(container, {
                icon: 'box',
                title: 'Productos sobreabastecidos',
                description: `${sobreStock.length} productos tienen exceso de inventario.`,
                value: `${sobreStock.length}`,
                type: 'warning'
            });
        }

        // 3. Valor total del inventario
        const valorInventario = this.calcularValorInventario(productos);
        this.addInsightCard(container, {
            icon: 'dollar-sign',
            title: 'Valor del inventario',
            description: `El inventario actual está valorado en Q${valorInventario.toFixed(2)}.`,
            value: `Q${valorInventario.toFixed(2)}`,
            type: 'info'
        });
    }

    /**
     * Generar insights de predicciones
     */
    async generatePrediccionesInsights(productos, pedidos) {
        const container = this.containers.predicciones;
        container.innerHTML = '';

        if (pedidos.length === 0) {
            this.addInsightCard(container, {
                icon: 'info-circle',
                title: 'Datos insuficientes',
                description: 'Se necesitan más datos de ventas para generar predicciones.',
                type: 'info'
            });
            return;
        }

        // 1. Predicción de ventas para próximo mes
        const prediccionVentas = this.predecirVentasProximoMes(pedidos);
        this.addInsightCard(container, {
            icon: 'chart-line',
            title: 'Predicción de ventas',
            description: `Se proyectan ventas de Q${prediccionVentas.valor.toFixed(2)} para el próximo mes, un ${prediccionVentas.porcentaje}% ${prediccionVentas.tendencia} que el mes anterior.`,
            value: `${prediccionVentas.tendencia === 'más' ? '+' : '-'}${prediccionVentas.porcentaje}%`,
            type: prediccionVentas.tendencia === 'más' ? 'success' : 'warning'
        });

        // 2. Recomendaciones promocionales
        const recomendaciones = this.obtenerRecomendacionesPromociones(productos, pedidos);
        this.addInsightCard(container, {
            icon: 'bullhorn',
            title: 'Recomendaciones promocionales',
            description: recomendaciones.mensaje,
            type: 'info',
            action: {
                text: 'Ver detalles',
                callback: 'mostrarDetallesRecomendaciones'
            }
        });

        // 3. Predicción de productos más vendidos
        const prediccionProductos = this.predecirProductosMasVendidos(pedidos);
        this.addInsightCard(container, {
            icon: 'shopping-cart',
            title: 'Tendencia de productos',
            description: `Se prevé que "${prediccionProductos.nombre}" será tu producto más vendido el próximo mes.`,
            type: 'success'
        });
    }

    // ==============================================
    // MÉTODOS DE ANÁLISIS DE DATOS - OPTIMIZADOS
    // ==============================================

    /**
     * Analizar ventas por día
     */
    analizarVentasPorDia(pedidos) {
        // Inicializar contador para cada día
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const ventasPorDia = {};

        // Inicializar todos los días
        diasSemana.forEach(dia => {
            ventasPorDia[dia] = { total: 0, count: 0 };
        });

        // Contar ventas por día
        pedidos.forEach(pedido => {
            try {
                const fecha = new Date(pedido.fecha_creacion);
                const dia = diasSemana[fecha.getDay()];
                const total = parseFloat(pedido.total) || 0;

                ventasPorDia[dia].total += total;
                ventasPorDia[dia].count += 1;
            } catch (e) { }
        });

        // Calcular promedio de ventas diarias
        let totalVentas = 0;
        let diasConVentas = 0;

        Object.values(ventasPorDia).forEach(dia => {
            if (dia.count > 0) {
                totalVentas += dia.total;
                diasConVentas++;
            }
        });

        const promedioVentas = diasConVentas > 0 ? totalVentas / diasConVentas : 0;

        // Calcular porcentajes
        Object.keys(ventasPorDia).forEach(dia => {
            const datos = ventasPorDia[dia];
            if (datos.count > 0 && promedioVentas > 0) {
                datos.promedio = datos.total / datos.count;
                datos.porcentaje = Math.round((datos.total / promedioVentas - 1) * 100);
            } else {
                datos.promedio = 0;
                datos.porcentaje = 0;
            }
        });

        return ventasPorDia;
    }

    /**
     * Obtener mejor día de ventas
     */
    obtenerMejorDia(ventasPorDia) {
        let mejorDia = null;
        let mayorVenta = 0;

        Object.entries(ventasPorDia).forEach(([dia, datos]) => {
            if (datos.total > mayorVenta && datos.count > 0) {
                mayorVenta = datos.total;
                mejorDia = {
                    dia,
                    total: datos.total,
                    count: datos.count,
                    porcentaje: datos.porcentaje
                };
            }
        });

        return mejorDia;
    }

    /**
     * Analizar tendencia de ventas
     */
    analizarTendenciaVentas(pedidos) {
        // Si hay pocos pedidos
        if (pedidos.length < 5) {
            return {
                icono: 'info-circle',
                mensaje: 'No hay suficientes datos para determinar una tendencia clara.',
                valor: 'N/A',
                tipo: 'info'
            };
        }

        // Ordenar pedidos por fecha
        const pedidosOrdenados = [...pedidos].sort(
            (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
        );

        // Fecha más reciente
        const fechaMasReciente = new Date(pedidosOrdenados[pedidosOrdenados.length - 1].fecha_creacion);

        // Períodos de 30 días
        const limite30Dias = new Date(fechaMasReciente);
        limite30Dias.setDate(limite30Dias.getDate() - 30);

        const limite60Dias = new Date(fechaMasReciente);
        limite60Dias.setDate(limite60Dias.getDate() - 60);

        // Filtrar pedidos por período
        const pedidosUltimos30 = pedidosOrdenados.filter(pedido => {
            const fecha = new Date(pedido.fecha_creacion);
            return fecha >= limite30Dias && fecha <= fechaMasReciente;
        });

        const pedidosAnteriores30 = pedidosOrdenados.filter(pedido => {
            const fecha = new Date(pedido.fecha_creacion);
            return fecha >= limite60Dias && fecha < limite30Dias;
        });

        // Calcular totales
        const totalUltimos30 = pedidosUltimos30.reduce(
            (sum, pedido) => sum + (parseFloat(pedido.total) || 0), 0
        );

        const totalAnteriores30 = pedidosAnteriores30.reduce(
            (sum, pedido) => sum + (parseFloat(pedido.total) || 0), 0
        );

        // Calcular cambio porcentual
        let porcentajeCambio = 0;
        let tendencia = '';

        if (totalAnteriores30 > 0) {
            porcentajeCambio = Math.round(((totalUltimos30 - totalAnteriores30) / totalAnteriores30) * 100);
            tendencia = porcentajeCambio >= 0 ? 'más' : 'menos';
        } else if (totalUltimos30 > 0) {
            porcentajeCambio = 100;
            tendencia = 'más';
        }

        // Determinar mensaje y tipo
        let mensaje = '';
        let tipo = 'info';
        let icono = 'chart-line';

        if (porcentajeCambio > 15) {
            mensaje = `¡Excelente! Tus ventas han aumentado un ${Math.abs(porcentajeCambio)}% en los últimos 30 días.`;
            tipo = 'success';
            icono = 'arrow-up';
        } else if (porcentajeCambio > 0) {
            mensaje = `Tus ventas muestran un crecimiento del ${porcentajeCambio}% en los últimos 30 días.`;
            tipo = 'success';
            icono = 'arrow-up';
        } else if (porcentajeCambio === 0) {
            mensaje = 'Tus ventas se mantienen estables respecto al período anterior.';
            tipo = 'info';
            icono = 'minus';
        } else if (porcentajeCambio > -15) {
            mensaje = `Tus ventas han disminuido un ${Math.abs(porcentajeCambio)}% en los últimos 30 días.`;
            tipo = 'warning';
            icono = 'arrow-down';
        } else {
            mensaje = `¡Alerta! Tus ventas han caído un ${Math.abs(porcentajeCambio)}% en los últimos 30 días.`;
            tipo = 'danger';
            icono = 'arrow-down';
        }

        // Si hay pocos datos para comparar
        if (pedidosAnteriores30.length < 3) {
            mensaje += ' (Basado en datos limitados)';
        }

        return {
            icono,
            mensaje,
            valor: porcentajeCambio > 0 ? `+${porcentajeCambio}%` : `${porcentajeCambio}%`,
            tipo,
            tendencia
        };
    }

    /**
     * Analizar horario pico
     */
    analizarHorarioPico(pedidos) {
        // Conteo por hora
        const ventasPorHora = {};
        for (let i = 0; i < 24; i++) {
            ventasPorHora[i] = 0;
        }

        // Contar pedidos por hora
        let totalPedidos = 0;
        pedidos.forEach(pedido => {
            try {
                const fecha = new Date(pedido.fecha_creacion);
                const hora = fecha.getHours();
                ventasPorHora[hora]++;
                totalPedidos++;
            } catch (e) { }
        });

        // Encontrar hora con más pedidos
        let horaMaxima = 0;
        let maxPedidos = 0;

        Object.entries(ventasPorHora).forEach(([hora, cantidad]) => {
            if (cantidad > maxPedidos) {
                maxPedidos = cantidad;
                horaMaxima = parseInt(hora);
            }
        });

        // Rango de horas pico
        const horaInicio = horaMaxima;
        const horaFin = (horaMaxima + 2) % 24;

        // Porcentaje de ventas en ese rango
        const ventasEnRango = ventasPorHora[horaMaxima] + ventasPorHora[(horaMaxima + 1) % 24];
        const porcentaje = totalPedidos > 0 ? Math.round((ventasEnRango / totalPedidos) * 100) : 0;

        // Formatear horas
        const formatHora = (hora) => {
            return `${hora}:00${hora < 12 ? ' AM' : ' PM'}`.replace('0:00 AM', '12:00 AM').replace('12:00 PM', '12:00 PM');
        };

        return {
            inicio: formatHora(horaInicio),
            fin: formatHora(horaFin),
            porcentaje
        };
    }

    /**
     * Obtener producto más vendido
     */
  obtenerProductoMasVendido(pedidos) {
    try {
        // Mapa para contar productos
        const productosVendidos = {};
        let totalProductos = 0;
        let productosValidos = 0;
        
        // Verificar si hay pedidos
        if (!pedidos || pedidos.length === 0) {
            console.warn('⚠️ [Insights]: No hay pedidos para analizar');
            return null;
        }
        
        console.log('🛒 [Insights]: Analizando estructura de pedidos...', {
            totalPedidos: pedidos.length,
            muestraPrimerPedido: pedidos[0]
        });
        
        // Contar ventas por producto - MANEJA MÚLTIPLES FORMATOS
        pedidos.forEach(pedido => {
            try {
                // Intentar diferentes estructuras de datos posibles
                let itemsArr = null;
                
                // Formato 1: pedido.items (array)
                if (pedido.items && Array.isArray(pedido.items) && pedido.items.length > 0) {
                    itemsArr = pedido.items;
                } 
                // Formato 2: pedido.productos (array)
                else if (pedido.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
                    itemsArr = pedido.productos;
                }
                // Formato 3: pedido.detalle (array)
                else if (pedido.detalle && Array.isArray(pedido.detalle) && pedido.detalle.length > 0) {
                    itemsArr = pedido.detalle;
                }
                // Formato 4: pedido.detalle (string JSON)
                else if (pedido.detalle && typeof pedido.detalle === 'string') {
                    try {
                        const detalleObj = JSON.parse(pedido.detalle);
                        if (Array.isArray(detalleObj)) {
                            itemsArr = detalleObj;
                        }
                    } catch (e) {
                        // Error al parsear JSON, ignorar
                    }
                }
                // Formato 5: pedido.carrito
                else if (pedido.carrito) {
                    if (Array.isArray(pedido.carrito)) {
                        itemsArr = pedido.carrito;
                    } else if (typeof pedido.carrito === 'string') {
                        try {
                            const carritoObj = JSON.parse(pedido.carrito);
                            if (Array.isArray(carritoObj)) {
                                itemsArr = carritoObj;
                            } else if (carritoObj.items && Array.isArray(carritoObj.items)) {
                                itemsArr = carritoObj.items;
                            }
                        } catch (e) {
                            // Error al parsear JSON, ignorar
                        }
                    }
                }
                
                // Si no encontramos items en formatos conocidos
                if (!itemsArr) {
                    return; // Saltar este pedido
                }
                
                productosValidos++;
                
                // Procesar los items encontrados
                itemsArr.forEach(item => {
                    if (!item) return; // Saltar item nulo
                    
                    // Intentar diferentes nombres de propiedades
                    const productoId = item.producto_id || item.productoId || item.id_producto || 
                                      item.id || item.idProducto || 'desconocido';
                    const cantidad = parseInt(item.cantidad || item.quantity || item.cantiad || 1);
                    const nombre = item.nombre || item.producto || item.name || 
                                  item.nombreProducto || item.titulo || 'Producto';
                    
                    if (!productosVendidos[productoId]) {
                        productosVendidos[productoId] = {
                            cantidad: 0,
                            nombre: nombre
                        };
                    }
                    
                    productosVendidos[productoId].cantidad += cantidad;
                    totalProductos += cantidad;
                });
                
            } catch (e) {
                console.warn('⚠️ [Insights]: Error procesando pedido:', e);
            }
        });
        
        // Log para depuración
        console.log(`📊 [Insights]: Encontrados ${Object.keys(productosVendidos).length} productos vendidos en ${productosValidos} pedidos válidos`);
        
        // Si no hay productos vendidos, generar datos de demostración
        if (Object.keys(productosVendidos).length === 0) {
            console.warn('⚠️ [Insights]: No se encontraron productos vendidos, generando datos de demostración');
            
            if (window.todosProductos && window.todosProductos.length > 0) {
                // Usar productos disponibles para datos de demostración
                const productosDemoVentas = {};
                let demoTotalVentas = 0;
                
                // Seleccionar hasta 5 productos aleatorios para simular ventas
                const productosMuestra = window.todosProductos.slice(0, Math.min(5, window.todosProductos.length));
                
                productosMuestra.forEach(producto => {
                    const id = producto.$id;
                    const ventas = Math.floor(Math.random() * 20) + 1; // 1-20 unidades
                    
                    productosDemoVentas[id] = {
                        nombre: producto.nombre,
                        cantidad: ventas
                    };
                    
                    demoTotalVentas += ventas;
                });
                
                // Encontrar el producto más vendido simulado
                let maxCantidad = 0;
                let productoMasVendido = null;
                
                Object.entries(productosDemoVentas).forEach(([id, datos]) => {
                    if (datos.cantidad > maxCantidad) {
                        maxCantidad = datos.cantidad;
                        productoMasVendido = {
                            id,
                            nombre: datos.nombre,
                            cantidad: datos.cantidad,
                            porcentaje: Math.round((datos.cantidad / demoTotalVentas) * 100),
                            esDemo: true
                        };
                    }
                });
                
                return productoMasVendido;
            }
            
            return null;
        }
        
        // Encontrar el más vendido
        let maxCantidad = 0;
        let productoMasVendido = null;
        
        Object.entries(productosVendidos).forEach(([id, datos]) => {
            if (datos.cantidad > maxCantidad) {
                maxCantidad = datos.cantidad;
                productoMasVendido = {
                    id,
                    nombre: datos.nombre,
                    cantidad: datos.cantidad,
                    porcentaje: totalProductos > 0 ? Math.round((datos.cantidad / totalProductos) * 100) : 0
                };
            }
        });
        
        return productoMasVendido;
        
    } catch (error) {
        console.error('❌ [Insights]: Error en obtenerProductoMasVendido:', error);
        return null;
    }
}

    /**
     * Obtener categoría más rentable
     */
    obtenerCategoriaMasRentable(pedidos) {
        // Mapa de categorías
        const categorias = {};
        let totalVentas = 0;

        // Sumar ventas por categoría
        pedidos.forEach(pedido => {
            try {
                if (pedido.items && Array.isArray(pedido.items)) {
                    pedido.items.forEach(item => {
                        const categoria = item.categoria || 'Sin categoría';
                        const subtotal = (parseFloat(item.precio) * parseInt(item.cantidad)) || 0;

                        if (!categorias[categoria]) {
                            categorias[categoria] = {
                                total: 0,
                                nombre: categoria
                            };
                        }

                        categorias[categoria].total += subtotal;
                        totalVentas += subtotal;
                    });
                }
            } catch (e) { }
        });

        // Encontrar la más rentable
        let maxTotal = 0;
        let categoriaMasRentable = null;

        Object.values(categorias).forEach(categoria => {
            if (categoria.total > maxTotal) {
                maxTotal = categoria.total;
                categoriaMasRentable = {
                    nombre: categoria.nombre,
                    total: categoria.total,
                    porcentaje: totalVentas > 0 ? Math.round((categoria.total / totalVentas) * 100) : 0
                };
            }
        });

        return categoriaMasRentable;
    }

    // Añade esta función para diagnosticar problemas con los datos
async diagnosticarDatos() {
    try {
        const productos = window.todosProductos || [];
        const pedidos = window.todosPedidos || [];
        
        console.log('🔍 [Insights]: Diagnóstico de datos:');
        console.log(`- Productos disponibles: ${productos.length}`);
        console.log(`- Pedidos disponibles: ${pedidos.length}`);
        
        // Verificar estructura de productos
        if (productos.length > 0) {
            const muestra = productos[0];
            console.log('📦 Estructura de producto:', {
                id: muestra.$id || muestra.id || 'No disponible',
                nombre: muestra.nombre || 'No disponible',
                precio: muestra.precio || 'No disponible',
                stock: muestra.existencia || muestra.stock || 'No disponible'
            });
        }
        
        // Verificar estructura de pedidos
        if (pedidos.length > 0) {
            const muestra = pedidos[0];
            console.log('🛒 Estructura de pedido:', {
                id: muestra.$id || muestra.id || 'No disponible',
                cliente: muestra.nombre_cliente || 'No disponible',
                total: muestra.total || 'No disponible',
                fecha: muestra.fecha_creacion || 'No disponible',
                tieneItems: muestra.items ? `Sí (${muestra.items.length})` : 'No'
            });
            
            // Verificar estructura de items
            if (muestra.items && muestra.items.length > 0) {
                console.log('🧩 Estructura de item:', {
                    producto_id: muestra.items[0].producto_id || 'No disponible',
                    nombre: muestra.items[0].nombre || 'No disponible',
                    precio: muestra.items[0].precio || 'No disponible',
                    cantidad: muestra.items[0].cantidad || 'No disponible'
                });
            }
        }
        
        return {
            productosOK: productos.length > 0,
            pedidosOK: pedidos.length > 0,
            itemsOK: pedidos.length > 0 && pedidos[0].items && pedidos[0].items.length > 0
        };
        
    } catch (error) {
        console.error('❌ [Insights]: Error en diagnóstico:', error);
        return { error: error.message };
    }
}

    /**
     * Obtener producto poco vendido
     */
    obtenerProductoPocoVendido(productos, pedidos) {
        // Solo considerar productos con stock
        const productosConStock = productos.filter(p => {
            const stock = parseInt(p.existencia || p.stock) || 0;
            return stock > 0;
        });

        if (productosConStock.length === 0) {
            return null;
        }

        // Mapa para contar productos vendidos
        const productosVendidos = {};

        // Inicializar con 0 todos los productos
        productosConStock.forEach(producto => {
            productosVendidos[producto.$id] = {
                cantidad: 0,
                nombre: producto.nombre,
                stock: parseInt(producto.existencia || producto.stock) || 0
            };
        });

        // Contar ventas reales
        let totalVentas = 0;
        pedidos.forEach(pedido => {
            try {
                if (pedido.items && Array.isArray(pedido.items)) {
                    pedido.items.forEach(item => {
                        const productoId = item.producto_id;
                        const cantidad = parseInt(item.cantidad) || 1;

                        if (productosVendidos[productoId]) {
                            productosVendidos[productoId].cantidad += cantidad;
                            totalVentas += cantidad;
                        }
                    });
                }
            } catch (e) { }
        });

        // Calcular promedio
        const totalProductos = Object.keys(productosVendidos).length;
        const promedioVentas = totalProductos > 0 ? totalVentas / totalProductos : 0;

        if (promedioVentas === 0) return null;

        // Encontrar el que está por debajo del promedio
        let productoPocoVendido = null;
        let menorPorcentaje = 100;

        Object.entries(productosVendidos).forEach(([id, datos]) => {
            if (datos.stock > 0) {
                const porcentajeDelPromedio = (datos.cantidad / promedioVentas) * 100;

                if (porcentajeDelPromedio < 30 && porcentajeDelPromedio < menorPorcentaje) {
                    menorPorcentaje = porcentajeDelPromedio;
                    productoPocoVendido = {
                        id,
                        nombre: datos.nombre,
                        cantidad: datos.cantidad,
                        porcentaje: Math.round(100 - porcentajeDelPromedio)
                    };
                }
            }
        });

        return productoPocoVendido;
    }

    /**
     * Obtener productos con stock bajo
     */
    obtenerProductosStockBajo(productos) {
        const umbralStockBajo = 5;
        return productos.filter(producto => {
            const stock = parseInt(producto.existencia || producto.stock) || 0;
            return stock > 0 && stock <= umbralStockBajo;
        });
    }

    /**
     * Obtener productos sobreabastecidos
     */
    obtenerProductosSobreStock(productos) {
        const umbralSobreStock = 50;
        return productos.filter(producto => {
            const stock = parseInt(producto.existencia || producto.stock) || 0;
            return stock >= umbralSobreStock;
        });
    }

    /**
     * Calcular valor total del inventario
     */
    calcularValorInventario(productos) {
        return productos.reduce((total, producto) => {
            const precio = parseFloat(producto.precio) || 0;
            const stock = parseInt(producto.existencia || producto.stock) || 0;
            return total + (precio * stock);
        }, 0);
    }

    /**
     * Predecir ventas para el próximo mes
     */
    predecirVentasProximoMes(pedidos) {
        if (pedidos.length < 5) {
            return { valor: 0, porcentaje: 0, tendencia: 'igual' };
        }

        // Ordenar pedidos
        const pedidosOrdenados = [...pedidos].sort(
            (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
        );

        // Fecha más reciente
        const fechaMasReciente = new Date(pedidosOrdenados[pedidosOrdenados.length - 1].fecha_creacion);

        // Calcular meses
        const inicioMesActual = new Date(fechaMasReciente);
        inicioMesActual.setDate(1);

        const inicioMesAnterior = new Date(inicioMesActual);
        inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);

        // Filtrar por mes
        const pedidosMesActual = pedidosOrdenados.filter(pedido => {
            const fecha = new Date(pedido.fecha_creacion);
            return fecha >= inicioMesActual && fecha <= fechaMasReciente;
        });

        const pedidosMesAnterior = pedidosOrdenados.filter(pedido => {
            const fecha = new Date(pedido.fecha_creacion);
            return fecha >= inicioMesAnterior && fecha < inicioMesActual;
        });

        // Calcular ventas por mes
        const ventasMesActual = pedidosMesActual.reduce(
            (sum, pedido) => sum + (parseFloat(pedido.total) || 0), 0
        );

        const ventasMesAnterior = pedidosMesAnterior.reduce(
            (sum, pedido) => sum + (parseFloat(pedido.total) || 0), 0
        );

        // Calcular tasa de crecimiento
        let tasaCrecimiento = 0;
        if (ventasMesAnterior > 0) {
            tasaCrecimiento = (ventasMesActual / ventasMesAnterior) - 1;
        }

        // Factor de corrección para ser conservador
        const factorCorreccion = 0.7;

        // Predecir próximo mes
        let ventasProximoMes = ventasMesActual;
        if (ventasMesActual > 0) {
            ventasProximoMes = ventasMesActual * (1 + (tasaCrecimiento * factorCorreccion));
        }

        // Calcular porcentaje para mostrar
        const porcentajeCambio = Math.round(Math.abs(tasaCrecimiento * 100));
        const tendencia = tasaCrecimiento >= 0 ? 'más' : 'menos';

        return {
            valor: ventasProximoMes,
            porcentaje: porcentajeCambio,
            tendencia
        };
    }

    /**
     * Obtener recomendaciones para promociones
     */
    obtenerRecomendacionesPromociones(productos, pedidos) {
        const productosConStock = productos.filter(p => {
            const stock = parseInt(p.existencia || p.stock) || 0;
            return stock > 0;
        });

        if (productosConStock.length === 0) {
            return {
                mensaje: 'No hay suficientes datos para generar recomendaciones promocionales.'
            };
        }

        // Simplificado: recomendar promocionar productos similares al más vendido
        const masVendido = this.obtenerProductoMasVendido(pedidos);
        if (masVendido) {
            return {
                mensaje: `Considera crear un bundle promocional con "${masVendido.nombre}" y productos complementarios para aumentar el valor del ticket promedio.`
            };
        }

        return {
            mensaje: 'Considera promocionar productos de categorías similares para impulsar ventas cruzadas.'
        };
    }

    /**
     * Predecir productos más vendidos
     */
    predecirProductosMasVendidos(pedidos) {
        const productoMasVendido = this.obtenerProductoMasVendido(pedidos);

        if (!productoMasVendido) {
            return { nombre: 'Sin datos suficientes' };
        }

        return { nombre: productoMasVendido.nombre };
    }
}

// Crear instancia global
const insightsSystem = new InsightsSystem();

// Función para actualizar insights (expuesta globalmente)

window.refreshInsights = async function () {
    try {
        console.log('🔄 [Insights]: Actualizando insights manualmente...');
        await insightsSystem.refreshInsights();

        // Solución: Verificar si la función existe antes de llamarla
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion('Insights actualizados correctamente', 'success');
        } else {
            // Alternativa si no existe la función
            console.log('✅ [Insights]: Insights actualizados correctamente');

            // Crear notificación temporal
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
            notification.style.zIndex = '9999';
            notification.style.transition = 'opacity 0.3s ease';
            notification.style.opacity = '0';
            notification.innerHTML = '<i class="fas fa-check-circle"></i> Insights actualizados correctamente';

            document.body.appendChild(notification);
            setTimeout(() => notification.style.opacity = '1', 10);
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

    } catch (error) {
        console.error('❌ [Insights]: Error actualizando insights:', error);

        // Misma verificación para el error
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion('Error actualizando insights', 'error');
        } else {
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#F44336';
            notification.style.color = 'white';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
            notification.style.zIndex = '9999';
            notification.style.transition = 'opacity 0.3s ease';
            notification.style.opacity = '0';
            notification.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error actualizando insights';

            document.body.appendChild(notification);
            setTimeout(() => notification.style.opacity = '1', 10);
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
};

// Funciones para acciones de insights
window.mostrarDetallesStockBajo = function () {
    const stockBajo = insightsSystem.obtenerProductosStockBajo(window.todosProductos || []);

    if (!stockBajo || stockBajo.length === 0) {
        mostrarNotificacion('No hay productos con stock bajo', 'info');
        return;
    }

    let mensaje = '<ul style="padding-left: 20px; margin: 10px 0;">';
    stockBajo.forEach(producto => {
        mensaje += `<li><b>${producto.nombre}</b>: ${producto.existencia || producto.stock} unidades</li>`;
    });
    mensaje += '</ul>';

    mostrarAlertaDetalles('Productos con Stock Bajo', mensaje);
};

window.mostrarDetallesRecomendaciones = function () {
    const recomendaciones = [
        'Considera combinar productos similares en paquetes promocionales',
        'Ofrece descuentos por volumen para los productos con mayor rotación',
        'Implementa un programa de fidelización para clientes frecuentes',
        'Utiliza email marketing para promocionar productos con baja rotación',
        'Realiza una campaña de descuentos temporales para productos estacionales'
    ];

    let mensaje = '<ul style="padding-left: 20px; margin: 10px 0;">';
    recomendaciones.forEach(rec => {
        mensaje += `<li>${rec}</li>`;
    });
    mensaje += '</ul>';

    mostrarAlertaDetalles('Recomendaciones Promocionales', mensaje);
};

// Función auxiliar para mostrar alertas con detalles
function mostrarAlertaDetalles(titulo, contenidoHTML) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="close-btn" onclick="this.parentNode.parentNode.parentNode.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${contenidoHTML}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.parentNode.parentNode.parentNode.remove()">
                    Cerrar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

// Inicializar insights cuando se cargue la página (si estamos en dashboard)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (document.getElementById('ventas-insights')) {
            console.log('📊 [Insights]: Detectada página de dashboard, inicializando insights...');
            await insightsSystem.initialize();
        }
    }, 1000); // Esperar 1 segundo para asegurar que los datos estén cargados
});

// Al final del archivo

// Inicializar insights cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que se haya cargado el dashboard
    setTimeout(async () => {
        if (document.getElementById('ventas-insights')) {
            console.log('📊 [Insights]: Detectada página de dashboard, inicializando insights...');

            // Asegurarnos de que tengamos datos antes de inicializar
            if (!window.todosPedidos || window.todosPedidos.length === 0) {
                console.warn('⚠️ [Insights]: Esperando datos de pedidos...');
            }

            if (!window.todosProductos || window.todosProductos.length === 0) {
                console.warn('⚠️ [Insights]: Esperando datos de productos...');
            }

            await insightsSystem.initialize();
        }
    }, 1500); // Aumentar el tiempo de espera para asegurar que los datos estén cargados
});

// Exportar sistema para uso global
window.insightsSystem = insightsSystem;

// Exportar instancia para uso en otros módulos
export default insightsSystem;