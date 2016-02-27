define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('MessageService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            return {
                getMessage: function () {
                    var deferred = $q.defer();
                    $http({
                        method:'GET',
                        url: SessionService.config().apiRoot + 'messages'
                    }).success(function(data/*, status, headers, cfg*/){
                        deferred.resolve(data);
                    }).error(function(data/*, status, headers, cfg*/){
                        deferred.reject(data);
                    });
                    return deferred.promise;
                }
            };
        }]);

    return modules;
});