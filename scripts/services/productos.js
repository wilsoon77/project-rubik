import { databases } from './appwrite.js';
import config from '../config.js';
import { Query } from 'appwrite';

class ProductoService {
    static async getAllProducts() {
        try {
            console.log('📦 [ProductoService]: Obteniendo todos los productos');
            
            const response = await databases.listDocuments(
                config.databaseId,
                config.collectionId
            );
            
            console.log(`📦 [ProductoService]: ${response.documents.length} productos obtenidos`);
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error obteniendo productos:', error);
            throw error;
        }
    }

    static async getProductById(productId) {
        try {
            console.log(`📦 [ProductoService]: Obteniendo producto ${productId}`);
            
            const response = await databases.getDocument(
                config.databaseId,
                config.collectionId,
                productId
            );
            
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error obteniendo producto:', error);
            throw error;
        }
    }

    static async getProductsByCategory(category) {
        try {
            console.log(`📦 [ProductoService]: Obteniendo productos de categoría ${category}`);
            
            const response = await databases.listDocuments(
                config.databaseId,
                config.collectionId,
                [Query.equal('categoria', category)]
            );
            
            console.log(`📦 [ProductoService]: ${response.documents.length} productos de ${category} obtenidos`);
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error obteniendo productos por categoría:', error);
            throw error;
        }
    }

    static async createProduct(productData) {
        try {
            console.log('📦 [ProductoService]: Creando nuevo producto');
            
            const response = await databases.createDocument(
                config.databaseId,
                config.collectionId,
                'unique()',
                productData
            );
            
            console.log('✅ [ProductoService]: Producto creado exitosamente');
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error creando producto:', error);
            throw error;
        }
    }

    static async updateProduct(productId, productData) {
        try {
            console.log(`📦 [ProductoService]: Actualizando producto ${productId}`);
            
            const response = await databases.updateDocument(
                config.databaseId,
                config.collectionId,
                productId,
                productData
            );
            
            console.log('✅ [ProductoService]: Producto actualizado exitosamente');
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error actualizando producto:', error);
            throw error;
        }
    }

    static async deleteProduct(productId) {
        try {
            console.log(`📦 [ProductoService]: Eliminando producto ${productId}`);
            
            await databases.deleteDocument(
                config.databaseId,
                config.collectionId,
                productId
            );
            
            console.log('✅ [ProductoService]: Producto eliminado exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error eliminando producto:', error);
            throw error;
        }
    }

    static async searchProducts(searchTerm) {
        try {
            console.log(`📦 [ProductoService]: Buscando productos: ${searchTerm}`);
            
            const response = await databases.listDocuments(
                config.databaseId,
                config.collectionId,
                [Query.search('nombre', searchTerm)]
            );
            
            console.log(`📦 [ProductoService]: ${response.documents.length} productos encontrados`);
            return response;
            
        } catch (error) {
            console.error('❌ [ProductoService]: Error buscando productos:', error);
            throw error;
        }
    }
}

export { ProductoService };