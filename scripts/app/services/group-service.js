define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('GroupService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, data) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'groups' + url),
                    data:data
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getQuote: function (data) {
                    return invoke('/quotationrequest/send', 'POST', data);
                }
            };
        }]);

    return modules;
});
