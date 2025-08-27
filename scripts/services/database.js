// services/database.js
import { databases } from './appwrite';
import config from '../config';

export const ProductoService = {
    // Crear un producto
    crearProducto: async (data) => {
        try {
            // Validación básica de URL
            if (!isValidUrl(data.imagen)) {
                throw new Error('La URL de la imagen no es válida');
            }

            return await databases.createDocument(
                config.databaseId,
                config.collectionId,
                'unique()',
                data
            );
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    },

    // Obtener todos los productos
    getAllProducts: async () => {
        try {
            console.log('Intentando obtener productos...'); // Debug log
            const response = await databases.listDocuments(
                config.databaseId,
                config.collectionId
            );
            console.log('Respuesta de Appwrite:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error específico:', error.message);
            console.error('Código de error:', error.code);
            throw error;
        }
    },

    // Obtener un producto por ID
    getProduct: async (id) => {
        try {
            return await databases.getDocument(
                config.databaseId,
                config.collectionId,
                id
            );
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Actualizar un producto
    updateProduct: async (id, data) => {
        try {
            return await databases.updateDocument(
                config.databaseId,
                config.collectionId,
                id,
                data
            );
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Eliminar un producto
    deleteProduct: async (id) => {
        try {
            return await databases.deleteDocument(
                config.databaseId,
                config.collectionId,
                id
            );
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
};

// Función helper para validar URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}