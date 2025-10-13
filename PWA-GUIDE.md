# 📱 Guía de Instalación PWA - AetherCubix

## ✅ Implementación Completada

Tu aplicación web ahora es una **Progressive Web App (PWA)** completamente funcional que mantiene TODAS las características:

- ✅ Autenticación con Appwrite
- ✅ Carrito de compras
- ✅ Checkout y pedidos
- ✅ Panel de administración
- ✅ Gestión de productos
- ✅ AI Assistant
- ✅ Power BI Analytics

## 🎯 Funcionalidades PWA Agregadas

### 1. **Instalable** 📥
- Los usuarios pueden instalar la app en su móvil/desktop
- Funciona como una app nativa
- Aparece en la pantalla de inicio
- No necesita Google Play ni App Store

### 2. **Funciona Offline** 🔌
- Caché inteligente de recursos
- Seguirá funcionando sin conexión
- Los datos se sincronizan cuando vuelve la conexión

### 3. **Rápida y Eficiente** ⚡
- Carga instantánea
- Recursos pre-cacheados
- Experiencia fluida

### 4. **Actualizaciones Automáticas** 🔄
- Los usuarios reciben notificaciones de nuevas versiones
- Actualización con un click

---

## 🚀 Cómo Probar la PWA

### Paso 1: Generar Iconos

1. Abre en tu navegador:
   ```
   http://localhost:3000/icon-generator.html
   ```

2. Personaliza:
   - Texto: "AC" (AetherCubix)
   - Color de fondo: #6366f1 (púrpura)
   - Color de texto: #ffffff (blanco)

3. Haz clic en **"Descargar Todos los Iconos"**

4. Guarda los archivos descargados en:
   ```
   public/icons/
   ```

### Paso 2: Iniciar el Servidor

```bash
npm run dev
```

### Paso 3: Probar en Móvil

#### **Android (Chrome):**
1. Abre tu app en Chrome
2. Verás un banner: "Instalar AetherCubix"
3. También puedes ir a: `Menú (⋮) → Instalar aplicación`
4. ¡Listo! La app estará en tu pantalla de inicio

#### **iOS (Safari):**
1. Abre tu app en Safari
2. Toca el botón de compartir (⬆️)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación

#### **Desktop (Chrome/Edge):**
1. Verás un ícono de instalación (⊕) en la barra de direcciones
2. Haz clic en "Instalar"
3. La app se abrirá en su propia ventana

---

## 🧪 Cómo Probar Funcionalidades

### 1. Probar Instalación:
```bash
# Ejecutar en desarrollo
npm run dev

# O probar build de producción
npm run build
npm run preview
```

Luego abre en **Chrome** y usa DevTools:
- `F12` → pestaña **Application** → **Manifest**
- Verifica que todos los iconos aparezcan
- Haz clic en "Add to home screen"

### 2. Probar Service Worker:
En DevTools:
- `F12` → pestaña **Application** → **Service Workers**
- Deberías ver el Service Worker activo
- Prueba: marca "Offline" y recarga la página
- ¡La app debería seguir funcionando!

### 3. Probar Caché:
En DevTools:
- `F12` → pestaña **Application** → **Cache Storage**
- Verás: `aethercubix-v1.0.0` y `aethercubix-runtime-v1`
- Revisa los archivos cacheados

### 4. Probar en Lighthouse:
En DevTools:
- `F12` → pestaña **Lighthouse**
- Selecciona: "Progressive Web App"
- Haz clic en "Generate report"
- **Objetivo: 90+ puntos** ✅

---

## 📊 Checklist de Verificación

Antes de lanzar a producción, verifica:

- [ ] ✅ **Manifest**: Existe en `/manifest.json`
- [ ] ✅ **Service Worker**: Registrado correctamente
- [ ] ✅ **Iconos**: 8 tamaños (72-512px) en `/icons/`
- [ ] ✅ **HTTPS**: Obligatorio para PWA (Netlify lo tiene automáticamente)
- [ ] ✅ **Meta Tags**: Agregados en todas las páginas HTML
- [ ] ✅ **Offline**: La app funciona sin conexión
- [ ] ✅ **Instalable**: Aparece el prompt de instalación
- [ ] ✅ **Responsive**: Se ve bien en móvil y desktop
- [ ] ✅ **Lighthouse**: Score PWA > 90

---

## 🌐 Desplegar en Producción

### Opción 1: Netlify (Recomendado)

Ya tienes `netlify.toml` configurado. Solo necesitas:

1. Generar los iconos primero
2. Hacer commit:
   ```bash
   git add .
   git commit -m "feat: Convertida a PWA"
   git push origin main
   ```
3. Netlify desplegará automáticamente
4. Tu PWA estará en: `https://tu-dominio.netlify.app`

### Opción 2: Vercel

```bash
npm run build
vercel --prod
```

### Opción 3: GitHub Pages

```bash
npm run build
# Subir carpeta 'dist' a GitHub Pages
```

---

## 🎨 Personalización Adicional

### Cambiar Colores del Theme:

En `public/manifest.json`:
```json
{
  "theme_color": "#TU_COLOR",
  "background_color": "#TU_COLOR"
}
```

### Agregar Más Shortcuts:

En `public/manifest.json` → `shortcuts`:
```json
{
  "name": "Nueva Página",
  "url": "/tu-pagina.html",
  "icons": [...]
}
```

### Configurar Notificaciones Push:

En `scripts/pwa-manager.js` ya está preparado.
Solo necesitas configurar las notificaciones en Appwrite.

---

## 📚 Recursos Útiles

- **Probar PWA**: https://web.dev/pwa-checklist/
- **Iconos**: https://www.pwabuilder.com/imageGenerator
- **Documentación**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

---

## 🐛 Solución de Problemas

### "Service Worker no se registra"
- Verifica que estés en `localhost` o `HTTPS`
- Revisa la consola del navegador por errores
- Asegúrate que `service-worker.js` esté en `/public/`

### "No aparece el prompt de instalación"
- Chrome solo lo muestra si la PWA cumple todos los criterios
- Usa DevTools → Application → Manifest para ver errores
- Verifica que tengas iconos de 192px y 512px

### "Funciona en dev pero no en producción"
- Verifica que los archivos `manifest.json` y `service-worker.js` se copien a `dist/`
- Ejecuta `npm run build` y revisa la carpeta `dist/`

### "No funciona offline"
- El Service Worker necesita al menos una visita online primero
- Verifica en DevTools → Application → Service Workers que esté activado

---

## 🎉 ¡Felicidades!

Tu aplicación **AetherCubix** ahora es una PWA completa que:

✅ Se instala como app nativa  
✅ Funciona offline  
✅ Mantiene TODAS las funcionalidades (Appwrite, carrito, admin, etc.)  
✅ Es rápida y eficiente  
✅ Se actualiza automáticamente  

**Próximos pasos opcionales:**
- 📸 Agregar capturas de pantalla en `public/screenshots/`
- 🔔 Configurar notificaciones push
- 📊 Implementar sincronización en background
- 🎨 Personalizar splash screens para iOS

---

**¿Necesitas ayuda?** Revisa la documentación o pregunta al equipo de desarrollo.
