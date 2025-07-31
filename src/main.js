// Importar estilos
import './styles/main.css'
import './styles/animations.css'
import './styles/responsive.css'

// Importar funcionalidades
import { initNavigation } from './scripts/navigation.js'
import { initAnimations } from './scripts/animations.js'
import { initProductFilters } from './scripts/products.js'
import { initContactForm } from './scripts/contact.js'
import { initEasterEgg } from './scripts/easter-egg.js'

// Configuración global
const CONFIG = {
    scrollOffset: 100,
    animationDelay: 100,
    debounceDelay: 250,
    transitionDuration: 300
}

// Función de inicialización principal
function init() {
    console.log('🎲 CubeZone Website Initialized with Vite')
    
    // Inicializar módulos
    initNavigation(CONFIG)
    initAnimations(CONFIG)
    initProductFilters()
    initContactForm()
    initEasterEgg()
    
    // Mostrar contenido con fade in
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    
    setTimeout(() => {
        document.body.style.opacity = '1'
    }, 100)
    
    // Log de desarrollo
    if (import.meta.env.DEV) {
        console.log('🔧 Development mode active')
        console.log('💡 Try the Konami Code for a surprise!')
        console.log('⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA')
    }
}

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('🚨 Error en CubeZone:', event.error)
})

// Previene comportamientos por defecto en ciertos elementos
document.addEventListener('dragstart', (event) => {
    if (event.target.tagName === 'IMG') {
        event.preventDefault()
    }
})

// Mejora la experiencia en iOS
document.addEventListener('touchstart', () => {}, { passive: true })

// Exportar configuración para otros módulos
export { CONFIG }