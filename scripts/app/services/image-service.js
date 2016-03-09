define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('ImageService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'images' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getImage: function (path) {
                    return invoke(path, 'GET');
                }
            };
        }]);

    return modules;
});
