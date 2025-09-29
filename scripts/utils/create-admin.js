import { authService } from '../services/auth.js';
import { databases, ID } from '../services/appwrite.js';
import { CONFIG } from '../services/appwrite.js';

/**
 * Script para crear usuario administrador
 * Ejecutar una sola vez desde la consola del navegador
 */
window.crearUsuarioAdmin = async function(email, password, nombre) {
    try {
        console.log('🔧 [CreateAdmin]: Creando usuario administrador...');

        // Registrar usuario normal
        const resultado = await authService.registrar(email, password, nombre);
        console.log('✅ [CreateAdmin]: Usuario creado:', resultado);

        // Actualizar rol a admin en la base de datos
        const perfilActualizado = await databases.updateDocument(
            CONFIG.databaseId,
            CONFIG.collections.usuario,
            resultado.perfil.$id,
            {
                rol: 'admin'
            }
        );

        console.log('✅ [CreateAdmin]: Usuario promovido a administrador:', perfilActualizado);
        
        alert('✅ Usuario administrador creado exitosamente!');
        return perfilActualizado;

    } catch (error) {
        console.error('❌ [CreateAdmin]: Error creando admin:', error);
        alert('❌ Error creando administrador: ' + error.message);
        throw error;
    }
};

// Instrucciones en consola
console.log(`
🔧 CREAR USUARIO ADMINISTRADOR
==============================

Para crear un usuario administrador, ejecuta en la consola:

crearUsuarioAdmin('admin@aethercubix.com', '12345678', 'Administrador')

Cambia el email, password y nombre según necesites.
`);