var v = 1.4;

this.addEventListener('install', function (event) {
    console.log("install event");
    event.waitUntil(
        caches.open(v).then(function (cache) {
            //return cache.addAll([
            //    '/app/view1/view1.html',
            //    '/app/view2/view2.html',
            //    '/app/view1/fallback.html'
            //]);
            return cache.addAll(OFFLINK_CACHE);
        })
    );
});

this.addEventListener('fetch', function (event) {
    console.log("fetch event");
    var response;
    event.respondWith(caches.match(event.request).catch(function () {
        return fetch(event.request);
    }).then(function (r) {
        response = r;
        caches.open(v).then(function (cache) {
            //cache.put(event.request, response);
        });
        return response.clone();
    }).catch(function () {
        console.log("fallback!");
        return caches.match('/app/view1/fallback.html');
    }));
});

this.addEventListener('activate', function (event) {
    var cacheWhitelist = [v];
    console.log("activate event");
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    return caches.delete(keyList[key]);
                }
            }));
        })
    );
});