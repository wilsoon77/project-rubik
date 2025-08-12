# 🎲 AetherCubix - Tienda Profesional de Cubos Rubik

## 📄 Descripción

AetherCubix es un sitio web estático profesional y visualmente atractivo diseñado para una tienda especializada en la venta de cubos Rubik. El proyecto utiliza tecnologías web modernas y presenta una interfaz elegante, animaciones fluidas y una experiencia de usuario excepcional.

## ✨ Características Principales

### 🎨 Diseño Visual
- **Colores icónicos del cubo Rubik**: Rojo, azul, verde, amarillo, naranja y blanco
- **Animación 3D del cubo**: Cubo Rubik animado en CSS3
- **Diseño responsivo**: Adaptado para móvil, tablet y desktop
- **Efectos visuales modernos**: Animaciones, gradientes, sombras suaves e interacciones
- **Tipografía profesional**: Orbitron (futurista) e Inter (legible)

### 🏗️ Estructura del Sitio
1. **Inicio** - Landing page con hero section y cubo animado
2. **Sobre Nosotros** - Historia, estadísticas y equipo
3. **Productos** - Catálogo filtrable de cubos y accesorios
4. **Aprende** - Recursos educativos, tutoriales y niveles de aprendizaje
5. **Contacto** - Formulario funcional con validación y animación

### 🔧 Funcionalidades Técnicas
- **Navegación fija**: Menú sticky con efectos de scroll
- **Filtros de productos**: Sistema de filtrado dinámico con JavaScript
- **Formulario de contacto**: Validación completa, feedback visual y animación de envío
- **Animaciones CSS**: Efectos de entrada, hover y transiciones suaves
- **Easter egg**: Código Konami para activar un cubo virtual oculto

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Grid, Flexbox, animaciones y media queries
- **JavaScript ES6+**: Funcionalidad interactiva
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografías Orbitron e Inter

### Estructura de Archivos
```
├── index.html
├── aprende.html
├── productos.html
├── sobre-nosotros.html
├── contacto.html
├── styles/
│   ├── main.css
│   ├── animations.css
│   └── responsive.css
├── scripts/
│   └── main.js
├── public/
├── README.md
├── package.json
├── vite.config.ts
└── vercel.json
```

## 🚀 Instalación y Uso

### Desarrollo en servidor Local (VITE)
1. **Clona o descarga el proyecto**
2. **Instala dependencias**: `npm install`
3. **Inicia el servidor local (Vite)**: `npm run dev`
4. **Abre** en el navegador: [http://localhost:3000/](http://localhost:3000/)


### Despliegue
El sitio es completamente estático y puede desplegarse en:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Surge.sh**
- Cualquier servidor web estático

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Móvil**: < 768px
- **Móvil pequeño**: < 480px

### Características Móviles
- Menú hamburguesa animado
- Navegación táctil optimizada
- Cubo 3D adaptativo
- Formularios touch-friendly
- Optimización para pantallas pequeñas

## 🎛️ Funcionalidades JavaScript

### Navegación
- **Scroll suave** entre secciones
- **Indicador activo** en el menú
- **Navbar dinámico** al hacer scroll
- **Menú móvil** con animación hamburguesa

### Interactividad
- **Filtros de productos** dinámicos
- **Validación de formularios** con feedback visual
- **Efectos visuales**: Ripple, hover, animaciones de tarjetas
- **Cubo interactivo**: Pausa animación en hover/touch

### Optimización
- **Debouncing** y **throttling** en eventos de scroll
- **Lazy loading** de imágenes
- **Precarga** de recursos críticos

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
- Variables CSS para duración y easing
- Respeta preferencias de accesibilidad

### Contenido
- Productos y textos fácilmente editables en HTML

## Características Avanzadas

### Cubo Rubik 3D
- **6 caras animadas** con 9 stickers cada una
- **Rotación continua** y pausada en interacción
- **Escalabilidad**: Adaptable a diferentes tamaños

### Sistema de Filtros
- **Categorías dinámicas**: Speedcube, Megaminx, Pyraminx, etc.
- **Animaciones suaves** al filtrar
- **Estado visual persistente**
- **Totalmente responsive**

### Formulario Inteligente
- **Validación HTML5** y JavaScript personalizada
- **Feedback visual**: Mensajes de error/éxito
- **Animación de envío** en el botón
- **Sanitización** de datos de entrada


## 🔧 Configuración Avanzada

### Variables de Configuración (`scripts/main.js`)
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
- **Imágenes comprimidas**
- **JavaScript mínimo**: Sin dependencias externas

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
- **CSS Grid** y **Flexbox**
- **CSS Custom Properties**
- **ES6+**
- **IntersectionObserver**
- **CSS Animations**

## 👥 Créditos y Recursos

### Imágenes y Fuentes
- **Pexels**: Fotografías de cubos Rubik
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Orbitron e Inter


## 📝 Licencia

Este proyecto es de código abierto bajo la Licencia MIT. 

## 📞 Soporte

Para preguntas, sugerencias o reportar bugs:
- **GitHub Issues**: Usa el sistema de issues del repositorio
- **Email**: info@ethercubix.me
- **Documentación**: Revisa este README

---

**Desarrollado para la comunidad de speedcubing**

*- AetherCubix - *