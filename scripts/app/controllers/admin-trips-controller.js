define(['app/services/account-service',
    'app/services/trip-service',
    'app/directives/datepicker-directive',
    'app/controllers/trip-detail-modal-controller'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminTripsController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$window', '$routeParams', 'TripService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window, $routeParams, TripService) {

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

                $scope.title = title[$routeParams.tripType];
                $scope.includeCancelled = false;
                $scope.startDate = "";
                $scope.endDate = "";

                var reload = false;

                $scope.$watch('includeCancelled', function(newValue, oldValue){
                    if(newValue != oldValue) {
                        reload = true;
                    }
                });

                $scope.trips = null;
                var allTrips = [];
                $scope.filterTrips = function(){
                    if(reload) {
                        reload = false;
                        load();
                        return;
                    }
                    $scope.trips = [];
                    modules.angular.forEach(allTrips, function(item, index){
                        var startChecked = true;
                        var endChecked = true;
                        if(item.ServicesBegin.substring(0, 10) < $scope.startDate && $scope.startDate != '') {
                            startChecked = false;
                        }
                        if(item.ServicesBegin.substring(0, 10) > $scope.endDate && $scope.endDate != '') {
                            endChecked = false;
                        }

                        if(startChecked && endChecked) {
                            $scope.trips.push(item);
                        }
                    });
                };

                $scope.viewDetails = function(tripItem) {
                    $rootScope.$broadcast('Trip:ViewDetail', tripItem);
                };

                function load() {
                    var promise;

                    if($routeParams.tripType == 'current')
                        promise = TripService.getCurrentBookings($scope.includeCancelled);
                    else if($routeParams.tripType == 'past')
                        promise = TripService.getPastBookings($scope.includeCancelled);
                    else
                        promise = TripService.getQuotes($scope.includeCancelled);

                    promise.then(function(data){
                        allTrips = data;
                        $scope.filterTrips();
                    }, function(){
                        allTrips = [];
                        $scope.filterTrips();
                    });

                }

                load();

            }]);

    return modules;
});

