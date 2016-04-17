define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('DocumentService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, data, headers) {
                var deferred = $q.defer();
                var newUrl = url.replace(/\/documentation/, '');
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'documentation' + newUrl),
                    data:data,
                    headers:headers
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getFormats: function () {
                    return invoke('/formats', 'GET');
                },
                getTypes: function(tripId) {
                    return invoke('/trips/'+tripId+'/doctypes', 'GET');
                },
                getEmailAddress: function(tripId, type) {
                    // type: voucher, invoice, receipt
                    return invoke('/trips/'+tripId+'/'+type+'/emailaddresses', 'GET');
                },
                getDoc:function(tripId, type, formatId){
                    return invoke('/trips/'+tripId+'/'+type+'/formats/'+formatId+'/retrieve', 'GET');
                },
                sendDoc:function(tripId, type) {
                    return invoke('/trips/'+tripId+'/'+type+'/send', 'POST',{});
                },
                getDocByUrl: function(url) {
                    return invoke(url, 'GET');
                },
                sendDocByUrl:function(url) {
                    return invoke(url, 'POST');
                }
            };
        }]);

    return modules;
});
