import { databases, storage } from '../../scripts/services/appwrite.js';
import { ProductoService } from '../../scripts/services/productos.js';
import config from '../../scripts/config.js';
import { Query, ID } from 'appwrite';

// Variables globales (actualiza las existentes)
let currentProducts = [];
let filteredProducts = [];
let editingProductId = null;

// Variables de paginación
let currentPage = 1;
let itemsPerPage = 25;
let totalPages = 1;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initProductCRUD();
});

// Inicialización (actualiza la función existente)
async function initProductCRUD() {
    console.log('🔧 [Admin]: Inicializando CRUD de productos');
    
    // Cargar productos al inicio
    await loadProducts();
    
    // Cargar categorías dinámicamente
    await loadDynamicCategories();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar paginación
    setupPagination();
    
    console.log('✅ [Admin]: CRUD de productos inicializado');
}

// Actualiza setupEventListeners para usar debounce en la búsqueda
function setupEventListeners() {
    // Búsqueda de productos con debounce para mejor rendimiento
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
    
    // Filtro por categoría
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Formulario de producto
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
}

// Nueva función para configurar la paginación
function setupPagination() {
    // Event listener para cambiar items por página
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderProductsWithPagination();
        });
    }
    
    // Event listeners para botones de navegación
    document.getElementById('first-page')?.addEventListener('click', () => goToPage(1));
    document.getElementById('prev-page')?.addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('next-page')?.addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('last-page')?.addEventListener('click', () => goToPage(totalPages));
}

// Función para ir a una página específica
function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderProductsWithPagination();
    }
}

// Actualiza la función filterProducts existente
function filterProducts() {
    const searchTerm = document.getElementById('search-products')?.value.toLowerCase() || '';
    const selectedCategory = document.getElementById('filter-category')?.value || '';
    
    filteredProducts = currentProducts;
    
    // Filtrar por búsqueda
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm) ||
            (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => 
            product.categoria === selectedCategory
        );
    }
    
    // Resetear a la primera página después de filtrar
    currentPage = 1;
    
    // Renderizar con paginación
    renderProductsWithPagination();
    
    console.log(`🔍 [Admin]: Mostrando ${filteredProducts.length} de ${currentProducts.length} productos`);
}

// Nueva función para renderizar productos con paginación
function renderProductsWithPagination() {
    // Calcular paginación
    totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Asegurar que currentPage esté en rango válido
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    
    // Calcular productos para la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsForPage = filteredProducts.slice(startIndex, endIndex);
    
    // Renderizar productos
    renderProducts(productsForPage);
    
    // Actualizar controles de paginación
    updatePaginationControls();
}

// Nueva función para actualizar controles de paginación
function updatePaginationControls() {
    // Actualizar información de paginación
    const paginationInfo = document.getElementById('pagination-info-text');
    if (paginationInfo) {
        const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);
        paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${filteredProducts.length} productos`;
    }
    
    // Actualizar botones de navegación
    const firstBtn = document.getElementById('first-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const lastBtn = document.getElementById('last-page');
    
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generar números de página
    generatePageNumbers();
}

// Nueva función para generar números de página
function generatePageNumbers() {
    const paginationNumbers = document.getElementById('pagination-numbers');
    if (!paginationNumbers) return;
    
    paginationNumbers.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Determinar rango de páginas a mostrar
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Ajustar si estamos cerca del inicio o final
    if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    // Añadir primera página si no está en el rango
    if (startPage > 1) {
        addPageNumber(1);
        if (startPage > 2) {
            addPageEllipsis();
        }
    }
    
    // Añadir páginas en el rango
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
    }
    
    // Añadir última página si no está en el rango
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addPageEllipsis();
        }
        addPageNumber(totalPages);
    }
}

// Función auxiliar para añadir número de página
function addPageNumber(pageNum) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-number ${pageNum === currentPage ? 'active' : ''}`;
    pageBtn.textContent = pageNum;
    pageBtn.addEventListener('click', () => goToPage(pageNum));
    paginationNumbers.appendChild(pageBtn);
}

