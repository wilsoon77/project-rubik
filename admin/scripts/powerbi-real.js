/**
 * Funciones simplificadas para exportación a Power BI
 */

/**
 * Exportar a Excel con todas las tablas - Versión corregida
 */
window.exportToExcel = async function () {
    try {
        console.log('Exportando datos a Excel...');
        showNotification('Preparando datos para Excel...', 'info');

        // Cargar datos si es necesario
        await loadDataIfNeeded();

        // Preparar todas las tablas (ahora todas son asíncronas)
        const productosData = prepareProductos();
        const pedidosData = await preparePedidos(); // Esperar a que termine
        const ventasMensualesData = prepareVentasMensuales();
        const categoriasData = prepareCategorias();
        const clientesData = prepareClientes();

        console.log(`Exportando: ${productosData.length} productos, ${pedidosData.length} pedidos, ${ventasMensualesData.length} ventas mensuales, ${categoriasData.length} categorías, ${clientesData.length} clientes`);

        // Cargar ExcelJS
        if (typeof ExcelJS === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js');
        }

        // Crear libro Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AetherCubix';
        workbook.created = new Date();
        workbook.modified = new Date();

        // Crear hojas para cada tabla
        createWorksheet(workbook, 'Productos', productosData);
        createWorksheet(workbook, 'Pedidos', pedidosData);
        createWorksheet(workbook, 'VentasMensuales', ventasMensualesData);
        createWorksheet(workbook, 'Categorias', categoriasData);
        createWorksheet(workbook, 'Clientes', clientesData);

        // Generar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `AetherCubix_PowerBI_${formatDateForFileName(new Date())}.xlsx`);

        showNotification('Archivo Excel exportado correctamente', 'success');

    } catch (error) {
        console.error('Error exportando a Excel:', error);
        showNotification('Error al exportar a Excel: ' + error.message, 'error');
    }
};

/**
 * Exportar a CSV con todas las tablas en un solo archivo - Versión corregida
 */
window.exportToCSV = async function () {
    try {
        console.log('Exportando datos a CSV...');
        showNotification('Preparando datos para CSV...', 'info');

        // Cargar datos si es necesario
        await loadDataIfNeeded();

        // Preparar todas las tablas (esperar a las asíncronas)
        const productosData = prepareProductos();
        const pedidosData = await preparePedidos();
        const ventasMensualesData = prepareVentasMensuales();
        const categoriasData = prepareCategorias();
        const clientesData = prepareClientes();

        console.log(`Exportando: ${productosData.length} productos, ${pedidosData.length} pedidos, ${ventasMensualesData.length} ventas mensuales, ${categoriasData.length} categorías, ${clientesData.length} clientes`);

        // Crear archivo CSV combinado
        exportCombinedCSV({
            productos: productosData,
            pedidos: pedidosData,
            ventas_mensuales: ventasMensualesData,
            categorias: categoriasData,
            clientes: clientesData
        }, `AetherCubix_PowerBI_${formatDateForFileName(new Date())}.csv`);

        showNotification('Archivo CSV exportado correctamente', 'success');

    } catch (error) {
        console.error('Error exportando a CSV:', error);
        showNotification('Error al exportar a CSV: ' + error.message, 'error');
    }
};

/**
 * Crear hoja de Excel
 */
