define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('SearchService', ['$http', '$q', 'SessionService', 'CacheService', function($http, $q, SessionService, CacheService){
            function invoke(url, method, showLoading, returnDefer, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache===undefined)?true:useCache;
                if (useCachedData && !returnDefer) {
                    var cachedData = CacheService.get(url, method, null);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }

                $http({
                    method: method,
                    showLoading:showLoading,
                    url: ( SessionService.config().apiRoot + 'search' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    if(useCachedData && !returnDefer){
                        CacheService.put(url, method, null, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if(useCachedData && !returnDefer){
                        CacheService.remove(url, method, null);
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
