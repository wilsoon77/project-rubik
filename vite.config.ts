import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        // Páginas principales
        main: './index.html',
        about: './sobre-nosotros.html',
        products: './productos.html',
        learn: './aprende.html',
        contact: './contacto.html',
        
        // ✅ AGREGAR PANEL ADMINISTRATIVO
        'admin-dashboard': './admin/index.html',
        'admin-productos': './admin/gestion-productos.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 4173,
    open: true
  }
})