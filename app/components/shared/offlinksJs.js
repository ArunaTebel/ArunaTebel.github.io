/**
 * Created by ArunaTebel on 8/31/2015.
 */

var OfflinkJs = angular.module('OfflinkJs', ['LocalStorageModule']);
OfflinkJs.factory("ConnectionDetectorService", [function () {

    var conDetectFunction = URL.createObjectURL(new Blob(['(',
            function () {
                var conDetectURL = "";
                addEventListener('message', function (e) {
                    switch (e.data.msg) {
                        case 'REGISTER':
                            conDetectURL = e.data.url;
                            setInterval(detectConnectivity, 3000);
                            break;
                        case 'POLL':
                            return getConnectionStatus();
                            break;
                    }
                }, false);

                function detectConnectivity() {
                    var http = new XMLHttpRequest();
                    http.open('HEAD', conDetectURL);
                    http.onreadystatechange = function () {
                        if (this.readyState == this.DONE) {
                            connectionStatus = this.status;
                            self.postMessage(this.status);
                        }
                    };
                    if (conDetectURL != "") {
                        http.send();
                    }
                }
            }.toString(),

            ')()'], {type: 'application/javascript'})
    );

    var callbackFunc = null;
    var connectionStatus = "";

    var worker = new Worker(conDetectFunction);
    URL.revokeObjectURL(conDetectFunction);
    worker.addEventListener('message', function (e) {
        callbackFunc(e.data);
        connectionStatus = e.data;
    }, false);

    return {
        register: function (url, callback) {
            callbackFunc = callback;
            var msg = {
                msg: "REGISTER",
                url: url
            };
            worker.postMessage(msg);
        },
        getConnectionStatus: function () {
            return connectionStatus;
        }
    };

}]);

OfflinkJs.config(['$httpProvider', 'localStorageServiceProvider', function ($httpProvider, localStorageServiceProvider) {
    $httpProvider.interceptors.push('cacheInterceptor');
    localStorageServiceProvider
        .setPrefix('flnk')
        .setNotify(true, true);
}]);

OfflinkJs.factory('ServiceWorkerService', [function () {
    var res = [];
    return {
        register: function (path) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register(path).then(function (reg) {

                    if (reg.installing) {
                        console.log('Service worker installing');
                    } else if (reg.waiting) {
                        console.log('Service worker installed');
                    } else if (reg.active) {
                        console.log('Service worker active');
                    }

                }).catch(function (error) {
                    // registration failed
                    console.log('Registration failed with ' + error);
                });
            }
        }
    };
}]);

OfflinkJs.factory('cacheInterceptor', ['localStorageService', function (localStorageService) {
    return {
        request: function (config) {
            if (config.flnk_cache) {
                localStorageService.set(config.req_prefix + "." + Date.now(), config);
            }
            return config;
        }
    };
}]);

OfflinkJs.factory('flnkSynchronizer', ['$http', 'localStorageService', function ($http, localStorageService) {
    return {
        sync: function (prefix) {
            var lsKeys = localStorageService.keys();
            angular.forEach(lsKeys, function (value, key) {
                if (prefix === value.split(".")[0]) {
                    var config = localStorageService.get(value);
                    $http.post(config.url,
                        config.data
                    ).
                        then(function (response) {
                        }, function (response) {
                        });
                }
            });
            return lsKeys;
        }
    };
}]);

OfflinkJs.factory('flnkDatabaseService', [function () {
    var _db = null;
    var promise;
    return {
        init: function (schemaBuilder) {
            promise = schemaBuilder.connect();
            promise.then(function (db) {
                _db = db;
            });
            return promise;
        },
        insert: function (tableName, data) {
            var table, row;
            if (_db != null) {
                table = _db.getSchema().table(tableName);
                row = table.createRow(data);
                return _db.insertOrReplace().into(table).values([row]).exec();
            } else {
                return promise.then(function (db) {
                    _db = db;
                    table = _db.getSchema().table(tableName);
                    row = table.createRow(data);
                    return _db.insertOrReplace().into(table).values([row]).exec();
                });
                //return schemaBuilder.connect().then(function (db) {
                //    console.log("muwahaha");
                //    _db = db;
                //    table = _db.getSchema().table(tableName);
                //    row = table.createRow(data);
                //    return _db.insertOrReplace().into(table).values([row]).exec();
                //});
            }
        },

        read: function (tableName, selectParam) {
            var table;
            //angular.forEach(selectParam,function(param){
            //        console.log(param);
            //    }
            // );
            if (_db != null) {
                table = _db.getSchema().table(tableName);
                return _db.select.apply(this, selectParam).from(table).exec();
                /**
                 * TODO: add query parameters
                 */
                //return _db.select().from(table).where(item.done.eq(false)).exec();
            } else {
                return promise.then(function (db) {
                    _db = db;
                    table = _db.getSchema().table(tableName);
                    return _db.select().from(table).exec();
                });
                //return schemaBuilder.connect().then(function (db) {
                //    _db = db;
                //    table = _db.getSchema().table(tableName);
                //    return _db.select().from(table).exec();
                //});
            }
        }


    };
}]);

