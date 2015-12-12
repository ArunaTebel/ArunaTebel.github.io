/**
 * Created by ArunaTebel on 12/12/2015.
 */
var v = 1.1;
this.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(v).then(function (cache) {
            return cache.addAll([
                '/app/view1/view1.html',
                '/app/view2/view2.html'
            ]);
        })
    );
});

this.addEventListener('fetch', function (event) {
    console.log("hfhfhf");
    var response;
    event.respondWith(caches.match(event.request).catch(function () {
        return fetch(event.request);
    }).then(function (r) {
        response = r;
        caches.open(v).then(function (cache) {
            cache.put(event.request, response);
        });
        return response.clone();
    }).catch(function () {
        console.log("asdasdasdasdasda");
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
    }));
});

this.addEventListener('activate', function (event) {
    var cacheWhitelist = [v];
    console.log("activ");
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
