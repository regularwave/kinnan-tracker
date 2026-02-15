const CACHE_NAME = 'kinnan-tracker-20260214T192500';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css', 
    './script.js',
    './img/kbp_Jason_Rainville.webp',
    './img/GU.svg',
    'https://cdn.jsdelivr.net/npm/keyrune@latest/css/keyrune.css',
    'https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css',
    './font/Beleren2016-Bold.woff',
    './font/Beleren2016-Bold.ttf',
    './font/Beleren2016-Bold.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});