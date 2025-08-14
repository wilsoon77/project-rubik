/* ===========================
   JAVASCRIPT PRINCIPAL - AetherCubix
   Funcionalidad interactiva para el sitio web
   ========================== */

// ===========================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ===========================
const CONFIG = {
    scrollOffset: 100,
    animationDelay: 100,
    debounceDelay: 250,
    transitionDuration: 300
};

// Elementos DOM principales
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollToTopBtn = document.getElementById('scrollToTop');
const contactForm = document.getElementById('contactForm');
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

// ===========================
// UTILIDADES
// ===========================

/**
 * Función debounce para optimizar eventos que se disparan frecuentemente
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función debounced
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Función throttle para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo límite en milisegundos
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Animación suave de scroll a un elemento
 * @param {string} targetId - ID del elemento destino
 * @param {number} offset - Offset adicional
 */
function smoothScrollTo(targetId, offset = 0) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const targetPosition = targetElement.offsetTop - CONFIG.scrollOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Verifica si un elemento está visible en el viewport
 * @param {Element} element - Elemento a verificar
 * @returns {boolean} True si está visible
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===========================
// NAVEGACIÓN Y MENÚ
// ===========================

/**
 * Maneja el comportamiento de la navegación fija
 */
function handleNavbarScroll() {
    const scrollY = window.scrollY;

    // Añade clase 'scrolled' cuando se hace scroll
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Muestra/oculta botón de scroll to top
    if (scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

/**
 * Maneja el menú hamburguesa en móvil
 */
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

/**
 * Cierra el menú móvil
 */
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
}

/**
 * Actualiza el link activo en la navegación
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + CONFIG.scrollOffset + 50;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            // Remueve clase active de todos los links
            navLinks.forEach(link => link.classList.remove('active'));

            // Añade clase active al link correspondiente
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// ===========================
// FILTROS DE PRODUCTOS
// ===========================

/**
 * Filtra productos por categoría
 * @param {string} category - Categoría a filtrar
 */
function filterProducts(category) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });

    // Actualiza botón activo
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${category}"]`).classList.add('active');
}

// ===========================
// FORMULARIO DE CONTACTO
// ===========================

/**
 * Valida el formulario de contacto
 * @param {FormData} formData - Datos del formulario
 * @returns {Object} Objeto con validación y errores
 */
function validateContactForm(formData) {
    const errors = {};
    let isValid = true;

    // Validación del nombre
    const name = formData.get('name').trim();
    if (!name || name.length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres';
        isValid = false;
    }

    // Validación del email
    const email = formData.get('email').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Por favor ingresa un email válido';
        isValid = false;
    }

    // Validación del mensaje
    const message = formData.get('message').trim();
    if (!message || message.length < 5) {
        errors.message = 'El mensaje debe tener al menos 5 caracteres';
        isValid = false;
    }

    // Validación del asunto
    const subject = formData.get('subject');
    if (!subject) {
        errors.subject = 'Por favor selecciona un asunto';
        isValid = false;
    }

    return { isValid, errors };
}

/**
 * Muestra errores de validación en el formulario
 * @param {Object} errors - Objeto con errores
 */
function showFormErrors(errors) {
    // Limpia errores previos
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('.form-group.error').forEach(group => group.classList.remove('error'));

    // Muestra nuevos errores
    Object.keys(errors).forEach(field => {
        const formGroup = document.querySelector(`#${field}`).closest('.form-group');
        formGroup.classList.add('error');

        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = errors[field];
        errorElement.style.color = 'var(--cube-red)';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.5rem';
        errorElement.style.display = 'block';

        formGroup.appendChild(errorElement);
    });
}

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} event - Evento de submit
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const validation = validateContactForm(formData);

    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }

    // Dispara la animación solo si es válido
    const sendBtn = document.getElementById('animatedSendBtn');
    if (sendBtn && !sendBtn.classList.contains('active')) {
        sendBtn.classList.add('active');
        let path = sendBtn.querySelector('.btn-layer path');
        let tl = gsap.timeline();
        tl.to(path, {
            morphSVG: 'M136,77.5h-1H4.8H4c-2.2,0-4-1.8-4-4v-47c0-2.2,1.8-4,4-4c0,0,0.6,0,0.9,0C44,22.5,66,10,66,10  s3,12.5,69.1,12.5c0.2,0,0.9,0,0.9,0c2.2,0,4,1.8,4,4v47C140,75.7,138.2,77.5,136,77.5z',
            duration: .3,
            delay: .3
        }).to(path, {
            morphSVG: 'M136,77.5c0,0-11.7,0-12,0c-90,0-94.2,0-94.2,0s-10.8,0-25.1,0c-0.2,0-0.8,0-0.8,0c-2.2,0-4-1.8-4-4v-47  c0-2.2,1.8-4,4-4c0,0,0.6,0,0.9,0c39.1,0,61.1,0,61.1,0s3,0,69.1,0c0.2,0,0.9,0,0.9,0c2.2,0,4,1.8,4,4v47  C140,75.7,138.2,77.5,136,77.5z',
            duration: 1.7,
            ease: 'elastic.out(1, .15)',
            onComplete() {
                sendBtn.classList.remove('active');
                // Envía el formulario realmente
                contactForm.submit();
            }
        });
    } else {
        // Envía el formulario si por alguna razón no hay animación
        contactForm.submit();
    }
}



