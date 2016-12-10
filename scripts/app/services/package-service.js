define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('PackageService', ['$http', '$q', 'SessionService', 'CacheService', function($http, $q, SessionService, CacheService){
            function invoke(url, method, requestData, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache === undefined)?true:useCache;
                var apiUrl = SessionService.config().apiRoot + 'packages' + url;
                if (useCachedData) {
                    var cachedData = CacheService.get(apiUrl, method, requestData);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }
                $http({
                    method: method,
                    url: apiUrl,
                    data: requestData
                }).success(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.put(apiUrl, method, requestData, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.remove(apiUrl, method, requestData);
                    }
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getPackages: function () {
                    return invoke('', 'GET', null);
                },
                getPackagesByLanguageId: function () {
                    return invoke('/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedPackages:function() {
                    return invoke('/featured/languages/'+SessionService.languageId(), 'GET', null);
                },
                getPackagesByDestinationId:function(destinationId){
                    return invoke('/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedPackagesByDestinationId:function(destinationId) {
                    return invoke('/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getPackageDetail:function(packageId) {
                    return invoke('/'+packageId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getTopPackages:function(){
                    return invoke('/top/languages/'+SessionService.languageId(), 'GET', null);
                },
                getTopPackagesByDestinationId:function(destinationId){
                    return invoke('/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getAvailability:function(requestData){
                    return invoke('/availability', 'POST', requestData);
                },
                getCancellationPolicies: function(productId, categoryId, startDate) {
                    return invoke('/cancellationpolicies/'+productId+'/'+categoryId+'/'+startDate, 'GET', null);
                }

            };
        }]);

    return modules;
});

