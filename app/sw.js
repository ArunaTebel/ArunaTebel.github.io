var v = "1.4";
if ('undefined' === typeof window) {
    importScripts('manifest.js');
}
this.addEventListener('install', function (event) {
    console.log("install event");
    event.waitUntil(
        caches.open(v).then(function (cache) {
            //return cache.addAll([
            //    '/app/view1/view1.html',
            //    '/app/view2/view2.html',
            //    '/app/view1/fallback.html'
            //]);
            return cache.addAll(OFFLINK_STATIC_CACHE);
        })
    );
});

this.addEventListener('fetch', function (event) {
    console.log("fetch event");
    var response;
    event.respondWith(caches.match(event.request)/**.catch(function () {
        console.log(event.request);
        return fetch(event.request);
    })**/.then(function (r) {
            response = r;
            if (r) {
                return r;
            } else {
                return fetch(event.request).then(function (response) {
                    console.log('Response from network is:', response);
                    caches.open(v).then(function (cache) {
                        cache.put(event.request, response);
                    });
                    return response.clone();
                }).catch(function (error) {
                    // This catch() will handle exceptions thrown from the fetch() operation.
                    // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
                    // It will return a normal response object that has the appropriate error code set.
                    console.error('Fetching failed:', error);
                    console.log("fallback!");
                    return caches.match('/app/view1/fallback.html');
                    //throw error;
                });
                //
                //console.log("responseeeeee : " + r);
                //caches.open(v).then(function (cache) {
                //    cache.put(event.request, response);
                //});
            }
            //return response.clone();
        }));
    //.catch(function () {
    //    console.log("fallback!");
    //    return caches.match('/app/view1/fallback.html');
    //}));
    //console.log("EVENT URL : " + event.request.url);
    var prefix = self.location.protocol + "//" + self.location.hostname + (self.location.port ? ':' + self.location.port : '');
    var rel_path = (event.request.url + "").split(prefix)[1];
    console.log("rel path " + rel_path);
    if (OFFLINK_DYNAMIC_CACHE[rel_path] != null) {
        fetch(OFFLINK_DYNAMIC_CACHE[rel_path]).then(function (r) {
            caches.open(v).then(function (cache) {
                cache.put(OFFLINK_DYNAMIC_CACHE[rel_path], r);
            });
        });
    }
});

this.addEventListener('activate', function (event) {
    var cacheWhitelist = [v];
    console.log("activate event");
    console.log(cacheWhitelist);
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                console.log(typeof key);
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log(cacheWhitelist.indexOf(key));
                    return caches.delete(key);
                }
            }));
        })
    );
});
