define(['app/services/destination-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller("GroupController", ['$rootScope', '$scope', 'SessionService',
            'DestinationService', '$log', '$location', 'LanguageService',
            function ($rootScope, $scope, SessionService, DestinationService, $log, $location, LanguageService) {

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
                        // invoke api
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


