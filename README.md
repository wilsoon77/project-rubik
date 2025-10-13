# 🎲 AetherCubix - Tienda Profesional de Cubos Rubik

## 📱 **AHORA ES UNA PWA - APLICACIÓN MÓVIL**

**AetherCubix** es un **e-commerce completo** de cubos Rubik que funciona como:
- 🌐 **Sitio web** profesional y responsivo
- 📱 **Aplicación móvil** instalable (PWA)
- 🔌 **App offline** - funciona sin conexión
- ⚡ **App nativa** - instalable en Android, iOS y Desktop

---

## 📄 Descripción

AetherCubix es una tienda online completa especializada en cubos Rubik con funcionalidades de e-commerce profesionales. Ahora convertida en una **Progressive Web App (PWA)**, ofrece experiencia de app móvil nativa sin necesidad de Google Play o App Store.

## ✨ Características Principales

### 📱 PWA - Aplicación Móvil (¡NUEVO!)
- **📥 Instalable**: Como app nativa en móvil y desktop
- **🔌 Funciona Offline**: Caché inteligente de recursos
- **⚡ Súper Rápida**: Pre-caché y carga instantánea
- **🔄 Auto-actualizable**: Notificaciones de nuevas versiones
- **🎨 Iconos Profesionales**: Generador incluido
- **📲 Sin tiendas**: No necesita Play Store ni App Store

### 🛒 E-commerce Completo
- **Autenticación**: Login/Registro con Appwrite
- **Carrito de Compras**: Agregar/quitar productos en tiempo real
- **Checkout**: Proceso de compra completo
- **Historial de Pedidos**: Ver compras anteriores
- **Panel de Admin**: Gestión de productos (CRUD)
- **AI Assistant**: Chatbot con OpenRouter/DeepSeek
- **Power BI Analytics**: Dashboard de ventas

### 🎨 Diseño Visual
- **Colores icónicos del cubo Rubik**: Rojo, azul, verde, amarillo, naranja y blanco
- **Animación 3D del cubo**: Cubo Rubik animado en CSS3
- **Diseño responsivo**: Adaptado para móvil, tablet y desktop
- **Efectos visuales modernos**: Animaciones, gradientes, sombras suaves e interacciones
- **Tipografía profesional**: Orbitron (futurista) e Inter (legible)ix - Tienda Profesional de Cubos Rubik

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

#### Páginas Públicas:
1. **Inicio** - Landing page con hero section y cubo animado
2. **Productos** - Catálogo completo con Appwrite
3. **Carrito** - Gestión de carrito de compras
4. **Checkout** - Proceso de pago
5. **Mis Pedidos** - Historial de compras
6. **Login/Registro** - Autenticación con Appwrite
7. **Sobre Nosotros** - Historia y equipo
8. **Aprende** - Tutoriales y recursos
9. **Contacto** - Formulario de contacto

#### Panel de Administración:
1. **Dashboard Admin** - Vista general
2. **Gestión de Productos** - CRUD completo
3. **AI Assistant** - Chatbot con IA
4. **Power BI** - Analytics y reportes

### 🔧 Funcionalidades Técnicas
- **PWA**: Service Worker, Manifest, Offline support
- **Autenticación**: Sistema completo con Appwrite
- **Base de datos**: 5 colecciones en Appwrite
- **Carrito persistente**: LocalStorage + Appwrite
- **Navegación fija**: Menú sticky con efectos de scroll
- **Filtros de productos**: Sistema dinámico con JavaScript
- **Animaciones CSS**: Efectos de entrada, hover y transiciones
- **Responsive**: Mobile-first design

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Grid, Flexbox, animaciones y media queries
- **JavaScript ES6+**: Módulos y funcionalidad moderna
- **Vite**: Build tool y dev server
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografías Orbitron e Inter

### Backend as a Service (BaaS)
- **Appwrite**: Autenticación, base de datos, storage
- **OpenRouter**: AI Assistant (DeepSeek)
- **Power BI**: Analytics integrado

### PWA
- **Service Worker**: Caché y funcionalidad offline
- **Web App Manifest**: Configuración de instalación
- **Cache API**: Estrategias de caché inteligentes

