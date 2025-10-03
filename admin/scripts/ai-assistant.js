/**
 * Sistema de Asistente IA con DeepSeek API
 */
import { marked } from 'marked';

class AIAssistant {
    constructor() {
        this.apiKey = null;
        this.isProcessing = false;
        this.conversationHistory = [];
        this.initialize();
    }

    async initialize() {
        console.log('🤖 Inicializando Asistente IA ...');

        // Cargar API key de OpenRouter
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

        if (!this.apiKey) {
            console.error('❌ API Key de OpenRouter no encontrada');
            this.showMessage('❌ Error: API Key de OpenRouter no configurada. Configura VITE_OPENROUTER_API_KEY en tu .env', 'ai');
            return;
        }

        console.log('🔑 OpenRouter API Key configurada correctamente');

        await this.loadData();
        this.setupEventListeners();
        console.log('✅ Asistente IA listo con OpenRouter + DeepSeek');
    }

    async loadData() {
        try {
            // Cargar datos completos
            const productosModule = await import('../../scripts/services/productos.js');
            const pedidosModule = await import('../../scripts/services/pedidos.js');

            // Obtener productos con todos sus detalles
            const productosResponse = await productosModule.ProductoService.getAllProducts();
            window.todosProductos = productosResponse.documents || [];

            // Obtener pedidos con todos sus detalles
            window.todosPedidos = await pedidosModule.pedidosService.obtenerTodosPedidos();

            // Obtener detalles completos de cada pedido desde detalle_venta
            window.detallesPedidos = [];
            for (const pedido of window.todosPedidos) {
                try {
                    const detalles = await pedidosModule.pedidosService.obtenerDetallesPedido(pedido.$id);
                    window.detallesPedidos.push({
                        pedidoId: pedido.$id,
                        detalles: detalles || [] // Asegurar que sea array
                    });
                } catch (error) {
                    console.warn(`No se pudieron cargar detalles para pedido ${pedido.$id}`, error);
                    // Agregar entrada vacía para mantener consistencia
                    window.detallesPedidos.push({
                        pedidoId: pedido.$id,
                        detalles: []
                    });
                }
            }

            console.log(`📊 Datos cargados: ${window.todosProductos.length} productos, ${window.todosPedidos.length} pedidos, ${window.detallesPedidos.length} detalles`);
        } catch (error) {
            console.error('Error cargando datos completos:', error);
        }
    }

