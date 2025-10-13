// Service Worker para AetherCubix PWA
const CACHE_NAME = 'aethercubix-v1.0.4'; // ⬆️ Actualizado
const RUNTIME_CACHE = 'aethercubix-runtime-v1.0.4'; // ⬆️ Actualizado

// ⚠️ CAMBIO: Ahora SÍ intercepta en desarrollo para que funcione la instalación
const IS_DEVELOPMENT = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const ENABLE_FETCH_INTERCEPTION = true; // ✅ HABILITADO para que funcione el banner de instalación

// Archivos críticos para cachear en instalación
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/productos.html',
  '/carrito.html',
  '/checkout.html',
  '/login.html',
  '/mis-pedidos.html',
  '/sobre-nosotros.html',
  '/contacto.html',
  '/aprende.html',
  '/styles/main.css',
  '/styles/animations.css',
  '/styles/responsive.css',
  '/styles/auth.css',
  '/scripts/main.js',
  '/scripts/auth-ui.js',
  '/scripts/carrito-page.js',
  '/scripts/checkout-page.js',
  '/scripts/mis-pedidos-page.js',
  '/scripts/confirmacion-page.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs que NO deben cachearse (APIs externas)
const EXCLUDE_URLS = [
  'appwrite.io',
  'googleapis.com',
  'gstatic.com',
  'cloudflare.com',
  'analytics',
  'gtag'
];

// Instalación - Cachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos críticos');
        // Cachear archivos uno por uno para evitar que un error bloquee todo
        return Promise.allSettled(
          CORE_ASSETS.map(url => {
            return cache.add(new Request(url, { cache: 'reload' }))
              .catch(err => {
                console.warn(`[Service Worker] No se pudo cachear: ${url}`, err);
                return null;
              });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear:', error);
      })
  );
  
  // ✅ Activar inmediatamente para que funcione el prompt de instalación
  self.skipWaiting();
});

// Activación - Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // ✅ Tomar control inmediatamente
  return self.clients.claim();
});

// Fetch - Estrategia: Network First con Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // En desarrollo, usar estrategia Network-Only (sin cachear) para evitar conflictos con Vite
  // Pero SÍ responder para que el SW esté activo y permita la instalación
  if (IS_DEVELOPMENT) {
    // Solo pasar la petición sin cachear
    event.respondWith(fetch(request));
    return;
  }
  
  // Validar que sea una URL válida
  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    console.warn('[Service Worker] URL inválida:', request.url);
    return; // No procesar URLs inválidas
  }
  
  // ⚠️ CRÍTICO: Solo cachear http y https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('[Service Worker] Ignorando protocolo:', url.protocol);
    return; // Ignorar chrome-extension:, file:, data:, etc.
  }
  
  // Ignorar URLs excluidas (APIs externas, analytics)
  if (EXCLUDE_URLS.some(excluded => request.url.includes(excluded))) {
    return; // Dejar que el navegador maneje la petición
  }
  
  // Ignorar métodos que no sean GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estrategia para navegación HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear la respuesta exitosa
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone).catch(err => {
                console.warn('[Service Worker] Error cacheando navegación:', err);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde caché
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si no está en caché, mostrar página offline
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // Estrategia para assets estáticos (CSS, JS, imágenes)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Retornar desde caché y actualizar en background
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && url.origin === location.origin) {
                  caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, networkResponse.clone()).catch(err => {
                      console.warn('[Service Worker] Error cacheando asset:', request.url, err);
                    });
                  });
                }
                return networkResponse;
              })
              .catch(() => cachedResponse);
            
            return cachedResponse;
          }
          
          // Si no está en caché, intentar desde red
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200 && url.origin === location.origin) {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, responseClone).catch(err => {
                    console.warn('[Service Worker] Error cacheando desde red:', request.url, err);
                  });
                });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Para todo lo demás: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear respuestas exitosas SOLO del mismo origen
        if (response && response.status === 200 && url.origin === location.origin) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone).catch(err => {
              console.warn('[Service Worker] Error cacheando respuesta:', request.url, err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback a caché si falla la red
        return caches.match(request);
      })
  );
});

// Sincronización en background (para operaciones offline)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en background:', event.tag);
  
  if (event.tag === 'sync-carrito') {
    event.waitUntil(syncCarrito());
  }
  
  if (event.tag === 'sync-pedidos') {
    event.waitUntil(syncPedidos());
  }
});

// Push notifications (futuro)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de AetherCubix',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'aethercubix-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir', icon: '/icons/icon-72x72.png' },
      { action: 'close', title: 'Cerrar', icon: '/icons/icon-72x72.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AetherCubix', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Funciones auxiliares para sincronización
async function syncCarrito() {
  try {
    // Aquí implementarías la lógica de sincronización del carrito
    console.log('[Service Worker] Sincronizando carrito...');
    // const offlineData = await getOfflineData('carrito');
    // await sendToServer(offlineData);
  } catch (error) {
    console.error('[Service Worker] Error sincronizando carrito:', error);
  }
}

async function syncPedidos() {
  try {
    console.log('[Service Worker] Sincronizando pedidos...');
    // Implementar lógica de sincronización
  } catch (error) {
    console.error('[Service Worker] Error sincronizando pedidos:', error);
  }
}

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[Service Worker] Cargado y listo ✅');
