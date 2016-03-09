define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('DestinationService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url:SessionService.config().apiRoot + 'destinations' + url
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
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
