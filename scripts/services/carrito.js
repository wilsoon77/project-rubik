import { databases, ID } from './appwrite.js';
import { CONFIG } from './appwrite.js';
import { authService } from './auth.js';

class CarritoService {
    constructor() {
        this.databaseId = CONFIG.databaseId;
        this.carritoCollectionId = CONFIG.collections.carrito;
        this.carrito = []; // Carrito local
    }

    /**
     * Agregar producto al carrito
     */
    async agregarProducto(productId, nombre, precio, imagen, stockDisponible) {
        try {
            // Verificar si usuario está autenticado
            const usuario = await authService.obtenerUsuarioActual();
            if (!usuario) {
                throw new Error('Debes iniciar sesión para agregar productos al carrito');
            }

            // Verificar si el producto ya está en el carrito
            const productoExistente = this.carrito.find(item => item.productId === productId);
            
            if (productoExistente) {
                // Si existe, incrementar cantidad
                if (productoExistente.cantidad < stockDisponible) {
                    productoExistente.cantidad += 1;
                    await this.actualizarProductoEnDB(productoExistente);
                } else {
                    throw new Error('No hay suficiente stock disponible');
                }
            } else {
                // Si no existe, agregar nuevo producto
                const nuevoItem = {
                    id: ID.unique(),
                    productId: productId,
                    nombre: nombre,
                    precio: parseFloat(precio),
                    imagen: imagen,
                    cantidad: 1,
                    usuarioId: usuario.$id, // ✅ CORREGIDO
                    fechaAgregado: new Date().toISOString()
                };

                // Agregar a carrito local
                this.carrito.push(nuevoItem);

                // Guardar en base de datos
                await this.guardarProductoEnDB(nuevoItem);
            }

            // Actualizar UI
            this.actualizarContadorCarrito();
            return true;

        } catch (error) {
            console.error('❌ [Carrito]: Error agregando producto:', error);
            throw error;
        }
    }

    /**
     * Guardar producto en base de datos
     */
    async guardarProductoEnDB(item) {
        try {
            const documento = await databases.createDocument(
                this.databaseId,
                this.carritoCollectionId,
                item.id,
                {
                    // ✅ CORREGIDO: Usar nombres de campos de Appwrite
                    usuario_id: item.usuarioId,
                    producto_id: item.productId,
                    producto_nombre: item.nombre,
                    producto_precio: item.precio,
                    producto_imagen: item.imagen,
                    cantidad: item.cantidad,
                    fecha_agregado: item.fechaAgregado  // ✅ AGREGAR ESTE CAMPO
                }
            );
            console.log('✅ [Carrito]: Producto guardado en DB:', documento);
        } catch (error) {
            console.error('❌ [Carrito]: Error guardando en DB:', error);
            throw error;
        }
    }

    /**
     * Actualizar producto en base de datos
     */
    async actualizarProductoEnDB(item) {
        try {
            await databases.updateDocument(
                this.databaseId,
                this.carritoCollectionId,
                item.id,
                { cantidad: item.cantidad }
            );
            console.log('✅ [Carrito]: Cantidad actualizada en DB');
        } catch (error) {
            console.error('❌ [Carrito]: Error actualizando DB:', error);
            throw error;
        }
    }

    /**
     * Cargar carrito desde base de datos
     */
    async cargarCarritoDesdeDB() {
        try {
            const usuario = await authService.obtenerUsuarioActual();
            if (!usuario) {
                this.carrito = [];
                this.actualizarContadorCarrito();
                return;
            }

            // Importar Query aquí para evitar problemas circulares
            const { Query } = await import('./appwrite.js');
            
            const response = await databases.listDocuments(
                this.databaseId,
                this.carritoCollectionId,
                [Query.equal('usuario_id', usuario.$id)]
            );

            // ✅ CORREGIDO: Mapear campos de Appwrite a formato interno
            this.carrito = response.documents.map(doc => ({
                id: doc.$id,
                productId: doc.producto_id,
                nombre: doc.producto_nombre,
                precio: doc.producto_precio,
                imagen: doc.producto_imagen,
                cantidad: doc.cantidad,
                usuarioId: doc.usuario_id,
                fechaAgregado: doc.fecha_agregado || doc.$createdAt || new Date().toISOString()  // ✅ AGREGAR CAMPO
            }));

            this.actualizarContadorCarrito();
            console.log('✅ [Carrito]: Cargado desde DB:', this.carrito);

        } catch (error) {
            console.error('❌ [Carrito]: Error cargando desde DB:', error);
            this.carrito = [];
            this.actualizarContadorCarrito();
        }
    }

    /**
     * Actualizar cantidad de un producto
     */
    async actualizarCantidad(itemId, nuevaCantidad) {
        try {
            const item = this.carrito.find(item => item.id === itemId);
            if (!item) throw new Error('Producto no encontrado');

            if (nuevaCantidad <= 0) {
                await this.eliminarProducto(itemId);
            } else {
                item.cantidad = nuevaCantidad;
                await this.actualizarProductoEnDB(item);
                this.actualizarContadorCarrito();
            }
        } catch (error) {
            console.error('❌ [Carrito]: Error actualizando cantidad:', error);
            throw error;
        }
    }

    /**
     * Eliminar producto del carrito
     */
    async eliminarProducto(itemId) {
        try {
            // Eliminar de base de datos
            await databases.deleteDocument(
                this.databaseId,
                this.carritoCollectionId,
                itemId
            );

            // Eliminar de carrito local
            this.carrito = this.carrito.filter(item => item.id !== itemId);
            this.actualizarContadorCarrito();
            
            console.log('✅ [Carrito]: Producto eliminado');
        } catch (error) {
            console.error('❌ [Carrito]: Error eliminando producto:', error);
            throw error;
        }
    }

    /**
     * Vaciar carrito completo
     */
    async vaciarCarrito() {
        try {
            // Eliminar todos los productos de DB
            for (const item of this.carrito) {
                await databases.deleteDocument(
                    this.databaseId,
                    this.carritoCollectionId,
                    item.id
                );
            }

            // Vaciar carrito local
            this.carrito = [];
            this.actualizarContadorCarrito();
            
            console.log('✅ [Carrito]: Carrito vaciado');
        } catch (error) {
            console.error('❌ [Carrito]: Error vaciando carrito:', error);
            throw error;
        }
    }

    /**
     * Calcular totales del carrito
     */
    calcularTotales() {
        const subtotal = this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        const envio = subtotal >= 250 ? 0 : 25; // Envío gratis si es mayor a Q250
        const impuestos = subtotal * 0.12; // IVA 12%
        const total = subtotal + envio + impuestos;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            envio: parseFloat(envio.toFixed(2)),
            impuestos: parseFloat(impuestos.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }

    /**
     * Obtener carrito actual
     */
    obtenerCarrito() {
        return this.carrito;
    }

    /**
     * Obtener cantidad total de productos
     */
    obtenerCantidadTotal() {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    /**
     * Actualizar contador visual del carrito
     */
    actualizarContadorCarrito() {
        const contador = document.getElementById('cart-counter');
        const cantidad = this.obtenerCantidadTotal();
        
        if (contador) {
            contador.textContent = cantidad;
            if (cantidad > 0) {
                contador.classList.add('show');
            } else {
                contador.classList.remove('show');
            }
        }
    }
}

// Instancia global del servicio
export const carritoService = new CarritoService();
window.carritoService = carritoService;