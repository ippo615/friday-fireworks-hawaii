const cacheName = "cache5"; // Change value to force update

self.addEventListener("install", event => {
	// Kick out the old service worker
	self.skipWaiting();

	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll([
				// things in root directory
				"android-chrome-192x192.png",
				"android-chrome-512x512.png",
				"apple-touch-icon.png",
				"browserconfig.xml",
				"favicon.ico",
				"favicon-16x16.png",
				"favicon-32x32.png",
				"index.html",
				"main.js",
				"manifest.json",
				"mstile-150x150.png",
				"safari-pinned-tab.svg",
				"site.webmanifest",
				"style.css",
				"sw.js",
				"/",
				// assets
				"assets/07.glb",
				"assets/08.glb",
				"assets/diamond.png",
				"assets/diamond1.png",
				"assets/drawing.svg",
				"assets/light_animation.glb",
				"assets/plus_hard_particle.png",
				"assets/plus_hard_particle_s.png",
				"assets/plus_hard_particle_xs.png",
				"assets/plus_soft_particle.png",
				"assets/sparkle01.png",
				"assets/star.png",
				"assets/star_p11.png",
				"assets/star_p7.png",
				"assets/white_to_alpha.png",
				"assets/white_to_black.png",
				"assets/x_particle.png",
				// threejs libraries:
				"libs/npm/three@0.134.0/build/three.min.js",
				"libs/npm/camera-controls@1.33.1/dist/camera-controls.min.js",
				"libs/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js",
			]);
		})
	);
});

self.addEventListener("activate", event => {
	// Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => {
			Promise.all(
				keys.map(key => {
					if (![cacheName].includes(key)) {
						return caches.delete(key);
					}
				})
			)
		})
	);
});

// Offline-first, cache-first strategy
// Kick off two asynchronous requests, one to the cache and one to the network
// If there's a cached version available, use it, but fetch an update for next time.
// Gets data on screen as quickly as possible, then updates once the network has returned the latest data. 
self.addEventListener("fetch", event => {
	event.respondWith(
		caches.open(cacheName).then(cache => {
			return cache.match(event.request).then(response => {
				return response || fetch(event.request).then(networkResponse => {
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				});
			})
		})
	);
});