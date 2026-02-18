const CACHE_NAME = 'kinnan-tracker-20260218T170000';

const LOCAL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './img/kbp_Jason_Rainville.webp',
    './img/GU.svg',
    './font/Beleren2016-Bold.woff'
];

const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/keyrune@latest/css/keyrune.css',
    'https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching App Shell');

            return cache.addAll(LOCAL_ASSETS).then(() => {
                console.log('[Service Worker] Caching External Assets');
                return cache.addAll(EXTERNAL_ASSETS).catch(err => {
                    console.warn('[Service Worker] Failed to cache external assets:', err);
                });
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());

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