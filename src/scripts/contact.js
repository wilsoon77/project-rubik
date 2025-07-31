// Módulo de formulario de contacto
export function initContactForm() {
    const contactForm = document.getElementById('contactForm')
    const newsletterForm = document.querySelector('.newsletter-form')
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit)
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit)
    }
}

function validateContactForm(formData) {
    const errors = {}
    let isValid = true
    
    const name = formData.get('name')?.trim()
    if (!name || name.length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres'
        isValid = false
    }
    
    const email = formData.get('email')?.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Por favor ingresa un email válido'
        isValid = false
    }
    
    const message = formData.get('message')?.trim()
    if (!message || message.length < 10) {
        errors.message = 'El mensaje debe tener al menos 10 caracteres'
        isValid = false
    }
    
    const subject = formData.get('subject')
    if (!subject) {
        errors.subject = 'Por favor selecciona un asunto'
        isValid = false
    }
    
    return { isValid, errors }
}

function showFormErrors(errors) {
    document.querySelectorAll('.error-message').forEach(error => error.remove())
    document.querySelectorAll('.form-group.error').forEach(group => group.classList.remove('error'))
    
    Object.keys(errors).forEach(field => {
        const formGroup = document.querySelector(`#${field}`)?.closest('.form-group')
        if (formGroup) {
            formGroup.classList.add('error')
            
            const errorElement = document.createElement('span')
            errorElement.className = 'error-message'
            errorElement.textContent = errors[field]
            errorElement.style.cssText = `
                color: var(--cube-red);
                font-size: 0.8rem;
                margin-top: 0.5rem;
                display: block;
            `
            
            formGroup.appendChild(errorElement)
        }
    })
}

function handleFormSubmit(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const validation = validateContactForm(formData)
    
    if (!validation.isValid) {
        showFormErrors(validation.errors)
        return
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]')
    const originalText = submitButton.innerHTML
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'
    submitButton.disabled = true
    
    setTimeout(() => {
        submitButton.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje Enviado!'
        submitButton.style.background = 'var(--cube-green)'
        
        event.target.reset()
        
        setTimeout(() => {
            submitButton.innerHTML = originalText
            submitButton.disabled = false
            submitButton.style.background = ''
        }, 3000)
        
        showSuccessMessage('¡Gracias por tu mensaje! Te responderemos pronto.')
    }, 2000)
}

function handleNewsletterSubmit(event) {
    event.preventDefault()
    const email = event.target.querySelector('input[type="email"]').value
    if (email) {
        showSuccessMessage('¡Gracias por suscribirte a nuestro newsletter!')
        event.target.reset()
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div')
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
    `
    
    document.body.appendChild(successDiv)
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease'
        setTimeout(() => successDiv.remove(), 300)
    }, 5000)
}