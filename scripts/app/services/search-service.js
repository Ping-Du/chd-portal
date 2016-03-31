define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('SearchService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, showLoading, returnDefer) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    showLoading:showLoading,
                    url: ( SessionService.config().apiRoot + 'search' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });

                if(returnDefer)
                    return deferred;
                else
                    return deferred.promise;
            }

            return {
                getLocations: function () {
                    return invoke('/locations/languages/'+SessionService.languageId(), 'GET', true);
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