// Función auxiliar para añadir puntos suspensivos
function addPageEllipsis() {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    paginationNumbers.appendChild(ellipsis);
}

// Actualiza la función loadProducts existente
async function loadProducts() {
    try {
        console.log('📦 [Admin]: Cargando productos...');
        
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) return;
        
        // Mostrar estado de carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin"></i> Cargando productos...
                </td>
            </tr>
        `;
        
        // Obtener productos de Appwrite
        const response = await ProductoService.getAllProducts();
        currentProducts = response.documents || [];
        filteredProducts = [...currentProducts];
        
        console.log(`📦 [Admin]: ${currentProducts.length} productos cargados`);
        
        // Renderizar productos con paginación
        renderProductsWithPagination();
        
    } catch (error) {
        console.error('❌ [Admin]: Error cargando productos:', error);
        
        const tableBody = document.getElementById('products-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--cube-red);">
                        <i class="fas fa-exclamation-triangle"></i> Error cargando productos
                        <br><button class="btn btn-sm btn-primary" onclick="loadProducts()" style="margin-top: 1rem;">
                            <i class="fas fa-sync"></i> Reintentar
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Cargar categorías dinámicamente desde la base de datos
async function loadDynamicCategories() {
    try {
        console.log('📂 [Admin]: Cargando categorías dinámicas...');

        // Obtener categorías únicas de los productos existentes
        const uniqueCategories = [...new Set(currentProducts.map(product => product.categoria))].filter(Boolean);

        // Categorías base que siempre queremos mostrar
        const baseCategories = ['speedcube', 'megaminx', 'pyraminx', 'square1', 'accesorios'];

        // Combinar categorías base con las encontradas en la BD
        const allCategories = [...new Set([...baseCategories, ...uniqueCategories])];

        // Actualizar ambos selects (formulario y filtro)
        updateCategorySelects(allCategories);

        console.log('📂 [Admin]: Categorías cargadas:', allCategories);

    } catch (error) {
        console.error('❌ [Admin]: Error cargando categorías:', error);
        // Fallback a categorías estáticas si hay error
        const fallbackCategories = ['speedcube', 'megaminx', 'pyraminx', 'square1', 'accesorios'];
        updateCategorySelects(fallbackCategories);
    }
}

// Actualizar los selects de categorías
function updateCategorySelects(categories) {
    // Actualizar select del formulario modal
    const formCategorySelect = document.getElementById('product-category');
    if (formCategorySelect) {
        const currentValue = formCategorySelect.value; // Preservar selección actual

        formCategorySelect.innerHTML = `
            <option value="">Seleccionar categoría</option>
            ${categories.map(category => `
                <option value="${category}">${formatCategoryName(category)}</option>
            `).join('')}
            <option value="custom" style="color: #007bff; font-weight: bold;">+ Agregar nueva categoría</option>
        `;

        formCategorySelect.value = currentValue; // Restaurar selección

        // Configurar el event listener para categoría personalizada
        setupCustomCategoryHandler(formCategorySelect);
    }

    // Actualizar select del filtro (sin opción personalizada)
    const filterCategorySelect = document.getElementById('filter-category');
    if (filterCategorySelect) {
        const currentFilter = filterCategorySelect.value; // Preservar filtro actual

        filterCategorySelect.innerHTML = `
            <option value="">Todas las categorías</option>
            ${categories.map(category => `
                <option value="${category}">${formatCategoryName(category)}</option>
            `).join('')}
        `;

        filterCategorySelect.value = currentFilter; // Restaurar filtro
    }
}

// Configurar el manejador de categoría personalizada
function setupCustomCategoryHandler(selectElement) {
    // Remover listeners previos para evitar duplicados
    const newSelect = selectElement.cloneNode(true);
    selectElement.parentNode.replaceChild(newSelect, selectElement);

    // Agregar nuevo event listener
    newSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            handleCustomCategory(this);
        }
    });
}

// Manejar la creación de categoría personalizada (reemplazar la función existente)
async function handleCustomCategory(selectElement) {
    const newCategory = await showCustomPrompt(
        'Nueva Categoría',
        'Ingresa el nombre de la nueva categoría:',
        'Ej: Puzzle 4x4, Skewb, etc.'
    );

    if (newCategory && newCategory.trim()) {
        // Limpiar y formatear el nombre
        const categoryValue = newCategory.trim()
            .toLowerCase()
            .replace(/\s+/g, '_')      // Espacios -> guiones bajos
            .replace(/[^a-z0-9_]/g, ''); // Solo letras, números y guiones bajos

        if (categoryValue) {
            // Verificar si la categoría ya existe
            const existingOptions = Array.from(selectElement.options);
            const categoryExists = existingOptions.some(option =>
                option.value === categoryValue && option.value !== 'custom'
            );

            if (categoryExists) {
                showNotification('Esta categoría ya existe', 'error');
                selectElement.value = categoryValue; // Seleccionar la existente
                return;
            }

            // Crear nueva opción
            const newOption = document.createElement('option');
            newOption.value = categoryValue;
            newOption.textContent = formatCategoryName(categoryValue);
            newOption.selected = true;

            // Encontrar la opción "custom" y insertar antes de ella
            const customOption = selectElement.querySelector('option[value="custom"]');
            selectElement.insertBefore(newOption, customOption);

            console.log(`📂 [Admin]: Nueva categoría creada: ${categoryValue}`);

            // Mostrar notificación de éxito
            showNotification(`Categoría "${formatCategoryName(categoryValue)}" agregada exitosamente`, 'success');
        }
    } else {
        // Si el usuario cancela, volver a "Seleccionar categoría"
        selectElement.value = '';
    }
}

// Eliminar producto (versión corregida - reemplaza la función completa)
window.deleteProduct = async function (productId) {
    try {
        const product = currentProducts.find(p => p.$id === productId);

        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }

        console.log(`🗑️ [Admin]: Solicitando confirmación para eliminar producto: ${product.nombre}`);

        // Confirmar eliminación con modal personalizado
        const confirmed = await showCustomConfirm(
            'Eliminar Producto',
            `¿Estás seguro de que quieres eliminar "${product.nombre}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) {
            console.log('🗑️ [Admin]: Eliminación cancelada por el usuario');
            return; // Usuario canceló
        }

        console.log(`🗑️ [Admin]: Confirmación recibida, eliminando producto ${productId}`);

        // Mostrar indicador de carga en el botón
        const deleteBtn = document.querySelector(`button[onclick="deleteProduct('${productId}')"]`);
        let originalHTML = '';

        if (deleteBtn) {
            originalHTML = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteBtn.disabled = true;
        }

        try {
            // Eliminar de Appwrite
            await databases.deleteDocument(
                config.databaseId,
                config.collectionId,
                productId
            );

            console.log('✅ [Admin]: Producto eliminado exitosamente de Appwrite');

            // Actualizar lista local
            currentProducts = currentProducts.filter(p => p.$id !== productId);

            // Re-renderizar productos
            filterProducts();

            showNotification('Producto eliminado exitosamente', 'success');

        } catch (deleteError) {
            console.error('❌ [Admin]: Error eliminando de Appwrite:', deleteError);
            showNotification('Error al eliminar producto de la base de datos', 'error');

            // Restaurar botón en caso de error
            if (deleteBtn) {
                deleteBtn.innerHTML = originalHTML;
                deleteBtn.disabled = false;
            }
        }

    } catch (error) {
        console.error('❌ [Admin]: Error en deleteProduct:', error);
        showNotification('Error inesperado al eliminar producto', 'error');
    }
}

