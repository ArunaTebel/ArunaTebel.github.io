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
        ServiceWorkerService.register('/app/sw.js', 1.3);
    }]);