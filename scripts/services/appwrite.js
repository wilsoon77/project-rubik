// services/appwrite.js
import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';
import config from '../config.js';

// Initialize Appwrite Client
const client = new Client();

// Only set endpoint and project if they exist
if (config.endpoint) {
    client.setEndpoint(config.endpoint);
}
if (config.projectId) {
    client.setProject(config.projectId);
}

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// ✅ EXPORTAR EL CLIENTE CON NOMBRE DIFERENTE
export const AppwriteClient = client; // ← CAMBIADO: evita conflicto con import
export { ID, Query }; // Para las operaciones de base de datos

// IDs de configuración (exportados para uso en otros archivos)
export const CONFIG = {
    databaseId: 'aethercubix-db',
    collections: {
        producto: 'producto',
        usuario: 'usuario',
        carrito: 'carrito', 
        venta: 'venta',
        detalle_venta: 'detalle_venta'
    }
};

export const DATABASE_ID = 'aethercubix-db';
export const PRODUCTO_COLLECTION_ID = 'producto';
export const USUARIO_COLLECTION_ID = 'usuario';
export const CARRITO_COLLECTION_ID = 'carrito';
export const VENTA_COLLECTION_ID = 'venta';
export const DETALLE_VENTA_COLLECTION_ID = 'detalle_venta';