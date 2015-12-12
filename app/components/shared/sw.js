/**
 * Created by ArunaTebel on 12/12/2015.
 */
this.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v2').then(function (cache) {
            return cache.addAll([
                '/app/view1/view1.html',
                '/app/view2/view2.html'
            ]);
        })
    );
});

this.addEventListener('fetch', function (event) {
    var response;
    event.respondWith(caches.match(event.request).catch(function () {
        return fetch(event.request);
    }).then(function (r) {
        response = r;
        caches.open('v2').then(function (cache) {
            cache.put(event.request, response);
        });
        return response.clone();
    }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
    }));
});