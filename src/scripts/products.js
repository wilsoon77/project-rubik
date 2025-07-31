// Módulo de filtros de productos
export function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn')
    const productCards = document.querySelectorAll('.product-card')
    
    if (filterButtons.length === 0) return
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter')
            filterProducts(filter, productCards, filterButtons)
        })
    })
}

function filterProducts(category, productCards, filterButtons) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category')
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block'
            card.style.animation = 'fadeInUp 0.5s ease forwards'
        } else {
            card.style.display = 'none'
        }
    })
    
    // Actualizar botón activo
    filterButtons.forEach(btn => btn.classList.remove('active'))
    document.querySelector(`[data-filter="${category}"]`)?.classList.add('active')
}