// Completar la función de descarga CSV que está cortada

/**
 * Descargar CSV para Power BI
 */
function downloadPowerBICSV(fromDate, toDate) {
    // Crear archivos ZIP con CSVs
    console.log('📊 [PowerBI]: Generando archivos CSV...');
    
    // En una implementación real, esto generaría CSVs reales desde los datos
    // Por ahora, simular descarga
    const filename = `aethercubix-data-${formatDateForFilename(fromDate)}-${formatDateForFilename(toDate)}.zip`;
    
    mostrarNotificacion('Archivos CSV generados correctamente', 'success');
    
    // Simular descarga
    simulateFileDownload(filename, 'zip');
    
    // Registrar evento de exportación
    console.log(`✅ [PowerBI]: Exportación CSV completada (${formatDateRange(fromDate, toDate)})`);
}

/**
 * Descargar Excel para Power BI
 */
function downloadPowerBIExcel(fromDate, toDate) {
    console.log('📊 [PowerBI]: Generando archivo Excel...');
    
    // En una implementación real, esto generaría un Excel real
    const filename = `aethercubix-data-${formatDateForFilename(fromDate)}-${formatDateForFilename(toDate)}.xlsx`;
    
    mostrarNotificacion('Archivo Excel generado correctamente', 'success');
    
    // Simular descarga
    simulateFileDownload(filename, 'excel');
    
    // Registrar evento
    console.log(`✅ [PowerBI]: Exportación Excel completada (${formatDateRange(fromDate, toDate)})`);
}

/**
 * Mostrar configuración para API de Power BI
 */
function showPowerBIAPIConfig() {
    console.log('📊 [PowerBI]: Mostrando configuración de API...');
    
    // Crear modal de configuración
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'powerbi-api-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Conexión de Datos en Vivo</h3>
                <button class="modal-close" onclick="closePowerBIAPIModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="api-connection-info">
                    <h4>URL del API</h4>
                    <div class="api-url">
                        <code>https://api.aethercubix.com/v1/analytics/data</code>
                        <button class="btn-icon" onclick="copyToClipboard('https://api.aethercubix.com/v1/analytics/data')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    
                    <h4>Credenciales de Acceso</h4>
                    <div class="api-credentials">
                        <div>
                            <label>API Key:</label>
                            <div class="credential-field">
                                <input type="password" value="sk_live_aethercubix_analytics_12345" readonly>
                                <button class="btn-icon" onclick="togglePasswordVisibility(this.previousElementSibling)">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="copyToClipboard('sk_live_aethercubix_analytics_12345')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label>API Secret:</label>
                            <div class="credential-field">
                                <input type="password" value="AC_secret_key_01234567890abcdef" readonly>
                                <button class="btn-icon" onclick="togglePasswordVisibility(this.previousElementSibling)">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="copyToClipboard('AC_secret_key_01234567890abcdef')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-instructions">
                        <h4>Instrucciones</h4>
                        <ol>
                            <li>Abre Power BI Desktop</li>
                            <li>Selecciona "Obtener datos" > "Web"</li>
                            <li>Introduce la URL del API</li>
                            <li>Selecciona "Autenticación avanzada" y usa las credenciales</li>
                            <li>Sigue las instrucciones de Power BI para importar los datos</li>
                        </ol>
                        
                        <div class="api-note">
                            <i class="fas fa-info-circle"></i>
                            <p>Esta conexión proporciona acceso a todos los datos en tiempo real. Puedes configurar la actualización automática en Power BI para mantener tus informes actualizados.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closePowerBIAPIModal()">
                    Cerrar
                </button>
                <button class="btn btn-primary" onclick="downloadPowerBIGuide()">
                    <i class="fas fa-file-pdf"></i> Descargar Guía PDF
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar notificación
    mostrarNotificacion('Configuración de API disponible', 'success');
}

/**
 * Cerrar modal de API de Power BI
 */
window.closePowerBIAPIModal = function() {
    const modal = document.getElementById('powerbi-api-modal');
    if (modal) {
        modal.remove();
    }
};

/**
 * Descargar guía PDF de Power BI
 */
window.downloadPowerBIGuide = function() {
    console.log('📊 [PowerBI]: Descargando guía PDF...');
    
    // Simular descarga de PDF
    simulateFileDownload('aethercubix-powerbi-guide.pdf', 'pdf');
    
    // Registrar evento
    console.log('✅ [PowerBI]: Guía PDF descargada');
    
    // Cerrar modal
    closePowerBIAPIModal();
};

/**
 * Copiar texto al portapapeles
 */
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            mostrarNotificacion('Copiado al portapapeles', 'success');
        })
        .catch(err => {
            console.error('Error copiando al portapapeles:', err);
            mostrarNotificacion('Error copiando al portapapeles', 'error');
        });
};

/**
 * Alternar visibilidad de contraseña
 */
window.togglePasswordVisibility = function(inputElement) {
    if (inputElement.type === 'password') {
        inputElement.type = 'text';
    } else {
        inputElement.type = 'password';
    }
};

/**
 * Simular descarga de archivo
 */
