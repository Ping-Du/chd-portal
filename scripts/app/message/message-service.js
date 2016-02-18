define(['angular', 'app/common/common-service'], function (angular, common) {
    'use strict';
    var module = angular.module('chd.message',[common.name]);
    module.service('messageService', ['$http', '$q', 'config', function($http, $q, config){
        return {
            getMessage: function () {
                var deferred = $q.defer();
                $http({
                    method:'GET',
                    url:config.apiRoot + 'messages'
                }).success(function(data/*, status, headers, cfg*/){
                    deferred.resolve(data);
                }).error(function(data/*, status, headers, cfg*/){
                    deferred.reject(data);
                });
                return deferred.promise;
            }
        };
    }]);
    return module;
});