function createWorksheet(workbook, name, data) {
    if (!data || data.length === 0) {
        console.log(`No hay datos para la hoja ${name}`);
        return;
    }

    const sheet = workbook.addWorksheet(name);
    
    // Añadir encabezados
    const headers = Object.keys(data[0]);
    sheet.addRow(headers);
    
    // Dar formato a la fila de encabezados
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Añadir datos
    data.forEach(row => {
        sheet.addRow(Object.values(row));
    });
    
    // Auto-ajustar columnas
    headers.forEach((header, i) => {
        let column = sheet.getColumn(i + 1);
        column.width = Math.max(header.length, 12);
    });
    
    // Agregar bordes
    sheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
        row.eachCell({ includeEmpty: false }, function(cell, colNumber) {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
}

/**
 * Exportar múltiples tablas a un único archivo CSV
 */
function exportCombinedCSV(tablesData, filename) {
    try {
        // BOM UTF-8
        const BOM = '\uFEFF';
        let csvContent = BOM;
        
        // Para cada tabla, añadir una sección
        for (const [tableName, data] of Object.entries(tablesData)) {
            if (!data || data.length === 0) {
                console.log(`Tabla ${tableName} sin datos, omitiendo...`);
                continue;
            }
            
            // Nombre de la tabla como encabezado de sección
            const formattedTableName = tableName.replace(/_/g, ' ').toUpperCase();
            csvContent += `\r\n# ${formattedTableName}\r\n\r\n`;
            
            // Encabezados de columnas
            const headers = Object.keys(data[0]);
            csvContent += headers.join(',') + '\r\n';
            
            // Filas de datos
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
                    return value;
                });
                
                csvContent += values.join(',') + '\r\n';
            });
            
            // Separador entre tablas
            csvContent += '\r\n';
        }
        
        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
    } catch (error) {
        console.error('Error exportando CSV combinado:', error);
        throw new Error('No se pudo exportar el archivo CSV: ' + error.message);
    }
}

/**
 * Cargar datos si es necesario
 */
async function loadDataIfNeeded() {
    try {
        console.log('Cargando datos necesarios...');
        
        // Intentar importar servicios
        let productosModule, pedidosModule;
        
        try {
            productosModule = await import('../../scripts/services/productos.js');
            console.log('Módulo de productos cargado');
        } catch (e) {
            console.warn('No se pudo cargar el módulo de productos:', e);
            productosModule = null;
        }
        
        try {
            pedidosModule = await import('../../scripts/services/pedidos.js');
            console.log('Módulo de pedidos cargado');
        } catch (e) {
            console.warn('No se pudo cargar el módulo de pedidos:', e);
            pedidosModule = null;
        }

        // Cargar productos
        if (productosModule && productosModule.ProductoService) {
            try {
                const response = await productosModule.ProductoService.getAllProducts();
                window.todosProductos = response.documents || response || [];
                console.log(`${window.todosProductos.length} productos cargados`);
            } catch (error) {
                console.error('Error cargando productos:', error);
                window.todosProductos = getSampleProducts();
            }
        } else {
            window.todosProductos = getSampleProducts();
        }

        // Cargar pedidos
        if (pedidosModule && pedidosModule.pedidosService) {
            try {
                const pedidosResult = await pedidosModule.pedidosService.obtenerTodosPedidos();
                window.todosPedidos = Array.isArray(pedidosResult) ? pedidosResult : [];
                console.log(`${window.todosPedidos.length} pedidos cargados`);
            } catch (error) {
                console.error('Error cargando pedidos:', error);
                window.todosPedidos = getSampleOrders();
            }
        } else {
            window.todosPedidos = getSampleOrders();
        }
        
        // Asegurar que tengamos datos
        if (!window.todosProductos || window.todosProductos.length === 0) {
            window.todosProductos = getSampleProducts();
        }
        
        if (!window.todosPedidos || window.todosPedidos.length === 0) {
            window.todosPedidos = getSampleOrders();
        }

    } catch (error) {
        console.error('Error general cargando datos:', error);
        window.todosProductos = getSampleProducts();
        window.todosPedidos = getSampleOrders();
    }
}

/**
 * Preparar datos de productos
 */
function prepareProductos() {
    const productos = window.todosProductos || [];
    
    return productos.map(p => ({
        id: p.$id || p.id || '',
        nombre: p.nombre || '',
        categoria: p.categoria || 'Sin categoría',
        precio: parseFloat(p.precio) || 0,
        stock: parseInt(p.existencia || p.stock) || 0,
        descripcion: p.descripcion || ''
    }));
}

