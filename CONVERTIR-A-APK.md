# 📦 Guía: Convertir PWA a APK

## ✅ Tu PWA ya está funcionando en hosting
Felicidades! Ahora vamos a convertirlo en APK para distribuirlo en tiendas de apps.

---

## 🎯 OPCIÓN 1: PWABuilder (MÁS FÁCIL - RECOMENDADA)

### Paso 1: Generar el APK

1. **Ve a PWABuilder:**
   ```
   https://www.pwabuilder.com/
   ```

2. **Ingresa la URL de tu PWA:**
   - Escribe tu URL completa (ej: `https://aethercubix.netlify.app`)
   - Haz clic en "Start"

3. **Espera el análisis:**
   - PWABuilder verificará tu manifest, service worker e iconos
   - Te mostrará una puntuación de compatibilidad
   - Revisa las recomendaciones (si las hay)

4. **Configura el APK:**
   - Haz clic en "Package For Stores"
   - Selecciona **"Android"**
   - Configura los detalles:
     - **App name:** AetherCubix
     - **Package ID:** com.aethercubix.app (o tu dominio invertido)
     - **App version:** 1.0.0
     - **Version code:** 1
     - **Host:** Tu URL sin https:// (ej: aethercubix.netlify.app)
     - **Start URL:** /

5. **Opciones avanzadas (opcional):**
   - **Display mode:** standalone
   - **Status bar color:** #6366f1
   - **Splash screen:** Usa tu color de tema
   - **Icon:** Usa los iconos que ya generaste (512x512)

6. **Generar APK:**
   - Haz clic en "Generate"
   - Descarga el archivo `.zip`
   - Dentro encontrarás:
     - `app-release-signed.apk` (APK firmado listo para instalar)
     - `assetlinks.json` (para verificación de dominio)

### Paso 2: Verificar el APK

1. **Instala en tu móvil:**
   - Transfiere el APK a tu teléfono
   - Activa "Orígenes desconocidos" en Configuración
   - Instala el APK
   - Prueba que todo funcione

---

## 🏪 SUBIR A TIENDAS DE APPS (GRATIS)

### 📱 Opción A: Google Play Store

**IMPORTANTE:** Google Play cobra **$25 USD** (pago único de por vida)

#### Requisitos:
- Cuenta de desarrollador de Google Play ($25 USD)
- APK firmado (ya lo tienes con PWABuilder)
- Políticas de privacidad
- Capturas de pantalla (2-8 imágenes)

#### Pasos:
1. Crear cuenta en: https://play.google.com/console
2. Pagar los $25 USD (pago único)
3. Crear nueva aplicación
4. Subir APK y completar información
5. Enviar a revisión (demora 1-7 días)

**Ventajas:**
- ✅ Tienda oficial de Android
- ✅ Millones de usuarios potenciales
- ✅ Actualizaciones automáticas
- ✅ Estadísticas y analytics

**Desventajas:**
- ❌ Costo inicial de $25 USD
- ❌ Proceso de revisión puede tardar
- ❌ Políticas estrictas

---

### 🆓 Opción B: Amazon Appstore (100% GRATIS)

**MEJOR OPCIÓN SI QUIERES GRATIS**

#### Ventajas:
- ✅ **100% GRATIS** (no cobra registro)
- ✅ Funciona en dispositivos Amazon Fire
- ✅ También disponible en Android regular
- ✅ Proceso más simple que Google Play

#### Pasos:
1. **Registrarse:** https://developer.amazon.com/apps-and-games
2. **Crear cuenta** (completamente gratis)
3. **Agregar nueva app:**
   - General Info → Detalles de la app
   - Subir APK
   - Agregar capturas de pantalla
   - Descripción y palabras clave
4. **Enviar a revisión** (demora 1-3 días)

#### Cómo subir:
```
1. Dashboard → Add Android App
2. App title: AetherCubix - Tienda de Cubos Rubik
3. Package name: com.aethercubix.app
4. Upload APK → Seleccionar tu app-release-signed.apk
5. Screenshots → Subir 3-10 capturas
6. Description → Descripción de tu app
7. Submit
```

---

### 🌐 Opción C: APKPure / APKMirror (GRATIS pero menos oficial)

**Distribución alternativa:**
- Sitios web de terceros
- No requieren cuenta de desarrollador
- Menos seguridad para usuarios
- Bueno para testing inicial

---

### 🚀 Opción D: F-Droid (GRATIS - Open Source)

**Si tu app es código abierto:**
- 100% gratis
- Comunidad open source
- Solo apps de código abierto
- Link: https://f-droid.org/

---

## 🎯 MI RECOMENDACIÓN

### Para empezar GRATIS:
1. ✅ **Amazon Appstore** (sin costo de registro)
2. ✅ Distribuir APK directamente a amigos/clientes
3. ✅ Mantener el PWA activo en web

### Si quieres inversión pequeña:
1. 💰 **Google Play Store** ($25 USD pago único)
2. ✅ Mayor alcance y profesionalismo
3. ✅ Vale la pena si planeas tener muchos usuarios

---

## 📋 CHECKLIST ANTES DE SUBIR

Antes de subir a cualquier tienda, asegúrate de tener:

- [ ] APK firmado y probado
- [ ] Íconos en alta resolución (512x512 mínimo)
- [ ] 3-8 capturas de pantalla de la app funcionando
- [ ] Descripción clara (corta y larga)
- [ ] Política de privacidad (URL pública)
- [ ] Términos y condiciones
- [ ] Categoría de la app (Shopping/Games)
- [ ] Palabras clave relevantes
- [ ] Email de contacto de soporte

---

## 🔐 IMPORTANTE: Digital Asset Links

Para que el APK funcione correctamente, necesitas agregar un archivo a tu hosting:

**Archivo:** `/.well-known/assetlinks.json`

**Contenido:**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.aethercubix.app",
    "sha256_cert_fingerprints": ["TU_FINGERPRINT_AQUI"]
  }
}]
```

El fingerprint lo obtienes al generar el APK con PWABuilder.

---

## 🎨 CAPTURAS DE PANTALLA PARA TIENDAS

Necesitarás capturas diferentes a las del PWA:

**Requisitos Google Play:**
- Mínimo 2, máximo 8 capturas
- Formato: JPG o PNG (24-bit)
- Dimensiones mínimas: 320px
- Dimensiones máximas: 3840px
- Relación de aspecto: 16:9 o 9:16

**Puedes usar las que ya generaste con el screenshot-generator.html**

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa que tu PWA tenga manifest válido
2. Verifica que el service worker esté activo
3. Asegúrate que HTTPS esté funcionando
4. Prueba el APK antes de subirlo

---

## 🚀 PRÓXIMOS PASOS

1. [ ] Generar APK con PWABuilder
2. [ ] Probar APK en tu móvil
3. [ ] Decidir tienda (Amazon = gratis / Google Play = $25)
4. [ ] Preparar assets (capturas, iconos, descripciones)
5. [ ] Crear cuenta de desarrollador
6. [ ] Subir app y enviar a revisión
7. [ ] ¡Publicar! 🎉

---

¿Necesitas ayuda con algún paso específico? ¡Avísame!
