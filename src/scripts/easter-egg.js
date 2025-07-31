// Módulo de easter egg
export function initEasterEgg() {
    initKonamiCode()
}

function initKonamiCode() {
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ]
    let userInput = []
    
    document.addEventListener('keydown', (event) => {
        userInput.push(event.code)
        
        if (userInput.length > konamiCode.length) {
            userInput.shift()
        }
        
        if (userInput.join(',') === konamiCode.join(',')) {
            activateEasterEgg()
            userInput = []
        }
    })
}

function activateEasterEgg() {
    const modal = document.createElement('div')
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
                text-align: center;
                max-width: 400px;
                animation: modalAppear 0.3s ease;
            ">
                <h2 style="color: var(--cube-red); margin-bottom: 1rem;">🎉 ¡Easter Egg Activado!</h2>
                <p style="margin-bottom: 2rem;">¡Felicidades! Has encontrado nuestro cubo virtual secreto.</p>
                <div class="cube-3d" style="width: 150px; height: 150px; margin: 0 auto 2rem;"></div>
                <button onclick="this.closest('div').remove()" style="
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                ">¡Genial!</button>
            </div>
        </div>
    `
    
    document.body.appendChild(modal)
    
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove()
        }
    }, 10000)
}