/**
 * Preparar datos de pedidos - Versión corregida con datos reales (sin logs)
 */
function preparePedidos() {
    const pedidos = window.todosPedidos || [];
    const result = [];

    // Procesar cada pedido de forma asíncrona para obtener detalles
    const promises = pedidos.map(async (p, index) => {
        try {
            // Usar exactamente los mismos campos que el dashboard
            const cliente = p.usuario_nombre || 'Cliente no identificado';
            const fecha = formatDate(p.fecha_creacion || p.$createdAt);
            const total = parseFloat(p.total || 0);
            const estado = p.estado || 'pendiente';
            
            // Obtener detalles del pedido (productos individuales)
            let detalles = [];
            try {
                detalles = await pedidosService.obtenerDetallesPedido(p.$id);
            } catch (error) {
                // Si no hay detalles, crear una entrada básica
                detalles = [{
                    producto_nombre: 'Pedido sin detalle',
                    precio_unitario: total,
                    cantidad: 1,
                    precio_total: total
                }];
            }
            
            // Crear filas para cada producto del pedido
            if (Array.isArray(detalles) && detalles.length > 0) {
                detalles.forEach((detalle, itemIndex) => {
                    result.push({
                        pedido_id: p.$id || p.id || `pedido_${index}`,
                        fecha: fecha,
                        cliente: cliente,
                        email: p.usuario_email || '',
                        telefono: p.usuario_telefono || '',
                        estado: estado,
                        producto: detalle.producto_nombre || 'Producto sin nombre',
                        precio_unitario: parseFloat(detalle.precio_unitario || 0),
                        cantidad: parseInt(detalle.cantidad || 1),
                        subtotal: parseFloat(detalle.precio_total || 0),
                        total_pedido: total
                    });
                });
            } else {
                // Si no hay detalles, crear una entrada básica
                result.push({
                    pedido_id: p.$id || p.id || `pedido_${index}`,
                    fecha: fecha,
                    cliente: cliente,
                    email: p.usuario_email || '',
                    telefono: p.usuario_telefono || '',
                    estado: estado,
                    producto: 'Pedido sin detalle de productos',
                    precio_unitario: total,
                    cantidad: 1,
                    subtotal: total,
                    total_pedido: total
                });
            }
            
        } catch (error) {
            console.error(`Error procesando pedido ${index}:`, error);
            result.push({
                pedido_id: p.$id || p.id || `error_${index}`,
                fecha: formatDate(new Date()),
                cliente: 'Error en procesamiento',
                email: '',
                telefono: '',
                estado: 'error',
                producto: 'Error al procesar pedido',
                precio_unitario: 0,
                cantidad: 0,
                subtotal: 0,
                total_pedido: 0
            });
        }
    });
    
    // Esperar a que todas las promesas se resuelvan
    return Promise.all(promises).then(() => {
        return result;
    });
}

/**
 * Preparar datos de ventas mensuales - Incluye todos los meses del año
 */
function prepareVentasMensuales() {
    const pedidos = window.todosPedidos || [];
    const ventasPorMes = {};
    
    // Inicializar todos los meses del año actual con 0
    const currentYear = new Date().getFullYear();
    for (let mes = 1; mes <= 12; mes++) {
        const key = `${currentYear}-${mes.toString().padStart(2, '0')}`;
        ventasPorMes[key] = {
            anio: currentYear,
            mes: mes,
            nombre_mes: getNombreMes(mes),
            total: 0,
            cantidad_pedidos: 0
        };
    }
    
    // Calcular ventas reales por mes
    pedidos.forEach(pedido => {
        try {
            const fecha = new Date(pedido.fecha_creacion || pedido.$createdAt || new Date());
            const anio = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;
            
            // Solo procesar pedidos del año actual
            if (anio === currentYear) {
                const key = `${anio}-${mes.toString().padStart(2, '0')}`;
                
                if (ventasPorMes[key]) {
                    ventasPorMes[key].total += parseFloat(pedido.total || 0);
                    ventasPorMes[key].cantidad_pedidos += 1;
                }
            }
        } catch (e) {
            console.warn('Error procesando fecha de pedido:', e);
        }
    });
    
    // Convertir a array y calcular ticket promedio
    const result = Object.values(ventasPorMes).map(item => ({
        anio: item.anio,
        mes: item.mes,
        nombre_mes: item.nombre_mes,
        periodo: `${item.nombre_mes} ${item.anio}`,
        total: item.total,
        cantidad_pedidos: item.cantidad_pedidos,
        ticket_promedio: item.cantidad_pedidos > 0 ? (item.total / item.cantidad_pedidos) : 0
    }));
    
    // Ordenar por mes
    return result.sort((a, b) => a.mes - b.mes);
}