// Renderizar productos en la tabla
function renderProducts(products) {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-box-open"></i> No hay productos disponibles
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr data-product-id="${product.$id}">
            <td>
                <img src="${product.imagen || 'https://via.placeholder.com/50x50?text=Sin+Imagen'}" 
                     alt="${product.nombre}" 
                     onerror="this.src='https://via.placeholder.com/50x50?text=Sin+Imagen'">
            </td>
            <td>
                <strong>${product.nombre}</strong>
                ${product.descripcion ? `<br><small style="color: #6c757d;">${product.descripcion.substring(0, 50)}${product.descripcion.length > 50 ? '...' : ''}</small>` : ''}
            </td>
            <td>
                <span class="category-badge category-${product.categoria}">
                    ${formatCategoryName(product.categoria)}
                </span>
            </td>
            <td>
                <strong>Q ${parseFloat(product.precio || 0).toFixed(2)}</strong>
            </td>
            <td>
                <span class="stock-badge ${getStockClass(product.existencia)}">
                    ${product.existencia || 0}
                </span>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn btn-sm btn-edit" onclick="editProduct('${product.$id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteProduct('${product.$id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}


// Abrir modal para nuevo producto
window.openAddProductModal = function () {
    editingProductId = null;
    document.getElementById('modal-title').textContent = 'Nuevo Producto';
    document.getElementById('save-product-btn').innerHTML = '<i class="fas fa-save"></i> Guardar';

    // Limpiar formulario
    const form = document.getElementById('product-form');
    form.reset();

    // Mostrar modal
    document.getElementById('product-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Editar producto
window.editProduct = async function (productId) {
    try {
        console.log(`✏️ [Admin]: Editando producto ${productId}`);

        // Buscar el producto en el array actual
        const product = currentProducts.find(p => p.$id === productId);

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        editingProductId = productId;
        document.getElementById('modal-title').textContent = 'Editar Producto';
        document.getElementById('save-product-btn').innerHTML = '<i class="fas fa-save"></i> Actualizar';

        // Llenar formulario con datos del producto
        document.getElementById('product-name').value = product.nombre || '';
        document.getElementById('product-description').value = product.descripcion || '';
        document.getElementById('product-price').value = product.precio || '';
        document.getElementById('product-stock').value = product.existencia || '';
        document.getElementById('product-category').value = product.categoria || '';
        document.getElementById('product-image').value = product.imagen || '';

        // Mostrar modal
        document.getElementById('product-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('❌ [Admin]: Error editando producto:', error);
        showNotification('Error al cargar producto para editar', 'error');
    }
}



// Manejar envío del formulario
async function handleProductSubmit(e) {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const productData = {
            nombre: formData.get('name').trim(),
            descripcion: formData.get('description').trim(),
            precio: parseFloat(formData.get('price')),
            existencia: parseInt(formData.get('stock')) || 0,
            categoria: formData.get('category'),
            imagen: formData.get('image').trim()
        };

        // Validaciones básicas
        if (!productData.nombre) {
            throw new Error('El nombre del producto es requerido');
        }

        if (!productData.precio || productData.precio <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }

        if (!productData.categoria) {
            throw new Error('La categoría es requerida');
        }

        // Deshabilitar botón durante la operación
        const saveBtn = document.getElementById('save-product-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;

        let result;

        if (editingProductId) {
            // Actualizar producto existente
            console.log(`📝 [Admin]: Actualizando producto ${editingProductId}`);

            result = await databases.updateDocument(
                config.databaseId,
                config.collectionId,
                editingProductId,
                productData
            );

            // Actualizar en la lista local
            const index = currentProducts.findIndex(p => p.$id === editingProductId);
            if (index !== -1) {
                currentProducts[index] = result;
            }

            showNotification('Producto actualizado exitosamente', 'success');

        } else {
            // Crear nuevo producto
            console.log('➕ [Admin]: Creando nuevo producto');

            result = await databases.createDocument(
                config.databaseId,
                config.collectionId,
                ID.unique(),
                productData
            );

            // Agregar a la lista local
            currentProducts.push(result);

            showNotification('Producto creado exitosamente', 'success');
        }

        console.log('✅ [Admin]: Operación exitosa:', result);

        // Cerrar modal y actualizar vista
        closeProductModal();
        filterProducts();

    } catch (error) {
        console.error('❌ [Admin]: Error guardando producto:', error);
        showNotification(error.message || 'Error al guardar producto', 'error');
    } finally {
        // Restaurar botón
        const saveBtn = document.getElementById('save-product-btn');
        saveBtn.innerHTML = editingProductId ? '<i class="fas fa-save"></i> Actualizar' : '<i class="fas fa-save"></i> Guardar';
        saveBtn.disabled = false;
    }
}

// Cerrar modal
window.closeProductModal = function () {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingProductId = null;

    // Limpiar formulario
    document.getElementById('product-form').reset();
}

// Funciones para categoria
function formatCategoryName(category) {
    // Mapeo para categorías específicas que necesitan formato especial
    const specialCategoryNames = {
        'square': 'Square',
        'pyraminx': 'Pyraminx',
        'megaminx': 'Megaminx',
        'speedcube': 'Speedcube'
    };

    // Si es una categoría especial, usar su mapeo
    if (specialCategoryNames[category]) {
        return specialCategoryNames[category];
    }

    // Para nuevas categorías, formatear automáticamente
    return category
        .replace(/_/g, ' ')           // "puzzle_4x4" -> "puzzle 4x4"
        .replace(/-/g, ' ')           // "puzzle-4x4" -> "puzzle 4x4"  
        .split(' ')                   // ["puzzle", "4x4"]
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // ["Puzzle", "4x4"]
        .join(' ');                   // "Puzzle 4x4"
}

function getStockClass(existencia) {
    if (existencia <= 0) return 'stock-out';
    if (existencia <= 5) return 'stock-low';
    return 'stock-good';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        ">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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

// Funciones para modales personalizados
function showCustomConfirm(title, message, onConfirm, onCancel = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const cancelBtn = document.getElementById('confirm-cancel');
        const acceptBtn = document.getElementById('confirm-accept');

        titleEl.textContent = title;
        messageEl.textContent = message;

        // Mostrar modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Función para cerrar modal
        const closeModal = () => {
            modal.style.animation = 'modalSlideOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
                document.body.style.overflow = 'auto';
            }, 300);
        };

        // Event listeners (remover listeners previos)
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newAcceptBtn = acceptBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);

        // Cancelar
        newCancelBtn.addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
            resolve(false);
        });

        // Confirmar
        newAcceptBtn.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
            resolve(true);
        });

        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                if (onCancel) onCancel();
                resolve(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                if (onCancel) onCancel();
                resolve(false);
            }
        });
    });
}

