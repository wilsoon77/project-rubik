# 🎲 AetherCubix - Tienda Profesional de Cubos Rubik

## 📄 Descripción

AetherCubix es un sitio web estático profesional y visualmente atractivo diseñado para una tienda ficticia especializada en la venta de cubos Rubik y puzzles 3D. El proyecto está desarrollado con tecnologías web modernas y presenta una interfaz de usuario elegante, animaciones fluidas y una experiencia de usuario excepcional.

## ✨ Características Principales

### 🎨 Diseño Visual
- **Esquema de colores del cubo Rubik**: Utiliza los colores icónicos (rojo, azul, verde, amarillo, naranja, blanco)
- **Animación 3D del cubo**: Cubo Rubik completamente animado en CSS3 sin librerías externas
- **Diseño responsivo**: Adaptado para móvil, tablet y desktop
- **Efectos visuales modernos**: Glassmorphism, gradientes, sombras suaves y micro-interacciones
- **Tipografía profesional**: Combinación de Orbitron (futurista) e Inter (legible)

### 🏗️ Estructura del Sitio
1. **Inicio** - Landing page con hero section y cubo animado
2. **Sobre Nosotros** - Historia de la empresa, estadísticas y características
3. **Productos** - Catálogo filtrable de diferentes tipos de cubos
4. **Aprende** - Recursos educativos y niveles de aprendizaje
5. **Contacto** - Formulario funcional con validación

### 🔧 Funcionalidades Técnicas
- **Navegación fija**: Menú sticky con efectos de scroll
- **Filtros de productos**: Sistema de filtrado dinámico con JavaScript
- **Formulario de contacto**: Validación completa y feedback visual
- **Animaciones CSS**: Efectos de entrada, hover states y transiciones suaves
- **Optimización de rendimiento**: Lazy loading, debouncing y throttling
- **Easter egg**: Código Konami para sorpresa oculta

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Estilos avanzados con Grid, Flexbox y animaciones
- **JavaScript ES6+**: Funcionalidad interactiva sin frameworks
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografías web optimizadas

### Estructura de Archivos
```
├── index.html              # Página principal
├── styles/
│   ├── main.css           # Estilos principales
│   ├── animations.css     # Animaciones CSS
│   └── responsive.css     # Media queries responsivas
├── scripts/
│   └── main.js           # JavaScript principal
└── README.md             # Documentación
```

## 🚀 Instalación y Uso

