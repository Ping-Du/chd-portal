define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('PackageService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, requestData) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: SessionService.config().apiRoot + 'packages' + url,
                    data: requestData
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getPackages: function () {
                    return invoke('', 'GET', null);
                },
                getPackagesByLanguageId: function () {
                    return invoke('/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedPackages:function() {
                    return invoke('/featured/languages/'+SessionService.languageId(), 'GET', null);
                },
                getPackagesByDestinationId:function(destinationId){
                    return invoke('/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedPackagesByDestinationId:function(destinationId) {
                    return invoke('/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getPackageDetail:function(packageId) {
                    return invoke('/'+packageId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getTopPackages:function(){
                    return invoke('/top/languages/'+SessionService.languageId(), 'GET', null);
                },
                getTopPackagesByDestinationId:function(destinationId){
                    return invoke('/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getAvailability:function(requestData){
                    return invoke('/availability', 'POST', requestData);
                }

            };
        }]);

    return modules;
});

