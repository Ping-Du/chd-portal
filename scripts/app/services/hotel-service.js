define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('HotelService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, requestData) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: SessionService.config().apiRoot + 'hotels' + url,
                    data: requestData
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getHotels: function () {
                    return invoke('', 'GET', null);
                },
                getHotelsByLanguageId: function () {
                    return invoke('/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedHotels:function() {
                    return invoke('/featured/languages/'+SessionService.languageId(), 'GET', null);
                },
                getHotelsByDestinationId:function(destinationId){
                    return invoke('/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getFeaturedHotelsByDestinationId:function(destinationId) {
                    return invoke('/featured/destinations/'+destinationId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getHotelDetail:function(hotelId) {
                    return invoke('/'+hotelId+'/languages/'+SessionService.languageId(), 'GET', null);
                },
                getAvailability:function(requestData){
                    //{
                    //    "Nights": 0,
                    //    "Rooms": [
                    //    {
                    //        "Guests": {
                    //            "Adults": 0,
                    //            "MinorAges": [
                    //                0
                    //            ]
                    //        }
                    //    }
                    //],
                    //    "RatePlan": "string",
                    //    "ProductId": "string",
                    //    "DestinationId": "string",
                    //    "LanguageId": "string",
                    //    "CategoryId": "string",
                    //    "StartDate": "2016-02-28T12:50:45.473Z"
                    //}
                    return invoke('/availability', 'POST', requestData);
                }

            };
        }]);

    return modules;
});
