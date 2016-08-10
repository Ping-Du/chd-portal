define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('SearchService', ['$http', '$q', 'SessionService', 'CacheService', function($http, $q, SessionService, CacheService){
            function invoke(url, method, showLoading, returnDefer, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache===undefined)?true:useCache;
                var apiUrl = ( SessionService.config().apiRoot + 'search' + url);
                if (useCachedData && !returnDefer) {
                    var cachedData = CacheService.get(apiUrl, method, null);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }

                $http({
                    method: method,
                    showLoading:showLoading,
                    url: apiUrl
                }).success(function (data/*, status, headers, cfg*/) {
                    if(useCachedData && !returnDefer){
                        CacheService.put(apiUrl, method, null, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if(useCachedData && !returnDefer){
                        CacheService.remove(apiUrl, method, null);
                    }
                    deferred.reject(data);
                });

                if(returnDefer)
                    return deferred;
                else
                    return deferred.promise;
            }

            return {
                getLocations: function () {
                    return invoke('/locations/languages/'+SessionService.languageId(), 'GET', true, false, true);
                },
                getAllSearchableProducts:function() {
                    return invoke('/languages/'+SessionService.languageId(), 'GET', true);
                },
                getSearchResultByKeyword: function(keywords) {
                    return invoke('/phrases/'+keywords+'/languages/'+SessionService.languageId(), 'GET', true);
                },
                searchForKeyword:function(keywords) {
                    return invoke('/phrases/'+keywords+'/languages/'+SessionService.languageId(), 'GET', false, true);
                }
            };
        }]);

    return modules;
});
