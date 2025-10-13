// Script para agregar async a los scripts PWA existentes
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

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

console.log('🔧 Arreglando scripts PWA...\n');

let fixed = 0;

HTML_FILES.forEach(file => {
  const fullPath = join(projectRoot, file);
  
  try {
    let content = readFileSync(fullPath, 'utf-8');
    
    // Reemplazar el script sin async por uno con async
    if (content.includes('src="/scripts/pwa-manager.js"') && !content.includes('async')) {
      content = content.replace(
        /<script type="module" src="\/scripts\/pwa-manager\.js"><\/script>/g,
        '<script type="module" src="/scripts/pwa-manager.js" async></script>'
      );
      
      writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ Arreglado: ${file}`);
      fixed++;
    } else {
      console.log(`⏭️  Ya tiene async: ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ Error en ${file}:`, error.message);
  }
});

console.log(`\n✅ Archivos arreglados: ${fixed}`);
