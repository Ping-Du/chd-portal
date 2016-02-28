define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('BannerService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function retrieve() {
                var languageId = '';
                if(arguments.length == 1)
                    languageId = '/' + arguments[0];
                var deferred = $q.defer();
                $http({
                    method: 'GET',
                    url: ( SessionService.config().apiRoot + 'banners' + languageId)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getBanners: function () {
                    return retrieve();
                },
                getBannersByLanguageId:function(languageId) {
                    return retrieve(languageId);
                }
            };
        }]);

    return modules;
});
