# 📱 GUÍA: Probar PWA en Móvil

## 🎯 Tu IP de Red: `http://192.168.1.10:3001`

**⚠️ NOTA:** El servidor está corriendo en el puerto **3001** (no 3000)

---

## 📱 **OPCIÓN 1: Android (Chrome) - MÁS FÁCIL**

### Paso 1: Conecta tu móvil a la misma WiFi
- ⚠️ **IMPORTANTE**: Tu móvil Y tu PC deben estar en la **misma red WiFi**
- Verifica que ambos estén conectados a la misma red

### Paso 2: Abre Chrome en tu móvil

1. Abre **Chrome** en tu Android
2. En la barra de direcciones, escribe:
   ```
   http://192.168.1.10:3001
   ```
3. Presiona Enter

### Paso 3: Instalar la PWA

**Verás uno de estos dos:**

#### Opción A: Banner automático
- Aparecerá un banner en la parte inferior:
  ```
  ┌─────────────────────────────┐
  │ Instalar AetherCubix        │
  │ [Instalar] [✕]              │
  └─────────────────────────────┘
  ```
- Toca **"Instalar"**

#### Opción B: Menú manual
Si no aparece el banner:
1. Toca los **3 puntos** (⋮) en la esquina superior derecha
2. Busca: **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
3. Toca esa opción
4. Confirma la instalación

### Paso 4: ¡Listo! 🎉

La app se instalará y aparecerá:
- ✅ En tu **pantalla de inicio** (como WhatsApp, Instagram, etc.)
- ✅ En el **cajón de aplicaciones**
- ✅ Funcionará como una **app nativa**

### Paso 5: Probar Funcionalidades

**Abre la app desde tu pantalla de inicio** y prueba:
- [ ] Ver productos
- [ ] Agregar al carrito
- [ ] Login/Registro
- [ ] Checkout
- [ ] Mis pedidos

**Funciona offline:**
1. Navega un poco por la app
2. Activa **modo avión** ✈️
3. La app seguirá funcionando (usa caché)

---

## 🍎 **OPCIÓN 2: iPhone (Safari)**

### Paso 1: Abre Safari

1. Abre **Safari** (NO Chrome) en tu iPhone
2. Escribe en la barra:
   ```
   http://192.168.1.10:3001
   ```

### Paso 2: Agregar a Pantalla de Inicio

1. Toca el botón **Compartir** (□↑) en la parte inferior
2. Desplázate y busca: **"Agregar a pantalla de inicio"**
3. Toca esa opción
4. Personaliza el nombre si quieres
5. Toca **"Agregar"**

### Paso 3: ¡Listo! 🎉

La app aparecerá en tu pantalla de inicio como cualquier otra app.

**Nota:** iOS tiene algunas limitaciones:
- Funcionalidad offline limitada
- Sin notificaciones push
- Se reinicia al cambiar de app

---

## 💻 **OPCIÓN 3: Probar en Desktop (Desarrollo)**

### Chrome/Edge en Windows:

1. Abre: `http://localhost:3000`
2. Busca el ícono **⊕** en la barra de direcciones
3. Haz clic en **"Instalar AetherCubix"**
4. La app se abrirá en su propia ventana

**O usa DevTools:**
1. Presiona `F12`
2. Ve a pestaña **Application**
3. En el menú izquierdo: **Manifest**
4. Haz clic en **"Install app"**

---

## 🧪 **VERIFICAR QUE ES UNA PWA REAL**

### Checklist de Pruebas:

#### 1. **Instalación**
- [ ] Se puede instalar sin Play Store
- [ ] Aparece en pantalla de inicio
- [ ] Tiene ícono propio

#### 2. **Apariencia**
- [ ] Se abre en pantalla completa (sin barra del navegador)
- [ ] Tiene splash screen al abrir
- [ ] Parece una app nativa

#### 3. **Funcionalidad**
- [ ] Todas las páginas funcionan
- [ ] Login/Registro funciona
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] Navegación fluida

