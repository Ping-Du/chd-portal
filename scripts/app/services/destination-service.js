define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('DestinationService', ['$http', '$q', 'SessionService', 'CacheService', function($http, $q, SessionService, CacheService){
            function invoke(url, method, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache === undefined)?true:useCache;
                var apiUrl = SessionService.config().apiRoot + 'destinations' + url;
                if (useCachedData) {
                    var cachedData = CacheService.get(apiUrl, method, null);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }

                $http({
                    method: method,
                    url:apiUrl
                }).success(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.put(apiUrl, method, null, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.remove(apiUrl, method, null);
                    }
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getDestinations: function () {
                    return invoke('', 'GET');
                },
                getDestinationsByLanguageId:function() {
                    return invoke('/languages/'+SessionService.languageId(), 'GET');
                },
                getDestinationDetail:function(destinationId){
                    return invoke('/'+ destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedDestinations:function() {
                    return invoke('/featured/languages/'+SessionService.languageId(), 'GET');
                },
                getTopDestinations:function() {
                    return invoke('/top/languages/'+SessionService.languageId(), 'GET');
                }

            };
        }]);

    return modules;
});
