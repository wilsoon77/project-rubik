/* ===========================
   JAVASCRIPT PRINCIPAL - AetherCubix
   Funcionalidad interactiva para el sitio web
   ========================== */

// ===========================
// IMPORTS - AGREGAR CARRITO SERVICE
// ===========================
import { databases } from './services/appwrite.js';
import { CONFIG } from './services/appwrite.js';
import { ProductoService } from './services/productos.js';
import { authService } from './services/auth.js';
import { carritoService } from './services/carrito.js'; // ✅ AGREGAR ESTA LÍNEA

// ===========================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ===========================
const UI_CONFIG = { // ← Renombrado para evitar conflicto
    scrollOffset: 100,
    animationDelay: 100,
    debounceDelay: 250,
    transitionDuration: 300
};

// Variables de paginación para productos
let currentProductPage = 1;
let itemsPerProductPage = 12;
let totalProductPages = 1;
let allProducts = [];
let filteredProductsArray = [];

// Al inicio del archivo, después de la configuración
const DEBUG = window.location.hostname === 'localhost';

function log(...args) {
    if (DEBUG) {
        console.log('🎲 [AetherCubix]:', ...args);
    }
}

// Elementos DOM principales
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollToTopBtn = document.getElementById('scrollToTop');
const contactForm = document.getElementById('contactForm');

// ===========================
// INICIALIZACIÓN PRINCIPAL - ACTUALIZADA
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [App]: Inicializando aplicación');
    
    // Inicializar autenticación PRIMERO
    await authService.inicializar();
    
    // ✅ CARGAR CARRITO DESPUÉS DE AUTH
    if (await authService.estaAutenticado()) {
        await carritoService.cargarCarritoDesdeDB();
    }
    
    // Luego inicializar el resto
    init();
});

// ===========================
// UTILIDADES
// ===========================

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

function smoothScrollTo(targetId, offset = 0) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const targetPosition = targetElement.offsetTop - UI_CONFIG.scrollOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

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

function handleNavbarScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    if (scrollY > 500) {
        scrollToTopBtn?.classList.add('visible');
    } else {
        scrollToTopBtn?.classList.remove('visible');
    }
}

