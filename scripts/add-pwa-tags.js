// Script para agregar meta tags PWA a todos los archivos HTML
// Ejecutar con: node scripts/add-pwa-tags.js

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Meta tags PWA que se agregarán
const PWA_META_TAGS = `
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="AetherCubix">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png">
    
    <!-- Splash screens para iOS -->
    <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png">
`;

const PWA_SCRIPT = `
    <!-- PWA Manager - Carga asíncrona para no bloquear -->
    <script type="module" src="/scripts/pwa-manager.js" async></script>`;

// Archivos a procesar (excluir generador de iconos)
const HTML_FILES = [
    'productos.html',
    'carrito.html',
    'checkout.html',
    'confirmacion.html',
    'login.html',
    'mis-pedidos.html',
    'sobre-nosotros.html',
    'contacto.html',
    'aprende.html',
    'admin/index.html',
    'admin/gestion-productos.html',
    'admin/ai-assistant.html',
    'admin/power-bi.html',
    'auth/success.html',
    'auth/failure.html'
];

function addPWATags(filePath) {
    try {
        let content = readFileSync(filePath, 'utf-8');
        
        // Verificar si ya tiene los tags PWA
        if (content.includes('PWA Meta Tags')) {
            console.log(`⏭️  Omitido (ya tiene PWA): ${filePath}`);
            return false;
        }
        
        // Actualizar viewport si es necesario
        content = content.replace(
            /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/,
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
        );
        
        // Agregar meta tags PWA después del charset y viewport
        if (content.includes('</title>')) {
            content = content.replace(
                /(<\/title>)/,
                `$1${PWA_META_TAGS}`
            );
        } else {
            console.warn(`⚠️  No se encontró </title> en: ${filePath}`);
            return false;
        }
        
        // Agregar script PWA antes de </body>
        if (content.includes('</body>')) {
            content = content.replace(
                /(<\/body>)/,
                `${PWA_SCRIPT}\n</body>`
            );
        }
        
        writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Actualizado: ${filePath}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
        return false;
    }
}

// Procesar archivos
console.log('🚀 Iniciando actualización de archivos HTML con PWA...\n');

let updated = 0;
let skipped = 0;
let errors = 0;

HTML_FILES.forEach(file => {
    const fullPath = join(projectRoot, file);
    const result = addPWATags(fullPath);
    
    if (result === true) updated++;
    else if (result === false && !file.includes('icon-generator')) skipped++;
    else errors++;
});

console.log('\n📊 Resumen:');
console.log(`✅ Actualizados: ${updated}`);
console.log(`⏭️  Omitidos: ${skipped}`);
console.log(`❌ Errores: ${errors}`);
console.log('\n🎉 ¡Proceso completado!');