### Estructura de Archivos
```
├── index.html                    # Página principal
├── productos.html                # Catálogo
├── carrito.html                  # Carrito de compras
├── checkout.html                 # Proceso de pago
├── confirmacion.html             # Confirmación de pedido
├── mis-pedidos.html              # Historial
├── login.html                    # Autenticación
├── sobre-nosotros.html           # Información
├── aprende.html                  # Tutoriales
├── contacto.html                 # Contacto
│
├── admin/                        # Panel de administración
│   ├── index.html                # Dashboard
│   ├── gestion-productos.html    # CRUD productos
│   ├── ai-assistant.html         # Chatbot IA
│   └── power-bi.html             # Analytics
│
├── public/                       # Archivos públicos
│   ├── manifest.json             # ⭐ PWA Manifest
│   ├── service-worker.js         # ⭐ Service Worker
│   ├── icon-generator.html       # ⭐ Generador de iconos
│   ├── icons/                    # Iconos PWA
│   └── screenshots/              # Capturas para PWA
│
├── scripts/                      # JavaScript
│   ├── main.js                   # Script principal
│   ├── pwa-manager.js            # ⭐ Gestor PWA
│   ├── auth-ui.js                # Autenticación UI
│   ├── carrito-page.js           # Lógica carrito
│   ├── checkout-page.js          # Lógica checkout
│   ├── services/                 # Servicios
│   │   ├── appwrite.js           # Config Appwrite
│   │   ├── auth.js               # Autenticación
│   │   ├── carrito.js            # Carrito
│   │   ├── productos.js          # Productos
│   │   └── pedidos.js            # Pedidos
│   └── utils/                    # Utilidades
│
├── styles/                       # CSS
│   ├── main.css                  # Estilos principales
│   ├── animations.css            # Animaciones
│   ├── responsive.css            # Media queries
│   └── auth.css                  # Estilos auth
│
├── PWA-GUIDE.md                  # ⭐ Guía completa PWA
├── PWA-QUICKSTART.md             # ⭐ Inicio rápido PWA
├── RESUMEN-PWA.md                # ⭐ Resumen ejecutivo
├── README.md                     # Este archivo
├── package.json                  # Dependencias
├── vite.config.ts                # Configuración Vite
└── netlify.toml                  # Deploy Netlify
```

## 🚀 Instalación y Uso

### 1️⃣ Clonar e Instalar
```bash
# Clonar el repositorio
git clone https://github.com/wilsoon77/project-rubik.git
cd project-rubik

# Instalar dependencias
npm install
```

### 2️⃣ Configurar Appwrite
Crea un archivo `.env` basado en `.env.example`:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tu_project_id
VITE_APPWRITE_DATABASE_ID=tu_database_id
VITE_APPWRITE_COLLECTION_PRODUCTO_ID=tu_collection_id
# ... más configuraciones
```

### 3️⃣ Generar Iconos PWA (IMPORTANTE)
```bash
# Inicia el servidor
npm run dev

# Abre en el navegador:
http://localhost:3000/icon-generator.html

# Genera y descarga los 8 iconos
# Guárdalos en: public/icons/
```

### 4️⃣ Iniciar Desarrollo
```bash
# Modo desarrollo (recomendado)
npm run dev

# O usar Vite directamente
npx vite

# Abre: http://localhost:3000
```

### 5️⃣ Build para Producción
```bash
# Compilar para producción
npm run build

# Previsualizar build
npm run preview

# Los archivos estarán en: dist/
```

### 6️⃣ Desplegar (con PWA incluida)

#### Opción A: Netlify (Recomendado - Ya configurado)
```bash
git add .
git commit -m "feat: PWA implementada"
git push origin main
# Netlify despliega automáticamente
```

#### Opción B: Vercel
```bash
npm run build
vercel --prod
```

#### Opción C: Cualquier hosting con HTTPS
```bash
npm run build
# Sube la carpeta 'dist/' a tu hosting
# ⚠️ Importante: Debe tener HTTPS para que PWA funcione
```

---

## 📱 Usar como Aplicación Móvil

### En Android (Chrome):
1. Abre la URL en Chrome
2. Verás "Instalar AetherCubix"
3. Toca "Instalar"
4. ¡La app aparecerá en tu pantalla de inicio! 🎉

### En iOS (Safari):
1. Abre la URL en Safari
2. Toca el botón compartir (⬆️)
3. Selecciona "Agregar a pantalla de inicio"
4. ¡Listo! 📱

### En Desktop (Chrome/Edge):
1. Verás ícono ⊕ en la barra de URL
2. Haz clic en "Instalar"
3. La app se abre en ventana propia 🖥️

---

## 📚 Documentación PWA

Para información detallada sobre la PWA:
- **`RESUMEN-PWA.md`** - Resumen ejecutivo y próximos pasos
- **`PWA-QUICKSTART.md`** - Guía de inicio rápido (5 minutos)
- **`PWA-GUIDE.md`** - Documentación completa y técnica

---

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