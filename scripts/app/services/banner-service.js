define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('BannerService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'banners' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getBanners: function () {
                    return invoke('', 'GET');
                },
                getBannersByLanguageId:function() {
                    return invoke('/'+SessionService.languageId(), 'GET');
                }
            };
        }]);

    return modules;
});