function simulateFileDownload(filename, type) {
    // Crear un elemento <a> invisible
    const downloadLink = document.createElement('a');
    
    // Definir un pequeño contenido base64 según el tipo
    let dataUrl;
    let iconClass;
    
    switch (type) {
        case 'excel':
            dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQABgAIAAAAIQD21qXvWgE=';
            iconClass = 'fa-file-excel';
            break;
        case 'pdf':
            dataUrl = 'data:application/pdf;base64,JVBERi0xLjcKJb/3ov4KMiAwIG9iago8PCAvTGluZWFyaXplZCAxIC9MIDE5NTg1IC9IIFs2';
            iconClass = 'fa-file-pdf';
            break;
        case 'zip':
            dataUrl = 'data:application/zip;base64,UEsDBBQAAAAIAJRz5VbKCyIVfgAAAHwAAAAOAAAAUHJvZHVjdG9zLmNzdkVO';
            iconClass = 'fa-file-archive';
            break;
        default:
            dataUrl = 'data:text/plain;base64,VGhpcyBpcyBhIHNpbXVsYXRlZCBkb3dubG9hZC4=';
            iconClass = 'fa-file';
    }
    
    downloadLink.href = dataUrl;
    downloadLink.download = filename;
    
    // Simular clic para descargar
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Mostrar notificación de descarga iniciada
    const notificationMsg = `<i class="fas ${iconClass}"></i> Descarga iniciada: ${filename}`;
    mostrarNotificacion(notificationMsg, 'info');
}

/**
 * Formatear fecha para nombre de archivo
 */
function formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Formatear rango de fechas para mostrar
 */
function formatDateRange(fromDate, toDate) {
    const from = fromDate.toLocaleDateString();
    const to = toDate.toLocaleDateString();
    return `${from} - ${to}`;
}

/**
 * Mostrar notificación (si no existe esta función)
 */
function mostrarNotificacion(mensaje, tipo) {
    // Usar la función existente si ya existe
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, tipo);
        return;
    }
    
    // Implementación básica si no existe
    console.log(`[${tipo}] ${mensaje}`);
    
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `<p>${mensaje}</p>`;
    
    // Estilo automático
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${tipo === 'error' ? '#f44336' : tipo === 'warning' ? '#ff9800' : tipo === 'info' ? '#2196f3' : '#4caf50'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        z-index: 1000;
        animation: slideInRight 0.3s, fadeOut 0.5s 2.5s forwards;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Crear estilos para la exportación de Power BI
const style = document.createElement('style');
style.textContent = `
    .export-options {
        display: flex;
        gap: 15px;
        margin: 20px 0;
    }
    
    .export-option {
        flex: 1;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .export-option:hover {
        border-color: #667eea;
        transform: translateY(-2px);
    }
    
    .export-option.selected {
        border-color: #667eea;
        background-color: rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
    
    .export-option i {
        font-size: 2rem;
        margin-bottom: 10px;
        color: #667eea;
    }
    
    .export-option span {
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .export-option small {
        color: #718096;
    }
    
    .date-inputs {
        display: flex;
        gap: 15px;
        margin-top: 10px;
    }
    
    .date-inputs > div {
        flex: 1;
    }
    
    .date-inputs label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
    
    .date-inputs input {
        width: 100%;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
    }
    
    .api-url {
        background: #f8fafc;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .api-url code {
        font-family: monospace;
        font-size: 0.9rem;
    }
    
    .credential-field {
        display: flex;
        align-items: center;
        margin: 10px 0;
    }
    
    .credential-field input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px 0 0 4px;
        font-family: monospace;
        background: #f8fafc;
    }
    
    .btn-icon {
        background: #e2e8f0;
        border: none;
        padding: 8px 10px;
        cursor: pointer;
        border-left: 1px solid #cbd5e0;
    }
    
    .btn-icon:last-child {
        border-radius: 0 4px 4px 0;
    }
    
    .btn-icon:hover {
        background: #cbd5e0;
    }
    
    .api-instructions ol {
        padding-left: 20px;
        line-height: 1.6;
    }
    
    .api-note {
        background: #ebf8ff;
        border-left: 4px solid #4299e1;
        padding: 10px 15px;
        margin-top: 15px;
        border-radius: 0 4px 4px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .api-note i {
        color: #4299e1;
        margin-top: 3px;
    }
    
    .powerbi-simulation {
        padding: 20px;
        text-align: center;
    }
    
    .simulation-message {
        background: #f8fafc;
        border: 1px dashed #cbd5e0;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        display: flex;
        align-items: flex-start;
        gap: 15px;
        text-align: left;
    }
    
    .simulation-message i {
        font-size: 1.5rem;
        color: #4299e1;
    }
    
    .simulation-image {
        margin: 20px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .simulation-image img {
        max-width: 100%;
        height: auto;
        display: block;
    }
    
    .simulation-actions {
        margin-top: 20px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;

document.head.appendChild(style);

// Log que la integración se cargó correctamente
console.log('✅ [PowerBI]: Módulo de integración cargado correctamente');