#### 4. **Offline** (Android principalmente)
- [ ] Navega un poco con WiFi
- [ ] Activa modo avión ✈️
- [ ] La app sigue funcionando
- [ ] Páginas visitadas se ven

#### 5. **Performance**
- [ ] Carga rápido
- [ ] Sin errores en consola
- [ ] Transiciones suaves

---

## 🔍 **INSPECCIONAR EN MÓVIL (Chrome Android)**

Para ver la consola y errores en tu móvil:

### Paso 1: Habilitar Depuración USB
En tu Android:
1. Ve a **Ajustes**
2. **Acerca del teléfono**
3. Toca **7 veces** en "Número de compilación"
4. Ve a **Opciones de desarrollador**
5. Activa **Depuración USB**

### Paso 2: Conectar al PC
1. Conecta tu móvil con cable USB
2. En tu PC, abre Chrome
3. Ve a: `chrome://inspect/#devices`
4. Verás tu móvil conectado
5. Haz clic en **"Inspect"**

Ahora puedes ver:
- Consola de errores
- Network tab
- Application tab (Service Worker, Cache)

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### "No puedo acceder desde el móvil"

**Verifica:**
1. ✅ Misma red WiFi (PC y móvil)
2. ✅ Servidor corriendo (`npm run dev`)
3. ✅ Firewall de Windows no bloquea el puerto 3000
4. ✅ IP correcta (`192.168.1.10`, no `localhost`)

**Prueba desactivar el firewall temporalmente:**
```powershell
# En PowerShell (como administrador)
netsh advfirewall set allprofiles state off
```

### "No aparece opción de instalar"

**Requiere:**
- ✅ Manifest válido (ya lo tienes)
- ✅ Service Worker registrado (ya lo tienes)
- ✅ Iconos de 192px y 512px (ya los generaste)
- ✅ HTTPS o localhost (en producción necesitas HTTPS)

**En red local funciona sin HTTPS**, pero en producción sí necesitas HTTPS.

### "La app no funciona offline"

En **desarrollo** (`localhost` o red local):
- El Service Worker NO intercepta peticiones (por diseño)
- **Offline funcionará SOLO en producción** (cuando despliegues)

Para probar offline en desarrollo:
1. Edita `public/service-worker.js`
2. Cambia `ENABLE_FETCH_INTERCEPTION` a `true`
3. Recarga
4. Ahora funcionará offline

---

## 📊 **COMPARACIÓN: Desarrollo vs Producción**

| Característica | Desarrollo (localhost) | Producción (Netlify) |
|----------------|------------------------|----------------------|
| **Instalable** | ✅ SÍ | ✅ SÍ |
| **Funciona Offline** | ❌ NO | ✅ SÍ |
| **Service Worker** | Registrado pero inactivo | ✅ Activo |
| **Caché** | ❌ Deshabilitado | ✅ Habilitado |
| **PWA Completa** | ⚠️ Parcial | ✅ Completa |

---

## 🚀 **PRÓXIMO PASO: Desplegar a Producción**

Para tener la PWA 100% funcional con offline, necesitas desplegarla:

```bash
# 1. Build para producción
npm run build

# 2. Push a GitHub
git add .
git commit -m "feat: PWA lista para producción"
git push origin main

# 3. Netlify despliega automáticamente
# Tu PWA estará en: https://tu-dominio.netlify.app
```

En producción:
- ✅ HTTPS automático
- ✅ Service Worker completamente activo
- ✅ Funciona offline
- ✅ PWA al 100%

---

## 🎉 **¡A PROBAR!**

**Empieza con esto:**
1. En tu móvil Android, abre Chrome
2. Ve a: `http://192.168.1.10:3000`
3. Instala la app
4. ¡Disfruta tu app móvil! 📱

**¿Tuviste algún problema? Revisa la sección "Solución de problemas" arriba.**
