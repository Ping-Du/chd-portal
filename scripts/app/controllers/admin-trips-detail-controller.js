define(['app/services/account-service',
    'app/services/trip-service',
    'app/services/document-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminTripsDetailController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$window', '$routeParams', 'TripService', 'DocumentService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window, $routeParams, TripService, DocumentService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        //load();
                    }
                });

                var title = {
                    current:'Current Trips',
                    past:'Past Trips',
                    quote:'Quotes'
                };

                $scope.title = title[$routeParams.tripType] + ' - ' + $routeParams.tripId;
                $scope.trip = null;
                $scope.showCancelBtn = false;

                $scope.cancelTrip = function() {
                    if($window.confirm('Are you going to cacel this trip?')){
                        var param = {
                            TripId:$scope.trip.TripId,
                            PrimaryGuestName:$scope.trip.PrimaryGuestName
                        };
                        TripService.cancelBooking(param).then(function(data){
                            $scope.showCancelBtn = false;
                            $window.alert('Trip has been cancelled successfully!');
                        }, function(data){
                            $window.alert('There is a error when canceling the trip!');
                        })
                    }
                };

                $scope.getGuest = function(guestId) {
                    for(var i = 0; i < $scope.trip.Passengers.length; i ++) {
                        if($scope.trip.Passengers[i].GuestId == guestId)
                            return $scope.trip.Passengers[i];
                    }
                    return null;
                };

                $scope.docFormats = null;
                $scope.docTypes = null;
                $scope.docContent = null;
                $scope.showDocument = function(docItem) {
                    var url = SessionService.config().apiRoot + docItem.RetrieveUri.substring(1).replace(/%7BformatId%7D/,docItem.type);
                    url = url.replace(/\/\//, '/');
                    var url = docItem.RetrieveUri.replace(/%7BformatId%7D/,'html');
                    DocumentService.getDocByUrl(url).then(function(data){
                        $scope.docContent = data;
                    });
                };

                $scope.sendDocument = function(docItem) {
                    DocumentService.sendDocByUrl(docItem.SendUri).then(function(data){
                       $window.alert('Request for sending document to your email address has been submitted!');
                    }, function(){
                        $window.alert('There is an error when sending request!');
                    });
                };

                function load() {
                    TripService.getTripDetail($routeParams.tripId, true).then(function(data){
                        $scope.trip = data;
                        modules.angular.forEach($scope.trip.DocTypes, function(item){
                            item.type = 'pdf';
                        });
                        if($scope.trip.Status == 'Booked') {
                            $scope.showCancelBtn = true;
                        }
                    });

                    DocumentService.getFormats().then(function(data){
                        $scope.docFormats = data;
                    });


                }

                load();

            }]);

    return modules;
});