function toggleMobileMenu() {
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

function closeMobileMenu() {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    document.body.classList.remove('menu-open');
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + UI_CONFIG.scrollOffset + 50;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// ===========================
// CARGA DE PRODUCTOS - CORREGIDA
// ===========================

/**
 * Función para cargar productos desde la base de datos - CORREGIDA
 */
async function loadProductsFromDB() {
    try {
        console.log('🎲 [AetherCubix]: Cargando productos desde Appwrite...');

        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        // Mostrar estado de carga
        productsGrid.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 4rem 0; grid-column: 1 / -1;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--cube-red); margin-bottom: 1rem;"></i>
                <p style="color: white; font-size: 1.2rem;">Cargando productos...</p>
            </div>
        `;

        // CORREGIDO: Usar CONFIG importado
        const response = await databases.listDocuments(
            CONFIG.databaseId,           // ← Usando CONFIG importado
            CONFIG.collections.producto,  // ← Usando CONFIG importado
            []  // Sin queries por ahora
        );

        allProducts = response.documents || [];
        filteredProductsArray = [...allProducts];

        console.log(`🎲 [AetherCubix]: ${allProducts.length} productos cargados`);

        // Cargar filtros dinámicos
        await loadDynamicFilters();

        // Configurar paginación
        setupProductPagination();

        // Renderizar productos con paginación
        renderProductsWithPagination();

    } catch (error) {
        console.error('🎲 [AetherCubix]: Error cargando productos:', error);

        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 4rem 0; grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--cube-red); margin-bottom: 1rem;"></i>
                    <p style="color: white; font-size: 1.2rem; margin-bottom: 1rem;">Error al cargar productos</p>
                    <button onclick="loadProductsFromDB()" class="btn btn-primary">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ===========================
// PAGINACIÓN DE PRODUCTOS
// ===========================

/**
 * Función para configurar la paginación de productos
 */
function setupProductPagination() {
    // Event listener para cambiar items por página
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            itemsPerProductPage = value === '48' ? 999 : parseInt(value);
            currentProductPage = 1;
            renderProductsWithPagination();
        });
    }

    // Event listeners para botones de navegación
    document.getElementById('first-page')?.addEventListener('click', () => goToProductPage(1));
    document.getElementById('prev-page')?.addEventListener('click', () => goToProductPage(currentProductPage - 1));
    document.getElementById('next-page')?.addEventListener('click', () => goToProductPage(currentProductPage + 1));
    document.getElementById('last-page')?.addEventListener('click', () => goToProductPage(totalProductPages));
}

/**
 * Función para ir a una página específica de productos
 */
function goToProductPage(page) {
    if (page >= 1 && page <= totalProductPages && page !== currentProductPage) {
        currentProductPage = page;
        renderProductsWithPagination();

        // Scroll suave hacia los productos
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

/**
 * Nueva función para renderizar productos con paginación
 */
function renderProductsWithPagination() {
    // Calcular paginación
    totalProductPages = Math.ceil(filteredProductsArray.length / itemsPerProductPage);

    // Asegurar que currentProductPage esté en rango válido
    if (currentProductPage > totalProductPages && totalProductPages > 0) {
        currentProductPage = totalProductPages;
    }
    if (currentProductPage < 1) {
        currentProductPage = 1;
    }

    // Calcular productos para la página actual
    const startIndex = (currentProductPage - 1) * itemsPerProductPage;
    const endIndex = startIndex + itemsPerProductPage;
    const productsForPage = filteredProductsArray.slice(startIndex, endIndex);

    // Renderizar productos
    displayProducts(productsForPage);

    // Actualizar controles de paginación
    updateProductPaginationControls();
}

/**
 * Nueva función para actualizar controles de paginación
 */
function updateProductPaginationControls() {
    // Actualizar información de paginación
    const paginationInfo = document.getElementById('pagination-info-text');
    if (paginationInfo) {
        const startItem = filteredProductsArray.length === 0 ? 0 : (currentProductPage - 1) * itemsPerProductPage + 1;
        const endItem = Math.min(currentProductPage * itemsPerProductPage, filteredProductsArray.length);
        paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${filteredProductsArray.length} productos`;
    }

    // Actualizar botones de navegación
    const firstBtn = document.getElementById('first-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const lastBtn = document.getElementById('last-page');

    if (firstBtn) firstBtn.disabled = currentProductPage === 1;
    if (prevBtn) prevBtn.disabled = currentProductPage === 1;
    if (nextBtn) nextBtn.disabled = currentProductPage === totalProductPages || totalProductPages === 0;
    if (lastBtn) lastBtn.disabled = currentProductPage === totalProductPages || totalProductPages === 0;

    // Generar números de página
    generateProductPageNumbers();
}

/**
 * Nueva función para generar números de página
 */
function generateProductPageNumbers() {
    const paginationNumbers = document.getElementById('pagination-numbers');
    if (!paginationNumbers) return;

    paginationNumbers.innerHTML = '';

    if (totalProductPages <= 1) return;

    // Determinar rango de páginas a mostrar
    let startPage = Math.max(1, currentProductPage - 2);
    let endPage = Math.min(totalProductPages, currentProductPage + 2);

    // Ajustar si estamos cerca del inicio o final
    if (currentProductPage <= 3) {
        endPage = Math.min(totalProductPages, 5);
    }
    if (currentProductPage >= totalProductPages - 2) {
        startPage = Math.max(1, totalProductPages - 4);
    }

    // Añadir primera página si no está en el rango
    if (startPage > 1) {
        addProductPageNumber(1);
        if (startPage > 2) {
            addProductPageEllipsis();
        }
    }

    // Añadir páginas en el rango
    for (let i = startPage; i <= endPage; i++) {
        addProductPageNumber(i);
    }

    // Añadir última página si no está en el rango
    if (endPage < totalProductPages) {
        if (endPage < totalProductPages - 1) {
            addProductPageEllipsis();
        }
        addProductPageNumber(totalProductPages);
    }
}

/**
 * Función auxiliar para añadir número de página
 */
function addProductPageNumber(pageNum) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-number ${pageNum === currentProductPage ? 'active' : ''}`;
    pageBtn.textContent = pageNum;
    pageBtn.addEventListener('click', () => goToProductPage(pageNum));
    paginationNumbers.appendChild(pageBtn);
}

/**
 * Función auxiliar para añadir puntos suspensivos
 */
function addProductPageEllipsis() {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    paginationNumbers.appendChild(ellipsis);
}

// ===========================
// FILTROS DE PRODUCTOS
// ===========================

/**
 * Filtra productos por categoría con paginación
 * @param {string} category - Categoría a filtrar
 */
async function filterProducts(category) {
    try {
        console.log('🎲 [AetherCubix]: Aplicando filtro:', category);

        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Filtrar productos
        if (category === 'all') {
            filteredProductsArray = [...allProducts];
        } else {
            filteredProductsArray = allProducts.filter(product => product.categoria === category);
        }

        // Resetear a la primera página después de filtrar
        currentProductPage = 1;

        // Renderizar con paginación
        renderProductsWithPagination();

        console.log(`🎲 [AetherCubix]: Mostrando ${filteredProductsArray.length} de ${allProducts.length} productos`);

    } catch (error) {
        console.error('🎲 [AetherCubix]: Error filtrando productos:', error);
    }
}

/**
 * Inicializa filtros dinámicos basados en productos de la base de datos
 */
async function loadDynamicFilters() {
    try {
        console.log('🎲 [AetherCubix]: Cargando filtros dinámicos...');
        const filterContainer = document.querySelector('.product-filters');

        if (!filterContainer) {
            console.log('🎲 [AetherCubix]: Contenedor de filtros no encontrado, omitiendo...');
            return;
        }

        // Obtener categorías únicas de los productos cargados
        const categories = ['all', ...new Set(allProducts.map(product => product.categoria))].filter(Boolean);

        console.log('🎲 [AetherCubix]: Categorías encontradas:', categories);

        // Mapeo de nombres de categorías
        const categoryNames = {
            'all': 'Todos',
            'speedcube': 'Speedcube',
            'megaminx': 'Megaminx',
            'pyraminx': 'Pyraminx',
            'square1': 'Square-1',
            'accesorios': 'Accesorios'
        };

        // Crear botones de filtro
        filterContainer.innerHTML = categories.map(category => `
            <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                    data-filter="${category}">
                ${categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `).join('');

        // Añadir event listeners a los botones
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterProducts(button.getAttribute('data-filter'));
            });
        });

    } catch (error) {
        console.error('🎲 [AetherCubix]: Error cargando filtros dinámicos:', error);
    }
}

/**
 * Función para mostrar productos en el grid
 */
function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="text-align: center; padding: 3rem 0; grid-column: 1 / -1;">
                <i class="fas fa-cube" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: white;">No hay productos disponibles en esta categoría.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

/**
 * Función para crear card de producto con botón de carrito (CORREGIDA)
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.categoria);
    card.setAttribute('data-product-id', product.$id);

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}" 
                 alt="${product.nombre}"
                 onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'">
            ${product.existencia <= 5 ? '<span class="stock-badge">Stock Bajo</span>' : ''}
        </div>
        <div class="product-info">
            <h3>${product.nombre}</h3>
            <p>${product.descripcion || 'Sin descripción disponible'}</p>
            <div class="product-price">Q ${parseFloat(product.precio || 0).toFixed(2)}</div>
            <div class="product-stock">Stock: ${product.existencia || 0}</div>
            
            <div class="product-actions">
                ${product.existencia > 0 ?
            `<button class="add-to-cart-btn" 
                             onclick="addToCart('${product.$id}', '${product.nombre}', ${product.precio}, '${product.imagen || ''}', ${product.existencia})"
                             data-product-id="${product.$id}">
                        <i class="fas fa-cart-plus"></i> Añadir al Carrito
                    </button>` :
            `<button class="add-to-cart-btn" disabled>
                        <i class="fas fa-times"></i> Sin Stock
                    </button>`
        }
            </div>
        </div>
    `;

    return card;
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
        const formGroup = document.querySelector(`#${field}`)?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');

            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errors[field];
            errorElement.style.color = 'var(--cube-red)';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '0.5rem';
            errorElement.style.display = 'block';

            formGroup.appendChild(errorElement);
        }
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
        if (path && window.gsap) {
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
            contactForm.submit();
        }
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

    heroSection?.addEventListener('mouseenter', () => {
        if (!isInteracting) {
            cube.style.animationPlayState = 'paused';
            isInteracting = true;
        }
    });

    heroSection?.addEventListener('mouseleave', () => {
        cube.style.animationPlayState = 'running';
        isInteracting = false;
    });

    // Control táctil para móviles
    heroSection?.addEventListener('touchstart', () => {
        cube.style.animationPlayState = 'paused';
    });

    heroSection?.addEventListener('touchend', () => {
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

    if ('IntersectionObserver' in window) {
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
}

/**
 * Precarga recursos críticos
 */
function preloadCriticalResources() {
    const criticalImages = [
        // Agregar aquí URLs de imágenes críticas si las tienes
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

// ===========================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ===========================

/**
 * Función principal de inicialización
 */
function init() {
    console.log('🎲 Aethercubix Website Initialized');

    // Inicialización de componentes generales
    initEventListeners();
    handleNavbarScroll();
    handleScrollAnimations();
    handleHeroCube();
    enhanceCardHovers();
    initKonamiCode();
    initLazyLoading();
    preloadCriticalResources();

    // Verifica la página actual
    const currentPath = window.location.pathname;
    if (currentPath.includes('productos') ||
        currentPath.endsWith('/productos.html')) {

        console.log('🎲 [AetherCubix]: Página de productos detectada');
        loadProductsFromDB();
    }

    // Event listeners de conexión
    window.addEventListener('online', () => {
        log('Conexión restaurada');
        showSuccessMessage('Conexión restaurada');
    });

    window.addEventListener('offline', () => {
        log('Conexión perdida');
        showSuccessMessage('Conexión perdida', 'warning');
    });

    // Animación de fade in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Logs de desarrollo
    if (DEBUG) {
        console.log('🔧 Development mode active');
        console.log('💡 Try the Konami Code for a surprise!');
        console.log('⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');

        // Monitoreo de rendimiento
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        log(`Página cargada en ${pageLoadTime}ms`);
    }
}

// ===========================
// MODAL DE AUTENTICACIÓN
// ===========================

/**
 * Mostrar modal de autenticación
 */
window.showAuthModal = function () {
    const modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
        <div class="auth-modal">
            <div class="auth-header">
                <h3 id="auth-title">Iniciar Sesión</h3>
                <button class="close-btn" onclick="closeAuthModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="auth-content">
                <form id="auth-form" class="auth-form">
                    <div class="form-group" id="nombre-group" style="display: none;">
                        <label for="nombre">Nombre Completo</label>
                        <input type="text" id="nombre" name="nombre" placeholder="Tu nombre completo">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="tu@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" required placeholder="Tu contraseña" minlength="8">
                    </div>
                    
                    <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
                        Iniciar Sesión
                    </button>
                </form>
                
                <div class="auth-toggle">
                    <p id="auth-toggle-text">¿No tienes cuenta? 
                        <button type="button" id="auth-toggle-btn" onclick="toggleAuthMode()">Regístrate</button>
                    </p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Manejar envío del formulario
    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
};

/**
 * Cerrar modal de autenticación
 */
window.closeAuthModal = function () {
    const modal = document.querySelector('.auth-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

/**
 * Alternar entre login y registro
 */
let esModoLogin = true;
window.toggleAuthMode = function () {
    esModoLogin = !esModoLogin;

    const title = document.getElementById('auth-title');
    const nombreGroup = document.getElementById('nombre-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('auth-toggle-btn');

    if (esModoLogin) {
        title.textContent = 'Iniciar Sesión';
        nombreGroup.style.display = 'none';
        submitBtn.textContent = 'Iniciar Sesión';
        toggleText.innerHTML = '¿No tienes cuenta? ';
        toggleBtn.textContent = 'Regístrate';
    } else {
        title.textContent = 'Crear Cuenta';
        nombreGroup.style.display = 'block';
        submitBtn.textContent = 'Crear Cuenta';
        toggleText.innerHTML = '¿Ya tienes cuenta? ';
        toggleBtn.textContent = 'Inicia Sesión';
    }
};

/**
 * Manejar envío del formulario de auth
 */
async function handleAuthSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('auth-submit-btn');
    const textoOriginal = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const nombre = formData.get('nombre');

        if (esModoLogin) {
            await authService.iniciarSesion(email, password);
            mostrarNotificacion('¡Bienvenido de vuelta!', 'success');
        } else {
            if (!nombre) {
                throw new Error('El nombre es requerido');
            }
            await authService.registrar(email, password, nombre);
            mostrarNotificacion('¡Cuenta creada exitosamente!', 'success');
        }

        closeAuthModal();

        // Recargar página para actualizar UI
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error('❌ [Auth]: Error en formulario:', error);
        let mensaje = 'Error en la autenticación';

        if (error.message.includes('Invalid email')) {
            mensaje = 'Email inválido';
        } else if (error.message.includes('Password should be at least 8 characters')) {
            mensaje = 'La contraseña debe tener al menos 8 caracteres';
        } else if (error.message.includes('user already exists')) {
            mensaje = 'Este email ya está registrado';
        } else if (error.message.includes('Invalid credentials')) {
            mensaje = 'Email o contraseña incorrectos';
        }

        mostrarNotificacion(mensaje, 'error');
    } finally {
        submitBtn.textContent = textoOriginal;
        submitBtn.disabled = false;
    }
}

/**
 * Mostrar notificaciones
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacionExistente = document.querySelector('.notification');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;

    const iconos = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    notification.innerHTML = `
        <i class="fas fa-${iconos[tipo] || 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;

    const colores = {
        success: '#00b894',
        error: '#e17055',
        warning: '#fdcb6e',
        info: '#74b9ff'
    };

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colores[tipo]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===========================
// FUNCIÓN DE CARRITO - CORREGIDA
// ===========================
window.addToCart = async function(productId, nombre, precio, imagen, stock) {
    try {
        console.log('🛒 [Carrito]: Añadiendo producto:', { productId, nombre, precio, imagen, stock });
        
        // Verificar si el usuario está logueado
        const usuario = await authService.obtenerUsuarioActual();
        if (!usuario) {
            mostrarNotificacion('Debes iniciar sesión para añadir productos al carrito', 'warning');
            showAuthModal();
            return;
        }

        // ✅ AHORA carritoService ESTÁ DISPONIBLE
        await carritoService.agregarProducto(productId, nombre, precio, imagen, stock);
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`${nombre} añadido al carrito`, 'success');
        
        // Efecto visual en el botón
        const btn = document.querySelector(`[data-product-id="${productId}"]`);
        if (btn) {
            btn.classList.add('pulse');
            setTimeout(() => btn.classList.remove('pulse'), 300);
        }
        
    } catch (error) {
        console.error('❌ [Carrito]: Error:', error);
        mostrarNotificacion(error.message || 'Error añadiendo producto al carrito', 'error');
    }
};

// Exponer funciones globalmente para uso en HTML
window.loadProductsFromDB = loadProductsFromDB;
window.filterProducts = filterProducts;