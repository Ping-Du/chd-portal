define(['app/modules'], function (modules) {
    'use strict';
    modules.services
        .service('MessageService', ['$http', '$q', 'Config', function($http, $q, Config){
            return {
                getMessage: function () {
                    var deferred = $q.defer();
                    $http({
                        method:'GET',
                        url:Config.apiRoot + 'messages'
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