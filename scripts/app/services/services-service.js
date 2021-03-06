define(['app/services/session-service', 'app/services/cache-service'], function (modules) {
    'use strict';
    modules.services
        .service('ServicesService', ['$http', '$q', 'SessionService', 'CacheService', function($http, $q, SessionService, CacheService){
            function invoke(url, method, requestData, useCache) {
                var deferred = $q.defer();
                var useCachedData = (useCache === undefined)?true:useCache;
                var apiUrl = ( SessionService.config().apiRoot + 'services' + url);
                if (useCachedData) {
                    var cachedData = CacheService.get(apiUrl, method, requestData);
                    if (cachedData) {
                        deferred.resolve(cachedData);
                        return deferred.promise;
                    }
                }
                $http({
                    method: method,
                    url: apiUrl,
                    data:requestData
                }).success(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.put(apiUrl, method, requestData, data);
                    }
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    if (useCachedData) {
                        CacheService.remove(apiUrl, method, requestData);
                    }
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getServices: function () {
                    return invoke('', 'GET');
                },
                getServiceTypes:function() {
                    return invoke('/types', 'GET');
                },
                getServiceDetail:function(serviceId) {
                    return invoke('/'+serviceId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getServicesByLanguageId:function() {
                    return invoke('/languages/'+SessionService.languageId(), 'GET');
                },
                getServiceNamesByLanguageId:function() {
                    return invoke('/list/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedServices:function() {
                    return invoke('/featured/languages/'+SessionService.languageId(), 'GET');
                },
                //getShows:function() {
                //    return invoke('/shows/languages/'+SessionService.languageId(), 'GET');
                //},
                //getFeaturedShows:function(){
                //    return invoke('/shows/featured/languages/'+SessionService.languageId(), 'GET');
                //},
                getActivities:function() {
                    return invoke('/activities/languages/'+SessionService.languageId(), 'GET');
                },
                getActivitiesByDestinationId:function(destinationId) {
                    return invoke('/activities/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedActivities:function(){
                    return invoke('/activities/featured/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedActivitiesByDestinationId:function(destinationId){
                    return invoke('/activities/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTopActivities:function() {
                    return invoke('/activities/top/languages/'+SessionService.languageId(), 'GET');
                },
                getTopActivitiesByDestinationId:function(destinationId) {
                    return invoke('/activities/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTours:function() {
                    return invoke('/tours/languages/'+SessionService.languageId(), 'GET');
                },
                getToursByDestinationId:function(destinationId) {
                    return invoke('/tours/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTopTours:function() {
                    return invoke('/tours/top/languages/'+SessionService.languageId(), 'GET');
                },
                getTopToursByDestinationId:function(destinationId) {
                    return invoke('/tours/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedTours:function(){
                    return invoke('/tours/featured/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedToursByDestinationId:function(destinationId){
                    return invoke('/tours/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTransportation:function() {
                    return invoke('/transportation/languages/'+SessionService.languageId(), 'GET');
                },
                getTransportationByDestinationId:function(destinationId) {
                    return invoke('/transportation/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTopTransportation:function() {
                    return invoke('/transportation/top/languages/'+SessionService.languageId(), 'GET');
                },
                getTopTransportationByDestinationId:function(destinationId) {
                    return invoke('/transportation/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedTransportation:function(){
                    return invoke('/transportation/featured/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedTransportationByDestinationId:function(destinationId){
                    return invoke('/transportation/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                //getDining:function() {
                //    return invoke('/dining/languages/'+SessionService.languageId(), 'GET');
                //},
                //getFeaturedDining:function(){
                //    return invoke('/dining/featured/languages/'+SessionService.languageId(), 'GET');
                //},
                getServicesByDestination:function(destinationId) {
                    return invoke('/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedServicesByDestination:function(destinationId){
                    return invoke('/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getServiceByType:function(serviceType){
                    return invoke('/'+serviceType+'/languages/'+SessionService.languageId(), 'GET');
                },
                getServiceByTypeAndDestination:function(serviceType, destinationId) {
                    return invoke('/'+serviceType+'/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getTopServiceByTypeAndDestination:function(serviceType, destinationId) {
                    return invoke('/'+serviceType+'/top/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET');
                },
                getFeaturedServiceByType:function(serviceType){
                    return invoke('/'+serviceType+'/featured/languages/'+SessionService.languageId(), 'GET');
                },
                getAvailability:function(requestData){
                    return invoke('/availability', 'POST', requestData);
                },
                getCancellationPolicies: function(productId, categoryId, startDate) {
                    return invoke('/cancellationpolicies/'+productId+'/'+categoryId+'/'+startDate, 'GET', null);
                }
            };
        }]);

    return modules;
});
