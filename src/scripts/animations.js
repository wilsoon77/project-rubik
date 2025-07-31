// Módulo de animaciones
import { isElementInViewport } from './utils.js'

export function initAnimations(config) {
    // Inicializar animaciones de scroll
    window.addEventListener('scroll', handleScrollAnimations)
    
    // Inicializar cubo hero
    handleHeroCube()
    
    // Mejorar hovers de cards
    enhanceCardHovers()
    
    // Efectos de ripple en botones
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', addRippleEffect)
    })
}

function handleScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-reveal, .product-card, .feature-card, .level-card')
    
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('revealed')
        }
    })
    
    // Efecto parallax simple
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('.floating-cube')
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05)
        element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`
    })
}

function handleHeroCube() {
    const heroSection = document.getElementById('inicio')
    const cube = document.querySelector('.cube-3d')
    
    if (!cube || !heroSection) return
    
    let isInteracting = false
    
    heroSection.addEventListener('mouseenter', () => {
        if (!isInteracting) {
            cube.style.animationPlayState = 'paused'
            isInteracting = true
        }
    })
    
    heroSection.addEventListener('mouseleave', () => {
        cube.style.animationPlayState = 'running'
        isInteracting = false
    })
    
    heroSection.addEventListener('touchstart', () => {
        cube.style.animationPlayState = 'paused'
    })
    
    heroSection.addEventListener('touchend', () => {
        setTimeout(() => {
            cube.style.animationPlayState = 'running'
        }, 2000)
    })
}

function enhanceCardHovers() {
    const cards = document.querySelectorAll('.product-card, .feature-card, .level-card')
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateY(2deg)'
            this.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)'
        })
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateY(0)'
            this.style.boxShadow = ''
        })
    })
}

function addRippleEffect(event) {
    const button = event.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `
    
    button.style.position = 'relative'
    button.style.overflow = 'hidden'
    button.appendChild(ripple)
    
    setTimeout(() => ripple.remove(), 600)
}