/**
 * Preparar datos de categorías - Sin columna de ventas_totales
 */
function prepareCategorias() {
    const productos = window.todosProductos || [];
    const categoriaMap = {};
    
    productos.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        
        if (!categoriaMap[categoria]) {
            categoriaMap[categoria] = {
                categoria: categoria,
                cantidad_productos: 0,
                valor_inventario: 0
            };
        }
        
        const precio = parseFloat(producto.precio || 0);
        const stock = parseInt(producto.existencia || producto.stock || 0);
        
        categoriaMap[categoria].cantidad_productos += 1;
        categoriaMap[categoria].valor_inventario += precio * stock;
    });
    
    return Object.values(categoriaMap);
}

/**
 * Preparar datos de clientes - Versión corregida
 */
function prepareClientes() {
    const pedidos = window.todosPedidos || [];
    const clienteMap = {};
    
    pedidos.forEach(pedido => {
        // Usar exactamente los mismos campos que el dashboard
        const nombreCliente = pedido.usuario_nombre || 'Cliente no identificado';
        const emailCliente = pedido.usuario_email || '';
        const telefonoCliente = pedido.usuario_telefono || '';
        
        const clienteKey = `${nombreCliente}|${emailCliente}`;
        
        if (!clienteMap[clienteKey]) {
            clienteMap[clienteKey] = {
                nombre: nombreCliente,
                email: emailCliente,
                telefono: telefonoCliente,
                total_compras: 0,
                cantidad_pedidos: 0,
                primera_compra: null,
                ultima_compra: null,
                estados_pedidos: {}
            };
        }
        
        const total = parseFloat(pedido.total || 0);
        const estado = pedido.estado || 'pendiente';
        
        let fecha;
        try {
            fecha = new Date(pedido.fecha_creacion || pedido.$createdAt || new Date());
            if (isNaN(fecha.getTime())) fecha = new Date();
        } catch (e) {
            fecha = new Date();
        }
        
        clienteMap[clienteKey].total_compras += total;
        clienteMap[clienteKey].cantidad_pedidos += 1;
        
        // Contar por estado
        clienteMap[clienteKey].estados_pedidos[estado] = 
            (clienteMap[clienteKey].estados_pedidos[estado] || 0) + 1;
        
        if (!clienteMap[clienteKey].primera_compra || fecha < new Date(clienteMap[clienteKey].primera_compra)) {
            clienteMap[clienteKey].primera_compra = fecha.toISOString();
        }
        
        if (!clienteMap[clienteKey].ultima_compra || fecha > new Date(clienteMap[clienteKey].ultima_compra)) {
            clienteMap[clienteKey].ultima_compra = fecha.toISOString();
        }
    });
    
    const result = Object.values(clienteMap).map(cliente => ({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        total_compras: cliente.total_compras,
        cantidad_pedidos: cliente.cantidad_pedidos,
        promedio_compra: cliente.cantidad_pedidos > 0 ? (cliente.total_compras / cliente.cantidad_pedidos) : 0,
        primera_compra: formatDate(cliente.primera_compra),
        ultima_compra: formatDate(cliente.ultima_compra),
        pedidos_pendientes: cliente.estados_pedidos.pendiente || 0,
        pedidos_confirmados: cliente.estados_pedidos.confirmado || 0,
        pedidos_enviados: cliente.estados_pedidos.enviado || 0,
        pedidos_entregados: cliente.estados_pedidos.entregado || 0,
        pedidos_cancelados: cliente.estados_pedidos.cancelado || 0
    }));
    
    return result.sort((a, b) => b.total_compras - a.total_compras);
}

