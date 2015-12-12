'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'OfflinkJs'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/view1'});
    }])
    .run(['ServiceWorkerService', function (ServiceWorkerService) {
        var resources = [
            '/app/view1/view1.html',
            '/app/view2/view2.html',
            '/app/view1/fallback.html'
        ];
        ServiceWorkerService.cache.addAll(resources);
        ServiceWorkerService.register('/app/');
    }]);