const CACHE_NAME = 'finance-io-v1';
const OFFLINE_DATA_KEY = 'finance-io-offline-data';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/css/',
  '/static/js/',
  '/assets/'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Se for uma requisição para a API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(error => {
          // Se estiver offline, armazena a requisição para sincronizar depois
          if (event.request.method === 'POST' || event.request.method === 'PUT') {
            return saveOfflineData(event.request.clone())
              .then(() => new Response(JSON.stringify({ 
                status: 'offline',
                message: 'Dados serão sincronizados quando houver conexão'
              })));
          }
          
          // Para GETs, tenta retornar dados em cache
          return caches.match(event.request);
        })
    );
  } else {
    // Para outros recursos (arquivos estáticos)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
  }
});

// Sincronização quando voltar online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineData());
  }
});

// Funções auxiliares para dados offline
async function saveOfflineData(request) {
  const data = await request.json();
  const offlineData = await getOfflineData();
  offlineData.push({
    url: request.url,
    method: request.method,
    data: data,
    timestamp: new Date().getTime()
  });
  return localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
}

async function getOfflineData() {
  const data = localStorage.getItem(OFFLINE_DATA_KEY);
  return data ? JSON.parse(data) : [];
}

async function syncOfflineData() {
  const offlineData = await getOfflineData();
  const syncPromises = offlineData.map(item => 
    fetch(item.url, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item.data)
    })
  );
  
  await Promise.all(syncPromises);
  localStorage.removeItem(OFFLINE_DATA_KEY);
} 