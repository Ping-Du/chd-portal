define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('HotelService', ['$http', '$q', 'SessionService', 'CacheService', function ($http, $q, SessionService, CacheService) {

            function invoke(url, method, requestData, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache === undefined)?true:useCache;
                if (useCachedData) {
                    var cachedData = CacheService.get(url, method, requestData);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }

                $http({
                    method: method,
                    url: SessionService.config().apiRoot + 'hotels' + url,
                    data: requestData
                }).success(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.put(url, method, requestData, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.remove(url, method, requestData);
                    }
                    deferred.reject(data);
                });

                return deferred.promise;
            }

            return {
                getHotels: function () {
                    return invoke('', 'GET', null, true);
                },
                getHotelsByLanguageId: function () {
                    return invoke('/languages/' + SessionService.languageId(), 'GET', null);
                },
                getFeaturedHotels: function () {
                    return invoke('/featured/languages/' + SessionService.languageId(), 'GET', null);
                },
                getHotelsByDestinationId: function (destinationId) {
                    return invoke('/destinations/' + destinationId + '/languages/' + SessionService.languageId(), 'GET', null);
                },
                getFeaturedHotelsByDestinationId: function (destinationId) {
                    return invoke('/featured/destinations/' + destinationId + '/languages/' + SessionService.languageId(), 'GET', null);
                },
                getHotelDetail: function (hotelId) {
                    return invoke('/' + hotelId + '/languages/' + SessionService.languageId(), 'GET', null);
                },
                getTopHotels: function () {
                    return invoke('/top/languages/' + SessionService.languageId(), 'GET', null);
                },
                getTopHotelsByDestinationId: function (destinationId) {
                    return invoke('/top/destinations/' + destinationId + '/languages/' + SessionService.languageId(), 'GET', null);
                },
                getAvailability: function (requestData) {
                    return invoke('/availability', 'POST', requestData);
                }

            };
        }]);

    return modules;
});