/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--cube-green);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas fa-check-circle"></i> ${message}
        </div>
    `;

    document.body.appendChild(successDiv);

    // Remueve el mensaje después de 5 segundos
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// ===========================
// ANIMACIONES DE SCROLL
// ===========================

/**
 * Maneja las animaciones basadas en scroll
 */
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-reveal, .product-card, .feature-card, .level-card');

    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('revealed');
        }
    });

    // Efecto parallax simple para elementos flotantes
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-cube');

    parallaxElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
}

// ===========================
// EFECTOS VISUALES ADICIONALES
// ===========================

/**
 * Añade efecto de ripple a los botones
 * @param {Event} event - Evento click
 */
function addRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

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
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

/**
 * Maneja el comportamiento del cubo hero
 */
function handleHeroCube() {
    const heroSection = document.getElementById('inicio');
    const cube = document.querySelector('.cube-3d');

    if (!cube) return;

    // Pausa la animación cuando el usuario interactúa
    let isInteracting = false;

    heroSection.addEventListener('mouseenter', () => {
        if (!isInteracting) {
            cube.style.animationPlayState = 'paused';
            isInteracting = true;
        }
    });

    heroSection.addEventListener('mouseleave', () => {
        cube.style.animationPlayState = 'running';
        isInteracting = false;
    });

    // Control táctil para móviles
    heroSection.addEventListener('touchstart', () => {
        cube.style.animationPlayState = 'paused';
    });

    heroSection.addEventListener('touchend', () => {
        setTimeout(() => {
            cube.style.animationPlayState = 'running';
        }, 2000);
    });
}

/**
 * Añade efectos de hover mejorados a las cards
 */
function enhanceCardHovers() {
    const cards = document.querySelectorAll('.product-card, .feature-card, .level-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) rotateY(2deg)';
            this.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) rotateY(0)';
            this.style.boxShadow = '';
        });
    });
}

// ===========================
// EASTER EGG - sorpresa
// ===========================

/**
 * Konami Code para activar easter egg
 */
function initKonamiCode() {
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let userInput = [];

    document.addEventListener('keydown', (event) => {
        userInput.push(event.code);

        if (userInput.length > konamiCode.length) {
            userInput.shift();
        }

        if (userInput.join(',') === konamiCode.join(',')) {
            activateEasterEgg();
            userInput = [];
        }
    });
}

/**
 * Activa el easter egg del cubo virtual
 */
function activateEasterEgg() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 16px;
                max-width: 400px;
                animation: modalAppear 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <h2 style="color: var(--cube-red); margin-bottom: 1rem;">🎉 ¡Easter Egg Activado!</h2>
                <p style="margin-bottom: 1.5rem;">¡Felicidades! Has encontrado nuestro cubo virtual secreto.</p>
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHIyMXp2dmlxOTRhNm15MjB5MDRsbGo0bnJ6dWkzMTFjbzRzMGpjaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UqPhCdioYHmdq/giphy.gif" alt="Cubo Rubik animation" style="width:120px; margin-bottom:1.5rem; border-radius:12px;">
                <button onclick="this.closest('div[style]').remove()" style="
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 1rem;
                ">¡Genial!</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Dispara confeti
    if (window.confetti) {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.7 }
            });
        }, 1000);
    }

    // Auto-remove después de 10 segundos
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

// ===========================
// OPTIMIZACIÓN DE RENDIMIENTO
// ===========================

/**
 * Lazy loading para imágenes
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

/**
 * Precarga recursos críticos
 */
function preloadCriticalResources() {
    const criticalImages = [
        'https://images.pexels.com/photos/19670/pexels-photo.jpg',
        'https://images.pexels.com/photos/279315/pexels-photo-279315.jpeg'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// ===========================
// INICIALIZACIÓN Y EVENT LISTENERS
// ===========================

/**
 * Inicializa todos los event listeners
 */
function initEventListeners() {
    // Navegación
    window.addEventListener('scroll', throttle(handleNavbarScroll, 100));
    window.addEventListener('scroll', throttle(handleScrollAnimations, 100));

    // Menú hamburguesa
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Links de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            closeMobileMenu();
        });
    });

    // Scroll to top
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Filtros de productos
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterProducts(filter);
        });
    });

    // Formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Botones con efecto ripple
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', addRippleEffect);
    });

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                showSuccessMessage('¡Gracias por suscribirte a nuestro newsletter!');
                newsletterForm.reset();
            }
        });
    }
}

/**
 * Inicialización principal cuando el DOM está listo
 */
function init() {
    console.log('🎲 Aethercubix Website Initialized');

    // Inicializa componentes
    initEventListeners();
    handleNavbarScroll();
    handleScrollAnimations();
    handleHeroCube();
    enhanceCardHovers();
    initKonamiCode();
    initLazyLoading();
    preloadCriticalResources();

    // Muestra contenido con fade in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Log de desarrollo
    if (window.location.hostname === 'localhost') {
        console.log('🔧 Development mode active');
        console.log('💡 Try the Konami Code for a surprise!');
        console.log('⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');
    }
}

// ===========================
// SERVICE WORKER (PWA BÁSICO)
// ===========================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Por ahora comentado, se puede implementar después
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ===========================
// INICIALIZACIÓN
// ===========================

// Espera a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('🚨 Error en AetherCubix:', event.error);
});

// Previene comportamientos por defecto en ciertos elementos
document.addEventListener('dragstart', (event) => {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
    }
});

// Mejora la experiencia en iOS
document.addEventListener('touchstart', () => { }, { passive: true });