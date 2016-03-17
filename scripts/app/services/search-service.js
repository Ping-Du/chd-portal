define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('SearchService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'search' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getLocations: function () {
                    return invoke('/locations/languages/'+SessionService.languageId(), 'GET');
                },
                getAllSearchableProducts:function() {
                    return invoke('/languages/'+SessionService.languageId(), 'GET');
                },
                getSearchResultByKeyword: function(keywords) {
                    return invoke('/phrases/'+keywords+'/languages/'+SessionService.languageId(), 'GET');
                }
            };
        }]);

    return modules;
});