### Desarrollo Local
1. **Clona o descarga el proyecto**
2. **Instalar Dependencias** `npm install`
2. **Iniciar el servidor local (Vite) `npm run dev`**
3. **¡Listo!** - Abrir en el navegador (http://localhost:3000/)

### Servidor de Desarrollo (Recomendado)
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con Live Server (VS Code Extension)
# Clic derecho en index.html > "Open with Live Server"
```

### Despliegue
El sitio es completamente estático y puede desplegarse en:
- **GitHub Pages**
- **Netlify** 
- **Vercel**
- **Surge.sh**
- Cualquier servidor web estático

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 1024px - Layout completo
- **Tablet**: 768px - 1024px - Adaptación a tablet
- **Móvil**: < 768px - Menú hamburguesa y layout simplificado
- **Móvil pequeño**: < 480px - Optimización máxima

### Características Móviles
- Menú hamburguesa animado
- Navegación táctil optimizada
- Cubo 3D adaptativo
- Formularios touch-friendly
- Optimización para pantallas pequeñas

## 🎛️ Funcionalidades JavaScript

### Navegación
- **Scroll suave**: Animaciones fluidas entre secciones
- **Indicador activo**: Resalta la sección actual en el menú
- **Navbar dinámico**: Cambia apariencia al hacer scroll
- **Menú móvil**: Toggle hamburguesa con animaciones

### Interactividad
- **Filtros de productos**: Sistema de filtrado dinámico
- **Validación de formularios**: Feedback en tiempo real
- **Efectos visuales**: Ripple effects, hover states
- **Cubo interactivo**: Pausa animación en interacción

### Optimización
- **Debouncing**: Optimiza eventos de scroll
- **Throttling**: Limita frecuencia de actualizaciones
- **Lazy loading**: Carga diferida de imágenes
- **Precarga**: Recursos críticos precargados

## 🎨 Personalización

### Colores del Cubo Rubik
```css
:root {
    --cube-red: #dc143c;
    --cube-blue: #1e90ff;
    --cube-green: #32cd32;
    --cube-yellow: #ffd700;
    --cube-orange: #ff6347;
    --cube-white: #ffffff;
}
```

### Animaciones
- **Duración**: Variables CSS para control global
- **Easing**: Curvas de animación personalizables
- **Reduced Motion**: Respeta preferencias de accesibilidad

### Contenido
- **Productos**: Fácil adición/edición en el HTML
- **Imágenes**: URLs de Pexels (reemplazables)
- **Textos**: Contenido localizado en español

## 🔍 Características Avanzadas

### Cubo Rubik 3D
- **CSS puro**: Sin bibliotecas 3D externas
- **6 caras animadas**: Cada cara con 9 stickers
- **Rotación continua**: Animación keyframe compleja
- **Interactividad**: Pausa en hover/touch
- **Escalabilidad**: Adaptable a diferentes tamaños

### Sistema de Filtros
- **Categorías dinámicas**: Speedcube, Megaminx, Pyraminx, etc.
- **Animaciones suaves**: Fade in/out al filtrar
- **Estado persistente**: Mantiene selección visual
- **Responsive**: Funciona en todos los dispositivos

### Formulario Inteligente
- **Validación HTML5**: Atributos nativos
- **Validación JavaScript**: Reglas personalizadas
- **Feedback visual**: Mensajes de error/éxito
- **Estados de carga**: Indicadores de progreso
- **Sanitización**: Limpieza de datos de entrada

## 🎁 Easter Eggs

### Código Konami
Secuencia: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA

Activa una sorpresa oculta con un cubo virtual en modal.

### Efectos Secretos
- **Hover en logo**: Animación de rotación
- **Scroll indicators**: Bounce animation
- **Ripple effects**: Click feedback en botones

## 🔧 Configuración Avanzada

### Variables de Configuración (main.js)
```javascript
const CONFIG = {
    scrollOffset: 100,        // Offset para navegación
    animationDelay: 100,      // Delay entre animaciones
    debounceDelay: 250,       // Delay para debouncing
    transitionDuration: 300   // Duración de transiciones
};
```

### Media Queries Especiales
- **Modo oscuro**: `prefers-color-scheme: dark`
- **Movimiento reducido**: `prefers-reduced-motion: reduce`
- **Alta densidad**: `min-resolution: 192dpi`
- **Solo táctil**: `hover: none`

## 📊 Rendimiento

### Optimizaciones
- **CSS crítico**: Carga inline de estilos importantes
- **Preload fonts**: Precarga de tipografías Google
- **Debounced scroll**: Optimización de eventos scroll
- **Compressed images**: Imágenes optimizadas de Pexels
- **Minimal JavaScript**: Sin dependencias externas

### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🌐 Compatibilidad

### Navegadores Soportados
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Móviles**: iOS 14+, Android 10+

### Características Modernas
- **CSS Grid**: Layout avanzado
- **CSS Custom Properties**: Variables CSS
- **ES6+**: JavaScript moderno
- **IntersectionObserver**: Optimización de scroll
- **CSS Animations**: Transiciones fluidas

## 👥 Créditos y Recursos

### Imágenes
- **Pexels**: Fotografías de cubos Rubik de alta calidad
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografías Orbitron e Inter

### Inspiración
- **Apple**: Principios de diseño minimalista
- **Material Design**: Guidelines de interacción
- **Speedcubing Community**: Cultura de los cubos Rubik

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT. Siéntete libre de usar, modificar y distribuir el código para tus propios proyectos.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar CubeZone:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature
3. **Commit** tus cambios
4. **Push** a la rama
5. **Abre** un Pull Request

## 📞 Soporte

Para preguntas, sugerencias o reportar bugs:
- **GitHub Issues**: Usa el sistema de issues del repositorio
- **Email**: contacto@cubezone.es (ficticio)
- **Documentación**: Revisa este README

---

**Desarrollado con ❤️ para la comunidad de speedcubing**

*CubeZone - Donde los cubos cobran vida* 🎲✨