/**
 * Formatear fecha
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString();
    } catch (e) {
        return dateString;
    }
}

/**
 * Formatear fecha para nombre de archivo
 */
function formatDateForFileName(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Obtener nombre del mes
 */
function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return meses[mes - 1] || '';
}

/**
 * Cargar script externo
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Datos de muestra para productos
 */
function getSampleProducts() {
    return [
        { id: "1", nombre: "GAN 11 M Pro", precio: 399, categoria: "Cubos 3x3", existencia: 15, descripcion: "Cubo de alta gama" },
        { id: "2", nombre: "MoYu RS3M 2020", precio: 190, categoria: "Cubos 3x3", existencia: 28, descripcion: "Cubo magnético económico" },
        { id: "3", nombre: "QiYi MS Pyraminx", precio: 150, categoria: "Pyraminx", existencia: 20, descripcion: "Pyraminx magnético" }
    ];
}

/**
 * Datos de muestra para pedidos
 */
function getSampleOrders() {
    return [
        {
            id: "order1",
            fecha_creacion: "2025-09-05T14:30:00.000Z",
            nombre_cliente: "Carlos Rodríguez",
            total: 649,
            items: [
                { id: "1", nombre: "GAN 11 M Pro", precio: 399, cantidad: 1 },
                { id: "5", nombre: "Kit de lubricantes", precio: 199, cantidad: 1 }
            ]
        },
        {
            id: "order2",
            fecha_creacion: "2025-09-10T16:45:00.000Z",
            nombre_cliente: "Ana López",
            total: 190,
            items: [
                { id: "2", nombre: "MoYu RS3M 2020", precio: 190, cantidad: 1 }
            ]
        },
        {
            id: "order3",
            fecha_creacion: "2025-08-22T11:20:00.000Z",
            nombre_cliente: "Carlos Rodríguez",
            total: 150,
            items: [
                { id: "3", nombre: "QiYi MS Pyraminx", precio: 150, cantidad: 1 }
            ]
        },
        {
            id: "order4",
            fecha_creacion: "2025-07-15T09:10:00.000Z",
            nombre_cliente: "Laura Martínez",
            total: 399,
            items: [
                { id: "1", nombre: "GAN 11 M Pro", precio: 399, cantidad: 1 }
            ]
        }
    ];
}

// Sistema de notificaciones personalizado
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    
    notification.style.backgroundColor = 'white';
    notification.style.color = '#333';
    notification.style.padding = '12px 18px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '450px';
    notification.style.position = 'relative';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease-in-out';
    
    switch(type) {
        case 'success':
            notification.style.borderLeft = '4px solid #4CAF50';
            break;
        case 'error':
            notification.style.borderLeft = '4px solid #F44336';
            break;
        case 'warning':
            notification.style.borderLeft = '4px solid #FF9800';
            break;
        default:
            notification.style.borderLeft = '4px solid #2196F3';
    }
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#4CAF50"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
            break;
        case 'error':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#F44336"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
            break;
        case 'warning':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
            break;
        default:
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#2196F3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    }
    
    notification.innerHTML = `
        <div style="margin-right: 12px;">${icon}</div>
        <div style="flex-grow: 1;">${message}</div>
        <div class="notification-close" style="cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#999">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    function closeNotification(notif) {
        notif.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 300);
    }
}

// Asignar funciones globales
window.exportToPowerBI = window.exportToExcel;
window.exportToPowerBICSV = window.exportToCSV;