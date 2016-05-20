define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('TripService', ['$http', '$q', 'SessionService', function($http, $q, SessionService){
            function invoke(url, method, data, headers, showLoading) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'trips' + url),
                    data:data,
                    headers:headers,
                    showLoading:(showLoading === undefined?true:showLoading)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getTrips: function () {
                    return invoke('', 'GET');
                },
                getTripDetail:function(tripId, itineraryForm) {
                    return invoke('/'+tripId+'?itineraryForm='+itineraryForm, 'GET');
                },
                getBookings:function(includeCancelled){
                    return invoke('/bookings/agency?includeCancelled='+includeCancelled, 'GET');
                },
                getPastBookings:function(includeCancelled){
                    return invoke('/bookings/agency/past?includeCancelled='+includeCancelled, 'GET');
                },
                getCurrentBookings:function(includeCancelled){
                    return invoke('/bookings/agency/current?includeCancelled='+includeCancelled, 'GET');
                },
                getQuotes:function(includeCancelled){
                    return invoke('/quotes/agency?includeCancelled='+includeCancelled, 'GET');
                },
                saveBooking:function(bookingData){
                    return invoke('/bookings/save', 'POST', bookingData);
                },
                cancelBooking:function(bookingData){
                    return invoke('/cancel', 'DELETE', bookingData, { "Content-Type": "application/json;charset=UTF-8"}, false);
                },
                saveAssignments:function(data) {
                    return invoke('/saveassignments', 'POST', data);
                },
                registerTrip:function(tripId, lastName, beginDate){
                    return invoke('/'+tripId+'/'+lastName+'/'+beginDate, 'POST');
                },
                getBarcodeImage:function(barcode, title) {
                    return invoke('/barcodeimage/'+barcode+'/'+title, 'GET');
                }
            };
        }]);

    return modules;
});

