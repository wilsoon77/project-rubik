import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        about: './src/pages/sobre-nosotros.html',
        products: './src/pages/productos.html',
        learn: './src/pages/aprende.html',
        contact: './src/pages/contacto.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})