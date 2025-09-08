import { databases, ID } from './appwrite.js';
import { CONFIG } from './appwrite.js';
import { authService } from './auth.js';
import { carritoService } from './carrito.js';

class PedidosService {
    constructor() {
        this.databaseId = CONFIG.databaseId;
        this.pedidosCollectionId = CONFIG.collections.venta; // Tabla de pedidos
        this.detallesPedidoCollectionId = CONFIG.collections.detalle_venta; // Detalles del pedido
        this.productosCollectionId = CONFIG.collections.producto; // Para actualizar stock
        this.carritoCollectionId = CONFIG.collections.carrito; // Para vaciar carrito
    }

    /**
     * Crear pedido completo (con descuento de stock)
     */
    async crearPedido(datosCheckout) {
        try {
            console.log('🛒 [Pedidos]: Iniciando creación de pedido...');

            // 1. Obtener usuario actual
            const usuario = await authService.obtenerUsuarioActual();
            if (!usuario) {
                throw new Error('Debes estar logueado para crear un pedido');
            }

            // 2. Obtener carrito actual
            const carrito = carritoService.obtenerCarrito();
            if (carrito.length === 0) {
                throw new Error('El carrito está vacío');
            }

            // 3. Validar stock disponible
            await this.validarStockDisponible(carrito);

            // 4. Calcular totales
            const totales = carritoService.calcularTotales();

            // 5. Crear registro principal del pedido
            const pedido = await this.crearRegistroPedido(usuario, datosCheckout, totales);

            // 6. Crear detalles del pedido
            await this.crearDetallesPedido(pedido.$id, carrito);

            // 7. Descontar stock de productos
            await this.descontarStock(carrito);

            // 8. Vaciar carrito del usuario
            await carritoService.vaciarCarrito();

            console.log('✅ [Pedidos]: Pedido creado exitosamente:', pedido);
            return pedido;

        } catch (error) {
            console.error('❌ [Pedidos]: Error creando pedido:', error);
            throw error;
        }
    }

    /**
     * Validar que hay stock suficiente para todos los productos
     */
    async validarStockDisponible(carrito) {
        console.log('🔍 [Pedidos]: Validando stock disponible...');

        for (const item of carrito) {
            const producto = await databases.getDocument(
                this.databaseId,
                this.productosCollectionId,
                item.productId
            );

            if (producto.existencia < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${producto.existencia}, Solicitado: ${item.cantidad}`);
            }
        }

        console.log('✅ [Pedidos]: Stock validado correctamente');
    }

    /**
   * Crear registro principal del pedido
   */
    async crearRegistroPedido(usuario, datosCheckout, totales) {
        const pedidoData = {
            // ✅ SOLO CAMPOS QUE EXISTEN EN TU TABLA APPWRITE
            usuario_id: usuario.$id,
            usuario_nombre: datosCheckout.nombre,
            usuario_email: usuario.email,
            usuario_telefono: datosCheckout.telefono,
            direccion_envio: `${datosCheckout.direccion}, ${datosCheckout.municipio}, ${datosCheckout.departamento}`,

            // Totales
            costo_envio: totales.envio,
            total: totales.total,

            // Campos de texto
            estado: 'pendiente',
            metodo_pago: datosCheckout.metodoPago,
            notas: datosCheckout.notas || 'Sin notas adicionales',

            // Fecha
            fecha_creacion: new Date().toISOString()

        };

        console.log('📝 [Pedidos]: Datos a enviar:', pedidoData);

        const pedido = await databases.createDocument(
            this.databaseId,
            this.pedidosCollectionId,
            ID.unique(),
            pedidoData
        );

        console.log('✅ [Pedidos]: Registro principal creado:', pedido);
        return pedido;
    }


    /**
 * Crear detalles del pedido (productos individuales)
 */
    async crearDetallesPedido(pedidoId, carrito) {
        console.log('📝 [Pedidos]: Creando detalles del pedido...');

        for (const item of carrito) {
            const detalleData = {
                venta_id: pedidoId,
                producto_id: item.productId,
                producto_nombre: item.nombre,
                producto_precio: item.precio,
                precio_unitario: item.precio,
                precio_total: item.precio * item.cantidad,
                producto_imagen: item.imagen,
                cantidad: item.cantidad,
            };

            await databases.createDocument(
                this.databaseId,
                this.detallesPedidoCollectionId,
                ID.unique(),
                detalleData
            );
        }

        console.log('✅ [Pedidos]: Detalles creados correctamente');
    }

    /**
     * Descontar stock de los productos
     */
    async descontarStock(carrito) {
        console.log('📉 [Pedidos]: Descontando stock...');

        for (const item of carrito) {
            // Obtener producto actual
            const producto = await databases.getDocument(
                this.databaseId,
                this.productosCollectionId,
                item.productId
            );

            // Calcular nuevo stock
            const nuevoStock = producto.existencia - item.cantidad;

            // Actualizar stock en base de datos
            await databases.updateDocument(
                this.databaseId,
                this.productosCollectionId,
                item.productId,
                { existencia: nuevoStock }
            );

            console.log(`✅ [Pedidos]: Stock actualizado para ${item.nombre}: ${producto.existencia} → ${nuevoStock}`);
        }

        console.log('✅ [Pedidos]: Stock descontado correctamente');
    }

    /**
     * Generar número único de pedido
     */
    generarNumeroPedido() {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().substr(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

        return `AC${año}${mes}${dia}${random}`;
    }

    /**
 * Obtener TODOS los pedidos (para administradores)
 */
async obtenerTodosPedidos() {
    try {
        console.log('📋 [Pedidos]: Obteniendo todos los pedidos para admin...');

        const { Query } = await import('./appwrite.js');

        const response = await databases.listDocuments(
            this.databaseId,
            this.pedidosCollectionId,
            [
                Query.orderDesc('fecha_creacion'),
                Query.limit(1000) // Limitar a 1000 pedidos más recientes
            ]
        );

        console.log(`✅ [Pedidos]: ${response.documents.length} pedidos obtenidos para admin`);
        return response.documents;

    } catch (error) {
        console.error('❌ [Pedidos]: Error obteniendo todos los pedidos:', error);
        throw error;
    }
}

    /**
     * Obtener pedidos de un usuario
     */
    async obtenerPedidosUsuario() {
        try {
            const usuario = await authService.obtenerUsuarioActual();
            if (!usuario) {
                throw new Error('Usuario no autenticado');
            }

            const { Query } = await import('./appwrite.js');

            const response = await databases.listDocuments(
                this.databaseId,
                this.pedidosCollectionId,
                [
                    Query.equal('usuario_id', usuario.$id),
                    Query.orderDesc('fecha_creacion'),
                    Query.limit(100)
                ]
            );

            console.log(`✅ [Pedidos]: ${response.documents.length} detalles encontrados`);
            return response.documents;

        } catch (error) {
            console.error('❌ [Pedidos]: Error obteniendo pedidos:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles de un pedido específico
     */
    async obtenerDetallesPedido(pedidoId) {
        try {
            const { Query } = await import('./appwrite.js');

            const response = await databases.listDocuments(
                this.databaseId,
                this.detallesPedidoCollectionId,
                [Query.equal('venta_id', pedidoId)]
            );

            return response.documents;

        } catch (error) {
            console.error('❌ [Pedidos]: Error obteniendo detalles:', error);
            throw error;
        }
    }
}

// Instancia global del servicio
export const pedidosService = new PedidosService();
window.pedidosService = pedidosService;