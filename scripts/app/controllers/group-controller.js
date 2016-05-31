define(['app/services/destination-service',
    'app/directives/datepicker-directive',
    'sweetalert',
    'app/services/group-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("GroupController", ['_','$rootScope', '$scope', 'SessionService',
            'DestinationService', '$log', '$location', 'LanguageService','GroupService','$window','$translate',
            function (_, $rootScope, $scope, SessionService, DestinationService, $log, $location, LanguageService, GroupService, $window,$translate) {

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
                        load();
                    }
                });

                var success = "";
                var successInfo = "";
                var failed = "";
                var failedInfo = "";

                $translate("SUCCESS").then(function (translation) {
                    success = translation + "!";
                });
                $translate("GROUP_SUBMIT_OK").then(function (translation) {
                    successInfo = translation;
                });
                $translate("FAILED").then(function (translation) {
                    failed = translation + "!";
                });
                $translate("GROUP_SUBMIT_FAILED").then(function (translation) {
                    failedInfo = translation;
                });

                $scope.group = {
                    adults: 5,
                    children: 0,
                    startDate: '',
                    nights: 1,
                    destinations: [{
                        name: 'Las Vegas',
                        selected: false
                    }, {
                        name: 'Chicago',
                        selected: false
                    }, {
                        name: 'Los Angeles',
                        selected: false
                    }, {
                        name: 'New York',
                        selected: false
                    }, {
                        name: 'San Francisco',
                        selected: false
                    }, {
                        name: 'Hawaii',
                        selected: false
                    }],
                    otherDestinations: '',
                    services: [{
                        name: 'Hotel',
                        selected: false
                    }, {
                        name: 'Golf',
                        selected: false
                    }, {
                        name: 'Transportation',
                        selected: false
                    }, {
                        name: 'Tour(1 Day)',
                        selected: false
                    }, {
                        name: 'Pick Up(airport)',
                        selected: false
                    }, {
                        name: 'Show & Activity',
                        selected: false
                    }, {
                        name: 'Car Rental',
                        selected: false
                    }, {
                        name: 'Tour Guide',
                        selected: false
                    }],
                    otherServices: '',
                    star: 0,
                    email: ''
                };

                $scope.submitForm = function () {
                    $scope.group.star = $('#star').raty('score');
                    if ($scope.group.star === undefined)
                        $scope.group.star = 0;
                    if ($scope.group_form.$valid) {
                        var destinations = [];
                        var services = [];
                        _.each($scope.group.destinations, function(item){
                            if(item.selected) {
                                destinations.push(item.name);
                            }
                        });
                        if($scope.group.otherDestinations != '') {
                            destinations.push($scope.group.otherDestinations);
                        }
                        _.each($scope.group.services, function(item){
                            if(item.selected) {
                                services.push(item.name);
                            }
                        });
                        if($scope.group.otherServices != '') {
                            services.push($scope.group.otherServices);
                        }
                        GroupService.getQuote({
                            Adults:$scope.group.adults,
                            Children:$scope.group.children,
                            DepartureDate:$scope.group.startDate+'T00:00:00.000Z',
                            Nights:$scope.group.nights,
                            Destinations:destinations,
                            Services:services,
                            MinimumStarRating:$scope.group.star,
                            ContactAddresses:["" + $scope.group.email]
                        }).then(function(data){
                            swal(success, successInfo, "success");
                        }, function(data){
                            swal(failed, failedInfo, "error");
                        });
                    } else {
                        $scope.group_form.submitted = true;
                    }
                };

                $scope.destinations = '';
                $scope.changeDestinations = function () {
                    var invalid = true;
                    for (var i = 0; i < $scope.group.destinations.length; i++) {
                        if ($scope.group.destinations[i].selected) {
                            invalid = false;
                            break;
                        }
                    }
                    if(invalid) {
                        if($scope.group.otherDestinations != ''){
                            invalid = false;
                        }
                    }
                    $scope.destinations = invalid?'':'selected';
                };

                $scope.services = '';
                $scope.changeServices = function () {
                    var invalid = true;
                    for (var i = 0; i < $scope.group.services.length; i++) {
                        if ($scope.group.services[i].selected) {
                            invalid = false;
                            break;
                        }
                    }
                    if(invalid) {
                        if($scope.group.otherServices != ''){
                            invalid = false;
                        }
                    }
                    $scope.services = invalid?'':'selected';
                };

                function load() {
                }

                load();

            }]);

    return modules;
});


