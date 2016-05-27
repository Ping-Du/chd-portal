define(['app/services/account-service',
    'app/services/trip-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminTripsController", ['_', '$rootScope', '$scope', 'SessionService',
            '$log', '$location', 'LanguageService', '$window', '$routeParams', 'TripService', '$filter', 'uiGridConstants',
            function (_, $rootScope, $scope, SessionService, $log, $location, LanguageService, $window, $routeParams, TripService, $filter, uiGridConstants) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        //load();
                    }
                });

                var title = {
                    current: 'Current Trips',
                    past: 'Past Trips',
                    quote: 'Quotes'
                };

                $scope.title = title[$routeParams.tripType];
                $scope.includeCancelled = true;
                $scope.startDate = "";
                $scope.endDate = "";

                var reload = false;

                $scope.$watch('includeCancelled', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        reload = true;
                    }
                });

                $scope.trips = null;
                var allTrips = [];
                $scope.filterTrips = function () {
                    if (reload) {
                        reload = false;
                        load();
                        return;
                    }
                    $scope.trips = [];
                    modules.angular.forEach(allTrips, function (item, index) {
                        var startChecked = true;
                        var endChecked = true;
                        if (item.ServicesBegin.substring(0, 10) < $scope.startDate && $scope.startDate != '') {
                            startChecked = false;
                        }
                        if (item.ServicesBegin.substring(0, 10) > $scope.endDate && $scope.endDate != '') {
                            endChecked = false;
                        }

                        if (startChecked && endChecked) {
                            $scope.trips.push(item);
                        }
                    });
                };

                $scope.viewDetails = function (tripId) {
                    //$rootScope.$broadcast('Trip:ViewDetail', tripItem);
                    $location.url('/trips/' + $routeParams.tripType + '/' + tripId + '/' + $scope.languageId, true);
                };

                $scope.gridOptions1 = {
                    showGridFooter: true,
                    enableFiltering: true,
                    enableSorting: true,
                    columnDefs: [
                        {displayName: 'TRIP_ID', name: 'Trip Id', field: 'TripId', headerCellFilter: 'translate'},
                        {displayName: 'PRIMARY_GUEST', field: 'Primary', headerCellFilter: 'translate'},
                        {
                            displayName: 'GUESTS', field: 'Guests', headerCellFilter: 'translate', filters: [
                            {
                                condition: uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                                placeholder: '>='
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                                placeholder: '<='
                            }]
                        },
                        {
                            displayName: 'START_DATE', field: 'Start', headerCellFilter: 'translate', filters: [
                            {
                                condition: uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                                placeholder: '>='
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                                placeholder: '<='
                            }]
                        },
                        {
                            displayName: 'END_DATE', field: 'End', headerCellFilter: 'translate', filters: [
                            {
                                condition: uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                                placeholder: '>='
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                                placeholder: '<='
                            }]
                        },
                        {
                            displayName: 'PRICE', field: 'Price', headerCellFilter: 'translate', filters: [
                            {
                                condition: uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                                placeholder: '>='
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                                placeholder: '<='
                            }]
                        },
                        {
                            displayName: 'CREATE_DATE', field: 'Create', headerCellFilter: 'translate', filters: [
                            {
                                condition: uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                                placeholder: '>='
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                                placeholder: '<='
                            }]
                        },
                        {
                            displayName: 'AVAILABILITY',
                            field: 'Availability',
                            headerCellFilter: 'translate',
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'Administrative', label: 'Administrative'
                                }, {
                                    value: 'Cancelled', label: 'Cancelled'
                                }, {
                                    value: 'Confirmed', label: 'Confirmed'
                                }, {
                                    value: 'NotApplicable', label: 'NotApplicable'
                                },{
                                    value: 'PartlyConfirmed', label: 'PartlyConfirmed'
                                }, {
                                    value: 'OnRequest', label: 'OnRequest'
                                }],
                                condition: function (searchTerm, cellValue) {
                                    return (searchTerm === cellValue);
                                }
                            },
                            cellTemplate: '<span class="glyphicon glyphicon-ok-sign" aria-hidden="true" style="font-size:18px; color:#99cc33; margin-top: 3px; margin-left: 5px;" data-ng-show="row.entity.Availability == \'Confirmed\'"></span>' +
                            '<span class="glyphicon glyphicon-ok-sign" aria-hidden="true" style="font-size:18px; color:#ccff33; margin-top: 3px; margin-left: 5px;" data-ng-show="row.entity.Availability == \'PartlyConfirmed\'"></span>' +
                            '<span class="glyphicon glyphicon-remove-sign" aria-hidden="true" style="font-size:18px; color:#ff9900; margin-top: 3px; margin-left: 5px;" data-ng-show="row.entity.Availability == \'Cancelled\'"></span>' +
                            '<span class="glyphicon glyphicon-question-sign" aria-hidden="true" style="font-size:18px; color:#ffcc00; margin-top: 3px; margin-left: 5px;" data-ng-show="row.entity.Availability == \'OnRequest\'"></span>' +
                            '<span class="glyphicon glyphicon-cog" aria-hidden="true" style="font-size:18px; color:#66CCCC; margin-top: 3px; margin-left: 5px;" data-ng-show="row.entity.Availability == \'Administrative\'"></span>'
                        },
                        {
                            displayName: 'STATUS',
                            field: 'Status',
                            headerCellFilter: 'translate',
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'Booked', label: 'Booked'
                                }, {
                                    value: 'Cancelled', label: 'Cancelled'
                                }, {
                                    value: 'Quote', label: 'Quote'
                                }]
                            }
                        },
                        {
                            displayName: 'ACTION', name: 'Action', enableFiltering: false, enableSorting: false,
                            cellTemplate: '<button id="editBtn" type="button" style="margin-left:10px;" class="btn-small" ng-click="grid.appScope.viewDetails(row.entity.TripId)" >{{"DETAIL"|translate}}</button>'
                        }
                    ],
                    onRegisterApi: function (gridApi) {
                        $scope.grid1Api = gridApi;
                    }
                };

                function populateTrips(data) {
                    $scope.gridOptions1.data = [];
                    if (!data) {
                        return;
                    }

                    _.each(data, function (item) {
                        $scope.gridOptions1.data.push({
                            'TripId': item.TripId,
                            'Primary': item.PrimaryGuestName,
                            'Guests': item.PassengerCount,
                            'Start': $filter('limitTo')(item.ServicesBegin, 10),
                            'End': $filter('limitTo')(item.ServicesEnd, 10),
                            'Price': item.Price,
                            'Create': $filter('limitTo')(item.CreatedOn, 10),
                            'Availability': item.AvailabilityLevel,
                            'Status': item.Status
                        });
                    });

                }

                function load() {
                    var promise;

                    if ($routeParams.tripType == 'current')
                        promise = TripService.getCurrentBookings($scope.includeCancelled);
                    else if ($routeParams.tripType == 'past')
                        promise = TripService.getPastBookings($scope.includeCancelled);
                    else
                        promise = TripService.getQuotes($scope.includeCancelled);

                    promise.then(function (data) {
                        //allTrips = data;
                        //$scope.filterTrips();
                        populateTrips(data);
                    }, function () {
                        //allTrips = [];
                        //$scope.filterTrips();
                        populateTrips(data);
                    });

                }

                load();

            }]);

    return modules;
});

