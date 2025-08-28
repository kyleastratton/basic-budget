// Service Worker Registration
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('sw.js')
//         .then((registration) => {
//             console.log('SW registered: ', registration);
//         })
//         .catch((registrationError) => {
//             console.log('SW registration failed: ', registrationError);
//         });
//     });
// }

const CACHE_NAME = "my-cache-v1";
const urlsToCache = ["/", "/index.html", "/styles.css", "/script.js", "/assets/logo.png", "/assets/logos"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
