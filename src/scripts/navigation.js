// Módulo de navegación
import { debounce, throttle } from './utils.js'

let navbar, hamburger, navMenu, navLinks, scrollToTopBtn

export function initNavigation(config) {
    // Elementos DOM
    navbar = document.getElementById('navbar')
    hamburger = document.getElementById('hamburger')
    navMenu = document.getElementById('nav-menu')
    navLinks = document.querySelectorAll('.nav-link')
    scrollToTopBtn = document.getElementById('scrollToTop')
    
    // Event listeners
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu)
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu)
    })
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        })
    }
    
    // Scroll events
    window.addEventListener('scroll', throttle(handleNavbarScroll, 100))
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100))
}

function handleNavbarScroll() {
    const scrollY = window.scrollY
    
    if (scrollY > 50) {
        navbar?.classList.add('scrolled')
    } else {
        navbar?.classList.remove('scrolled')
    }
    
    if (scrollY > 500) {
        scrollToTopBtn?.classList.add('visible')
    } else {
        scrollToTopBtn?.classList.remove('visible')
    }
}

function toggleMobileMenu() {
    hamburger?.classList.toggle('active')
    navMenu?.classList.toggle('active')
    document.body.classList.toggle('menu-open')
}

function closeMobileMenu() {
    hamburger?.classList.remove('active')
    navMenu?.classList.remove('active')
    document.body.classList.remove('menu-open')
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]')
    const scrollPos = window.scrollY + 150
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        const sectionId = section.getAttribute('id')
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'))
            
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`)
            if (activeLink) {
                activeLink.classList.add('active')
            }
        }
    })
}