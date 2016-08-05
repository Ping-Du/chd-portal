define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('MessageService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, data, showLoading) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'messages' + url),
                    data:data,
                    showLoading:(showLoading === undefined?true:showLoading)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getMessage: function () {
                    return invoke('/languages/'+SessionService.languageId(), 'GET', null, true);
                },
                getMessagesForAgency:function() {
                    return invoke('/languages/'+SessionService.languageId()+'/agency', 'GET', null, true);
                },
                sendForSupport:function(data) {
                    return invoke('/support/send', 'POST', data, false);
                }
            };
        }]);

    return modules;
});