    setupEventListeners() {
        // Enter para enviar mensaje
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.sendQuery();
            }
        });
    }

    async sendQuery() {
        const input = document.getElementById('chat-input');
        const query = input.value.trim();

        if (!query || this.isProcessing) return;

        if (!this.apiKey) {
            this.showMessage('❌ API Key no configurada. No se pueden procesar consultas.', 'ai');
            return;
        }

        // Mostrar mensaje del usuario
        this.showMessage(query, 'user');
        input.value = '';

        // Procesar con IA
        await this.processQuery(query);
    }

    async processQuery(query) {
        this.isProcessing = true;
        this.showLoadingModal(true);

        try {
            // Preparar datos completos para análisis
            const dataContext = this.prepareDataContext();

            // ✅ DETECTAR TIPO DE CONSULTA ANTES DE LLAMAR A LA API
            const queryType = this.analyzeQueryType(query);
            console.log('🔍 Tipo de consulta detectado:', queryType);

            // ✅ CORREGIR: Pasar el tipo detectado
            const response = await this.callOpenRouter(query, dataContext, queryType);

            // Detectar si la respuesta incluye solicitud de gráfico
            const shouldShowChart = response.text.includes('[CHART');
            console.log('📊 ¿Debe mostrar gráfica?:', shouldShowChart);

            // Mostrar respuesta
            this.showMessage(response.text.replace(/\[CHART[:\]].*?\]/g, ''), 'ai');

            // Solo crear gráficas si se solicitaron específicamente
            if (shouldShowChart) {
                const chartType = this.detectChartType(query, response.text);
                console.log('📈 Tipo de gráfica detectado:', chartType);

                if (chartType) {
                    const chartData = this.generateChartDataForQuery(chartType);
                    this.generateChart(chartData);
                }
            }

        } catch (error) {
            console.error('Error procesando consulta:', error);
            this.showMessage('❌ Error analizando los datos: ' + error.message, 'ai');
        } finally {
            this.isProcessing = false;
            this.showLoadingModal(false);
        }
    }

    prepareDataContext() {
        const productos = window.todosProductos || [];
        const pedidos = window.todosPedidos || [];
        const detallesPedidos = window.detallesPedidos || [];

        // Extraer datos relevantes para análisis
        const ventasPorProducto = this.calcularVentasPorProducto();
        const ventasPorCategoria = this.calcularVentasPorCategoria();
        const ventasMensuales = this.calcularVentasMensuales();
        const productosStock = this.analizarStock();
        const estadosPedidos = this.calcularEstadosPedidos();
        const ventasMesActual = this.calcularVentasMesActual();
        const topClientes = this.calcularTopClientes(); // ✅ AGREGAR

        return {
            resumen: {
                total_productos: productos.length,
                total_pedidos: pedidos.length,
                ventas_totales: pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0),
                ventas_hoy: this.calculateTodaysSales(),
                categorias: [...new Set(productos.map(p => p.categoria))]
            },
            productos: productos.map(p => ({
                id: p.$id,
                nombre: p.nombre,
                precio: p.precio,
                categoria: p.categoria,
                stock: p.existencia || 0
            })),
            pedidos_recientes: pedidos.slice(0, 15).map(p => ({
                id: p.$id,
                fecha: new Date(p.fecha_creacion).toLocaleDateString(),
                cliente: p.usuario_nombre,
                total: p.total,
                estado: p.estado
            })),
            analisis: {
                ventas_por_producto: ventasPorProducto,
                ventas_por_categoria: ventasPorCategoria,
                ventas_mensuales: ventasMensuales,
                stock: productosStock,
                estados_pedidos: estadosPedidos,
                ventas_mes_actual: ventasMesActual,
                top_clientes: topClientes // ✅ AGREGAR
            }
        };
    }

    // ✅ AGREGAR NUEVA FUNCIÓN
    calcularEstadosPedidos() {
        const pedidos = window.todosPedidos || [];
        const estados = {};

        pedidos.forEach(pedido => {
            const estado = pedido.estado || 'pendiente';
            if (!estados[estado]) {
                estados[estado] = 0;
            }
            estados[estado]++;
        });

        return estados;
    }


    calcularVentasMesActual() {
        const detallesPedidos = window.detallesPedidos || [];
        const ventasMesActual = {};
        const ahora = new Date();
        const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

        detallesPedidos.forEach(detallePedido => {
            // Necesitamos la fecha del pedido para filtrar por mes actual
            const pedidoRelacionado = window.todosPedidos.find(p => p.$id === detallePedido.pedidoId);
            if (!pedidoRelacionado) return;

            const fechaPedido = new Date(pedidoRelacionado.fecha_creacion || pedidoRelacionado.$createdAt);
            const mesPedido = `${fechaPedido.getFullYear()}-${String(fechaPedido.getMonth() + 1).padStart(2, '0')}`;

            // Solo procesar pedidos del mes actual
            if (mesPedido !== mesActual) return;

            if (detallePedido.detalles && Array.isArray(detallePedido.detalles)) {
                detallePedido.detalles.forEach(item => {
                    const nombreProducto = item.producto_nombre || item.nombre || item.producto || 'Producto desconocido';
                    const cantidad = parseInt(item.cantidad || item.qty || 1);
                    const precio = parseFloat(item.precio || item.price || 0);

                    if (!ventasMesActual[nombreProducto]) {
                        ventasMesActual[nombreProducto] = { cantidad: 0, ingresos: 0 };
                    }

                    ventasMesActual[nombreProducto].cantidad += cantidad;
                    ventasMesActual[nombreProducto].ingresos += precio * cantidad;
                });
            }
        });

        return ventasMesActual;
    }

    // Agregar después de calcularVentasMesActual()
    calcularTopClientes() {
        const pedidos = window.todosPedidos || [];
        const clientes = {};

        pedidos.forEach(pedido => {
            const cliente = pedido.usuario_nombre || pedido.usuario || 'Cliente desconocido';
            if (!clientes[cliente]) {
                clientes[cliente] = { pedidos: 0, total: 0 };
            }
            clientes[cliente].pedidos += 1;
            clientes[cliente].total += parseFloat(pedido.total || 0);
        });

        return clientes;
    }

    calcularVentasPorProducto() {
        const detallesPedidos = window.detallesPedidos || [];
        const ventasPorProducto = {};

        detallesPedidos.forEach(detallePedido => {
            if (detallePedido.detalles && Array.isArray(detallePedido.detalles)) {
                detallePedido.detalles.forEach(item => {
                    // Buscar en diferentes campos posibles de detalle_venta
                    const nombreProducto = item.producto_nombre || item.nombre || item.producto || 'Producto desconocido';
                    const cantidad = parseInt(item.cantidad || item.qty || 1);
                    const precio = parseFloat(item.precio || item.price || 0);

                    if (!ventasPorProducto[nombreProducto]) {
                        ventasPorProducto[nombreProducto] = { cantidad: 0, ingresos: 0 };
                    }

                    ventasPorProducto[nombreProducto].cantidad += cantidad;
                    ventasPorProducto[nombreProducto].ingresos += precio * cantidad;
                });
            }
        });

        return ventasPorProducto;
    }

    calcularVentasPorCategoria() {
        const productos = window.todosProductos || [];
        const ventasPorProducto = this.calcularVentasPorProducto();
        const ventasPorCategoria = {};

        productos.forEach(producto => {
            const categoria = producto.categoria || 'Sin categoría';
            const ventasProducto = ventasPorProducto[producto.nombre] || { cantidad: 0, ingresos: 0 };

            if (!ventasPorCategoria[categoria]) {
                ventasPorCategoria[categoria] = { cantidad: 0, ingresos: 0 };
            }

            ventasPorCategoria[categoria].cantidad += ventasProducto.cantidad;
            ventasPorCategoria[categoria].ingresos += ventasProducto.ingresos;
        });

        return ventasPorCategoria;
    }

    calcularVentasMensuales() {
        const pedidos = window.todosPedidos || [];
        const ventasMensuales = {};

        console.log('📊 Calculando ventas mensuales con', pedidos.length, 'pedidos');

        pedidos.forEach((pedido, index) => {
            try {
                const fechaRaw = pedido.fecha_creacion || pedido.$createdAt;
                const fecha = new Date(fechaRaw);

                // Verificar que la fecha sea válida
                if (isNaN(fecha.getTime())) {
                    console.warn(`⚠️ Pedido ${index} tiene fecha inválida:`, fechaRaw);
                    return;
                }

                // Formato consistente: "septiembre-2025"
                const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                const mesDisplay = fecha.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });

                if (!ventasMensuales[mesKey]) {
                    ventasMensuales[mesKey] = {
                        cantidad: 0,
                        ingresos: 0,
                        display: mesDisplay,
                        fechas: [] // Para debug
                    };
                }

                ventasMensuales[mesKey].cantidad += 1;
                ventasMensuales[mesKey].ingresos += parseFloat(pedido.total || 0);
                ventasMensuales[mesKey].fechas.push(fecha.toLocaleDateString()); // Debug

            } catch (error) {
                console.error(`❌ Error procesando pedido ${index}:`, error);
            }
        });

        console.log('📊 Resultado ventas mensuales:', ventasMensuales);
        return ventasMensuales;
    }

    analizarStock() {
        const productos = window.todosProductos || [];
        const analisisStock = {
            total_productos: productos.length,
            sin_stock: 0,
            stock_bajo: 0,
            stock_medio: 0,
            stock_alto: 0,
            productos_sin_stock: [],
            productos_stock_bajo: []
        };

        productos.forEach(producto => {
            const stock = parseInt(producto.existencia || 0);

            if (stock === 0) {
                analisisStock.sin_stock++;
                analisisStock.productos_sin_stock.push(producto.nombre);
            } else if (stock <= 5) {
                analisisStock.stock_bajo++;
                analisisStock.productos_stock_bajo.push({
                    nombre: producto.nombre,
                    stock: stock,
                    categoria: producto.categoria
                });
            } else if (stock <= 15) {
                analisisStock.stock_medio++;
            } else {
                analisisStock.stock_alto++;
            }
        });

        return analisisStock;
    }

    detectChartType(query, response) {
        const queryLower = query.toLowerCase();
        const responseLower = response.toLowerCase();

        // ✅ PRIORIDAD MÁXIMA: Condiciones ESPECÍFICAS del QUERY (antes que todo)
        if (queryLower.includes('ventas por mes') || queryLower.includes('ventas mensuales') ||
            queryLower.includes('tendencia') || queryLower.includes('evolución')) {
            return 'monthly-sales';
        }

        if (queryLower.includes('poco stock') || queryLower.includes('bajo stock') ||
            queryLower.includes('stock bajo')) {
            return 'low-stock';
        }

        if (queryLower.includes('más vendido') || queryLower.includes('top productos') ||
            queryLower.includes('productos populares')) {
            return 'top-products';
        }

        if (queryLower.includes('estado pedidos') || queryLower.includes('pedidos por estado')) {
            return 'order-status';
        }

        if (queryLower.includes('categoría') || queryLower.includes('distribución') ||
            queryLower.includes('productos por categoría')) {
            return 'product-categories';
        }

        // ✅ PRIORIDAD 2: Instrucciones específicas de gráfico en la respuesta de la IA
        const chartMatch = response.match(/\[CHART:(.*?)\]/);
        if (chartMatch && chartMatch[1]) {
            return chartMatch[1].trim().toLowerCase();
        }

        // ✅ PRIORIDAD 3: Detección por respuesta de la IA
        if (responseLower.includes('gráfica de barras') || responseLower.includes('barras')) {
            return 'barras';
        }

        if (responseLower.includes('gráfica circular') || responseLower.includes('circular') ||
            responseLower.includes('pastel') || responseLower.includes('dona')) {
            return 'circular';
        }

        if (responseLower.includes('gráfica de línea') || responseLower.includes('línea')) {
            return 'linea';
        }

        // ✅ PRIORIDAD 4: Condiciones GENÉRICAS (solo si no hay nada específico)
        if (queryLower.includes('gráfica') || queryLower.includes('gráfico') ||
            queryLower.includes('visualiza') || queryLower.includes('muestra')) {
            return 'barras'; // tipo predeterminado
        }

        return null; // No se solicitó gráfico
    }

    analyzeQueryType(query) {
        const lowerQuery = query.toLowerCase();

        // ✅ AGREGAR DETECCIÓN DE RECOMENDACIONES
        if (lowerQuery.includes('recomendacion') || lowerQuery.includes('recomienda') ||
            lowerQuery.includes('sugerencia') || lowerQuery.includes('mejora') ||
            lowerQuery.includes('mejorar') || lowerQuery.includes('optimizar')) {
            return 'recommendations';
        }

        if (lowerQuery.includes('tendencia') || lowerQuery.includes('analisis') ||
            lowerQuery.includes('comparar') || lowerQuery.includes('comparación')) {
            return 'analysis';
        }

        // Consultas específicas de stock/inventario
        if (lowerQuery.includes('poco stock') || lowerQuery.includes('sin stock') ||
            lowerQuery.includes('bajo stock') || lowerQuery.includes('stock bajo')) {
            return 'low-stock';
        }

        if (lowerQuery.includes('más vendido') || lowerQuery.includes('top productos') ||
            lowerQuery.includes('mejores productos') || lowerQuery.includes('productos populares')) {
            return 'top-products';
        }

        if (lowerQuery.includes('más rentable') || lowerQuery.includes('rentable') ||
            lowerQuery.includes('ganancia') || lowerQuery.includes('beneficio')) {
            return 'profitable-products';
        }

        if (lowerQuery.includes('top cliente') || lowerQuery.includes('mejor cliente') ||
            lowerQuery.includes('cliente frecuente') || lowerQuery.includes('clientes activos')) {
            return 'top-clients';
        }

        if (lowerQuery.includes('ventas por mes') || lowerQuery.includes('ventas mensuales')) {
            return 'monthly-sales';
        }

        // ✅ MEJORAR DETECCIÓN DE ESTADOS DE PEDIDOS
        if (lowerQuery.includes('estado') && lowerQuery.includes('pedido') ||
            lowerQuery.includes('pedidos') && lowerQuery.includes('estado') ||
            lowerQuery.includes('resumen') && lowerQuery.includes('pedido')) {
            return 'order-status';
        }

        if (lowerQuery.includes('categorías') && (lowerQuery.includes('productos') || lowerQuery.includes('inventario'))) {
            return 'product-categories';
        }

        // Detección genérica de gráficas
        if (lowerQuery.includes('gráfica') || lowerQuery.includes('grafico') ||
            lowerQuery.includes('chart') || lowerQuery.includes('muestra')) {
            return 'chart';
        }

        if (lowerQuery.includes('ventas') || lowerQuery.includes('ingresos')) {
            return 'sales';
        }

        if (lowerQuery.includes('producto') || lowerQuery.includes('stock') ||
            lowerQuery.includes('inventario')) {
            return 'products';
        }

        if (lowerQuery.includes('cliente') || lowerQuery.includes('pedido')) {
            return 'orders';
        }

        return 'general';
    }

    async callOpenRouter(query, context, queryType) {
        const systemPrompt = this.generateSystemPrompt(context, queryType);

        // OpenRouter API endpoint con modelo DeepSeek gratuito
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin, // Usar dominio actual
                'X-Title': 'AetherCubix AI Assistant' // Nombre de tu app
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat', // Modelo gratuito de DeepSeek en OpenRouter
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API Error:', errorData);
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Procesar respuesta para extraer datos de gráfica si es necesario
        return this.processAIResponse(aiResponse, queryType);
    }

    generateSystemPrompt(context, queryType = 'general') {
        // Calcular estadísticas de precios
        const precios = context.productos.map(p => parseFloat(p.precio || 0)).filter(p => p > 0);
        const precioPromedio = precios.length > 0 ? (precios.reduce((a, b) => a + b, 0) / precios.length).toFixed(2) : 0;
        const precioMin = precios.length > 0 ? Math.min(...precios).toFixed(2) : 0;
        const precioMax = precios.length > 0 ? Math.max(...precios).toFixed(2) : 0;

        // Agregar información de ventas del mes actual
        const ventasMesActual = context.analisis.ventas_mes_actual;
        const productosMasVendidosMes = Object.entries(ventasMesActual)
            .sort(([, a], [, b]) => b.cantidad - a.cantidad)
            .slice(0, 5);

        // Agregar información de productos rentables
        const productosMasRentables = Object.entries(context.analisis.ventas_por_producto)
            .sort(([, a], [, b]) => b.ingresos - a.ingresos)
            .slice(0, 5);

        // Agregar información de top clientes
        const topClientes = Object.entries(context.analisis.top_clientes)
            .sort(([, a], [, b]) => b.pedidos - a.pedidos)
            .slice(0, 5);

        return `Eres un asistente analítico especializado en datos para AetherCubix, una tienda de cubos Rubik en Guatemala.

DATOS DISPONIBLES PARA ANÁLISIS:
• ${context.resumen.total_productos} productos en inventario
• ${context.resumen.total_pedidos} pedidos procesados  
• Q${context.resumen.ventas_totales.toFixed(2)} en ventas totales
• Q${context.resumen.ventas_hoy} en ventas de hoy
• Categorías: ${context.resumen.categorias.join(', ')}

INFORMACIÓN COMPLETA DE PRODUCTOS:
• Precio promedio: Q${precioPromedio}
• Precio más bajo: Q${precioMin}
• Precio más alto: Q${precioMax}
• Tienes acceso a los precios de TODOS los ${context.productos.length} productos
• Ejemplos de productos: ${context.productos.slice(0, 5).map(p => `${p.nombre}: Q${p.precio}`).join(', ')}

ANÁLISIS COMPLETO DISPONIBLE:
- Ventas por mes: ${Object.keys(context.analisis.ventas_mensuales).map(key => {
            const data = context.analisis.ventas_mensuales[key];
            return `${data.display}: ${data.cantidad} pedidos, Q${data.ingresos.toFixed(2)}`;
        }).join(' | ')}
- Ventas por producto: ${Object.keys(context.analisis.ventas_por_producto).length} productos con datos de venta
- Productos más vendidos este mes: ${productosMasVendidosMes.length > 0 ?
                productosMasVendidosMes.map(([nombre, data]) => `${nombre}: ${data.cantidad} unidades`).join(', ') :
                'No hay ventas registradas este mes'}
- Productos más rentables: ${productosMasRentables.length > 0 ?
                productosMasRentables.map(([nombre, data]) => `${nombre}: Q${data.ingresos.toFixed(2)}`).join(', ') :
                'No hay datos de rentabilidad'}
- Top clientes: ${topClientes.length > 0 ?
                topClientes.map(([nombre, data]) => `${nombre}: ${data.pedidos} pedidos, Q${data.total.toFixed(2)}`).join(', ') :
                'No hay datos de clientes'}
- Ventas por categoría: ${Object.keys(context.analisis.ventas_por_categoria).length} categorías analizadas  
- Estado del inventario: ${context.analisis.stock.sin_stock} sin stock, ${context.analisis.stock.stock_bajo} con stock bajo
- Estados de pedidos: ${Object.entries(context.analisis.estados_pedidos).map(([estado, cantidad]) => `${estado}: ${cantidad}`).join(', ')}

INSTRUCCIONES ESPECÍFICAS:
1. Para consultas sobre PRECIOS, usa la información completa de productos disponible
2. Para consultas sobre CANTIDADES TOTALES (cuántos, total, etc.), usa SIEMPRE los datos de análisis agregado
3. Para consultas sobre VENTAS POR MES, usa el análisis de "Ventas por mes" que incluye totales por período
4. Para consultas sobre VENTAS DEL MES ACTUAL, usa "Productos más vendidos este mes"
5. Para consultas sobre PRODUCTOS MÁS RENTABLES, usa "Productos más rentables"
6. Para consultas sobre TOP CLIENTES, usa "Top clientes"
7. Para consultas sobre ESTADOS DE PEDIDOS, usa la información de "Estados de pedidos" disponible
8. ✅ PROPORCIONA RECOMENDACIONES ÚTILES basadas en los patrones identificados en los datos
9. ✅ SUGIERE MEJORAS PARA EL NEGOCIO cuando identifiques oportunidades o problemas
10. ✅ ANALIZA TENDENCIAS Y PATRONES para dar insights accionables
11. ✅ IDENTIFICA OPORTUNIDADES de crecimiento, productos estrella, o áreas de mejora
12. ✅ ESTRUCTURA tus respuestas en secciones claras: Análisis → Insights → Recomendaciones
13. ✅ Mantén las respuestas concisas pero completas - enfócate en los insights más importantes
14. Analiza los datos reales proporcionados para responder cualquier pregunta
15. Usa números y estadísticas concretas de los datos disponibles
16. Si necesitas mostrar una gráfica específica, incluye [CHART:tipo] (barras, linea, circular)
17. Responde en español profesional pero amigable  
18. Usa formato Q para quetzales guatemaltecos
19. Si necesitas más datos específicos, indícalo claramente

TIPO DE CONSULTA: ${queryType}
OBJETIVO: Proporcionar análisis profundos, útiles y recomendaciones accionables basados en los datos reales de AetherCubix.`;
    }

    processAIResponse(response, queryType) {
        const shouldGenerateChart = response.includes('[CHART]') ||
            queryType === 'chart';

        let chartData = null;
        if (shouldGenerateChart) {
            chartData = this.generateChartDataForQuery(queryType);
        }

        return {
            text: response.replace('[CHART]', '').trim(),
            chartData: chartData
        };
    }

    generateChartDataForQuery(chartType) {
        console.log('🎯 Generando gráfica para tipo:', chartType);

        switch (chartType) {
            case 'monthly-sales':
                return this.getSalesChartData(); // ✅ Ahora usa barras
            case 'linea':
                return this.getSalesChartData(); // Mantener línea si se solicita específicamente
            case 'low-stock':
            case 'barras':
                return this.getLowStockChartData();
            case 'top-products':
                return this.getTopProductsChartData();
            case 'order-status':
                return this.getOrdersChartData();
            case 'product-categories':
            case 'circular':
                return this.getProductsChartData();
            default:
                console.log('⚠️ Tipo de gráfica no reconocido:', chartType);
                return this.getSalesChartData();
        }
    }

    getSalesChartData() {
        const pedidos = window.todosPedidos || [];
        const ventasPorMes = {};

        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.fecha_creacion || pedido.$createdAt);
            // Usar formato YYYY-MM para ordenar correctamente
            const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const mesDisplay = fecha.toLocaleDateString('es-GT', { month: 'short', year: 'numeric' });

            if (!ventasPorMes[mesKey]) {
                ventasPorMes[mesKey] = {
                    total: 0,
                    display: mesDisplay
                };
            }
            ventasPorMes[mesKey].total += parseFloat(pedido.total || 0);
        });

        // Ordenar por mes cronológicamente
        const mesesOrdenados = Object.keys(ventasPorMes).sort();

        return {
            type: 'bar', // ✅ Cambiar a barras para mejor visualización
            title: 'Ventas Mensuales - AetherCubix',
            labels: mesesOrdenados.map(key => ventasPorMes[key].display),
            data: mesesOrdenados.map(key => ventasPorMes[key].total)
        };
    }

    getProductsChartData() {
        const productos = window.todosProductos || [];
        const categorias = {};

        productos.forEach(producto => {
            const categoria = producto.categoria || 'Sin categoría';
            if (!categorias[categoria]) {
                categorias[categoria] = 0;
            }
            categorias[categoria]++;
        });

        return {
            type: 'doughnut',
            title: 'Distribución de Productos por Categoría',
            labels: Object.keys(categorias),
            data: Object.values(categorias)
        };
    }

    getOrdersChartData() {
        const pedidos = window.todosPedidos || [];
        const estados = {};

        pedidos.forEach(pedido => {
            const estado = pedido.estado || 'pendiente';
            if (!estados[estado]) {
                estados[estado] = 0;
            }
            estados[estado]++;
        });

        return {
            type: 'bar',
            title: 'Estado de Pedidos',
            labels: Object.keys(estados),
            data: Object.values(estados)
        };
    }

    getLowStockChartData() {
        const productos = window.todosProductos || [];
        const stockBajo = {};

        productos.forEach(producto => {
            const stock = parseInt(producto.existencia || 0); // ✅ Usar campo real 'existencia'
            if (stock <= 5) { // Consideramos stock bajo si es <= 5
                const categoria = producto.categoria || 'Sin categoría';
                if (!stockBajo[categoria]) {
                    stockBajo[categoria] = 0;
                }
                stockBajo[categoria]++;
            }
        });

        // Validar si hay datos
        if (Object.keys(stockBajo).length === 0) {
            return {
                type: 'bar',
                title: 'Productos con Poco Stock por Categoría',
                labels: ['Sin datos'],
                data: [0],
                isEmpty: true
            };
        }

        return {
            type: 'bar',
            title: 'Productos con Poco Stock por Categoría',
            labels: Object.keys(stockBajo),
            data: Object.values(stockBajo)
        };
    }

    // ✅ VERSIÓN MEJORADA CON DETALLE_VENTA
    getTopProductsChartData() {
        const detallesPedidos = window.detallesPedidos || [];
        const ventasPorProducto = {};

        // Usar datos reales de detalle_venta
        detallesPedidos.forEach(detallePedido => {
            if (detallePedido.detalles && Array.isArray(detallePedido.detalles)) {
                detallePedido.detalles.forEach(item => {
                    // Buscar en campos de detalle_venta
                    const nombreProducto = item.producto_nombre || item.nombre || item.producto || 'Producto desconocido';
                    const cantidad = parseInt(item.cantidad || item.qty || 1);

                    if (!ventasPorProducto[nombreProducto]) {
                        ventasPorProducto[nombreProducto] = 0;
                    }
                    ventasPorProducto[nombreProducto] += cantidad;
                });
            }
        });

        // Si no hay datos de productos en pedidos, usar datos de productos
        if (Object.keys(ventasPorProducto).length === 0) {
            const productos = window.todosProductos || [];
            productos.slice(0, 5).forEach(producto => {
                const nombre = producto.nombre || producto.name || producto.title || 'Producto';
                ventasPorProducto[nombre] = Math.floor(Math.random() * 50) + 1; // Temporal
            });
        }

        const topProductos = Object.entries(ventasPorProducto)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            type: 'bar',
            title: 'Top 5 Productos Más Vendidos',
            labels: topProductos.map(([nombre]) => nombre.substring(0, 20) + '...'), // Truncar nombres largos
            data: topProductos.map(([, cantidad]) => cantidad)
        };
    }

    generateChart(chartData) {
        const container = document.getElementById('results-container');
        if (!chartData.data || chartData.data.every(val => val === 0)) {
            container.innerHTML = '<div class="no-data-message">No hay datos suficientes para esta gráfica.</div>';
            return;
        }

        const chartId = 'chart-' + Date.now();

        // Limpiar resultados anteriores
        container.innerHTML = '';

        // Crear contenedor para la gráfica
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
        <div class="chart-title">${chartData.title}</div>
        <canvas id="${chartId}" width="400" height="200"></canvas>
    `;

        container.appendChild(chartContainer);

        // Crear gráfica con Chart.js
        const ctx = document.getElementById(chartId).getContext('2d');
        new Chart(ctx, {
            type: chartData.type,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: this.getChartLabel(chartData.type, chartData.title),
                    data: chartData.data,
                    backgroundColor: chartData.type === 'line' ? '#007bff' : [
                        '#007bff', '#28a745', '#dc3545', '#ffc107',
                        '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14',
                        '#20c997', '#fd7e14', '#6610f2', '#e91e63'
                    ],
                    borderColor: chartData.type === 'line' ? '#007bff' : '#fff',
                    borderWidth: chartData.type === 'line' ? 3 : 2,
                    fill: chartData.type === 'line' ? false : true,
                    tension: chartData.type === 'line' ? 0.4 : 0,
                    pointRadius: chartData.type === 'line' ? 6 : 0,
                    pointHoverRadius: chartData.type === 'line' ? 8 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: chartData.type === 'doughnut' ? 'bottom' : 'top'
                    },
                    title: {
                        display: true,
                        text: chartData.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed.y;
                                if (typeof value === 'number') {
                                    const datasetLabel = context.dataset.label;
                                    // Si el label incluye indicadores de moneda, formatear como Q
                                    if (datasetLabel.includes('Q') || datasetLabel.includes('Ventas') ||
                                        datasetLabel.includes('Precio') || datasetLabel.includes('Ingresos')) {
                                        return `Q${value.toFixed(2)}`;
                                    }
                                    // Para cantidades, mostrar como número entero
                                    return value.toString();
                                }
                                return context.formattedValue || context.label;
                            }
                        }
                    }
                },
                scales: chartData.type !== 'doughnut' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                // Formatear eje Y según el tipo de gráfica
                                if (chartData.title.includes('Ventas') || chartData.title.includes('Precio') ||
                                    chartData.title.includes('Ingresos')) {
                                    return 'Q' + value.toFixed(2);
                                }
                                return value;
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                } : {}
            }
        });
    }

    // Agregar después de generateChart
    getChartLabel(type, title) {
        // Devolver label apropiado según el tipo de gráfica
        if (title.includes('Ventas') || title.includes('Precio') || title.includes('Ingresos')) {
            return type === 'line' ? 'Ventas (Q)' : 'Monto (Q)';
        }

        if (title.includes('Estado') || title.includes('Pedidos')) {
            return 'Cantidad de Pedidos';
        }

        if (title.includes('Stock') || title.includes('Productos')) {
            return 'Cantidad';
        }

        if (title.includes('Categoría') || title.includes('Distribución')) {
            return 'Productos';
        }

        // Label por defecto
        return 'Datos';
    }

    calculateTodaysSales() {
        const today = new Date().toDateString();
        const pedidos = window.todosPedidos || [];

        return pedidos
            .filter(pedido => {
                const fechaPedido = new Date(pedido.fecha_creacion || pedido.$createdAt);
                return fechaPedido.toDateString() === today;
            })
            .reduce((total, pedido) => total + parseFloat(pedido.total || 0), 0)
            .toFixed(2);
    }

    showMessage(content, type) {
        const container = document.getElementById('chat-container');

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;

        const avatar = type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        // ✅ Usar Marked para renderizar Markdown
        const renderedContent = type === 'ai' ? marked.parse(content) : content;

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${renderedContent}</div>
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    showLoadingModal(show) {
        const modal = document.getElementById('ai-loading-modal');
        modal.style.display = show ? 'flex' : 'none';

        if (show) {
            const statuses = [
                'Procesando consulta...',
                'Esperando Respuesta...',
                'Analizando datos de AetherCubix...',
                'Generando insights inteligentes...',
                'Creando respuesta personalizada...'
            ];

            let statusIndex = 0;
            const statusElement = document.getElementById('loading-status');

            this.statusInterval = setInterval(() => {
                statusElement.textContent = statuses[statusIndex];
                statusIndex = (statusIndex + 1) % statuses.length;
            }, 1000);
        } else {
            clearInterval(this.statusInterval);
        }
    }
}

// Funciones globales para la interfaz
window.sendQuery = function () {
    window.aiAssistant.sendQuery();
};

window.askExample = function (element) {
    document.getElementById('chat-input').value = element.textContent;
    window.aiAssistant.sendQuery();
};

window.askSuggestion = function (element) {
    document.getElementById('chat-input').value = element.textContent;
    window.aiAssistant.sendQuery();
};

window.clearChat = function () {
    document.getElementById('chat-container').innerHTML = `
        <div class="ai-message welcome">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="message-text">Chat limpiado. ¡Haz una nueva pregunta sobre AetherCubix!</div>
            </div>
        </div>
    `;
};

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});