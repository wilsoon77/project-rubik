import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './', // Añadir esta línea para usar rutas relativas
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'sobre-nosotros.html'),
        products: resolve(__dirname, 'productos.html'),
        learn: resolve(__dirname, 'aprende.html'),
        contact: resolve(__dirname, 'contacto.html')
      },
      output: {
        entryFileNames: 'scripts/[name].js',
        chunkFileNames: 'scripts/[name].js',
        assetFileNames: ({name}) => {
          if (/\.(css)$/.test(name ?? '')) {
            return 'styles/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
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