function showCustomPrompt(title, message, placeholder = '', defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-prompt-modal');
        const titleEl = document.getElementById('prompt-title');
        const messageEl = document.getElementById('prompt-message');
        const inputEl = document.getElementById('prompt-input');
        const cancelBtn = document.getElementById('prompt-cancel');
        const acceptBtn = document.getElementById('prompt-accept');

        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.placeholder = placeholder;
        inputEl.value = defaultValue;

        // Mostrar modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Enfocar input después de un pequeño delay
        setTimeout(() => {
            inputEl.focus();
            inputEl.select();
        }, 100);

        // Función para cerrar modal
        const closeModal = () => {
            modal.style.animation = 'modalSlideOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
                document.body.style.overflow = 'auto';
            }, 300);
        };

        // Event listeners (remover listeners previos)
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newAcceptBtn = acceptBtn.cloneNode(true);
        const newInputEl = inputEl.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
        inputEl.parentNode.replaceChild(newInputEl, inputEl);

        // Actualizar referencias
        const currentInput = document.getElementById('prompt-input');

        // Cancelar
        newCancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(null);
        });

        // Aceptar
        const acceptAction = () => {
            const value = currentInput.value.trim();
            closeModal();
            resolve(value || null);
        };

        newAcceptBtn.addEventListener('click', acceptAction);

        // Enter para aceptar
        currentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                acceptAction();
            }
        });

        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                resolve(null);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                resolve(null);
            }
        });
    });
}

// Exponer funciones globalmente para el HTML
window.loadProducts = loadProducts;
window.filterProducts = filterProducts;