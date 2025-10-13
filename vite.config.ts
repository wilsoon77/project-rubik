import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

// Función para encontrar todos los archivos HTML recursivamente
function findHtmlFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
        files.push(...findHtmlFiles(fullPath, baseDir))
      } else if (item.endsWith('.html')) {
        const relativePath = fullPath.replace(baseDir + '/', '').replace(baseDir + '\\', '')
        files.push(relativePath)
      }
    }
  } catch (error) {
    console.warn(`No se pudo leer el directorio: ${dir}`)
  }
  
  return files
}

// Generar entradas automáticamente
function generateInputs() {
  const htmlFiles = findHtmlFiles('.')
  const inputs: Record<string, string> = {}
  
  htmlFiles.forEach(file => {
    const name = file.replace(/\.html$/, '').replace(/\//g, '-').replace(/\\/g, '-')
    inputs[name] = resolve(__dirname, file)
  })
  
  console.log('📄 Archivos HTML encontrados:', Object.keys(inputs))
  return inputs
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: generateInputs()
    },
    // Copiar archivos PWA importantes
    copyPublicDir: true
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