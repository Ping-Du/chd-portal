define(['app/services/services-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$window', '$cookieStore','$timeout',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, ServicesService, LanguageService, $translate, $window, $cookieStore, $timeout) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                function parseService(hash) {
                    var temp = hash.split('/');
                    if (temp.length >= 2 && temp[0] == '')
                        return temp[1];
                    else
                        return null;
                }

                var serviceType = parseService($location.path());
                var serviceTypeId = getServiceType(serviceType, true);
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                $scope.searchLocations = [];

                var criteria = $cookieStore.get('serviceCriteria');
                $scope.guests = criteria?criteria.guests:{Adults:'0', MinorAges:[]};
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests);
                $scope.startDate = criteria ? criteria.startDate : "";
                $scope.selectedLocation = criteria ? criteria.locationId : null;
                $scope.selectedLocationName = criteria ? criteria.locationName : '';
                $scope.selectedSearchLocation = null;

                $scope.showTooltip = false;
                $scope.tooltips = "";

                function showError(message) {
                    $scope.tooltips = message;
                    $scope.showTooltip = true;
                    $timeout(function () {
                        $scope.tooltips = "";
                        $scope.showTooltip = false;
                    }, 5000);
                }

                $scope.showGuests = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-service-popover.html";//"GuestsTemplate.html";

                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.guestsInfo = GetServiceGuestsInfo($scope.guests);
                };

                $scope.regexOption = {
                    regex: "[0-9]{1,2}"
                };

                $scope.addMinor = function() {
                    if($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0) {
                        $scope.guests.Adults = '1';
                    }
                    $scope.guests.MinorAges.push('0');
                };

                $scope.deleteMinor = function(index) {
                    $scope.guests.MinorAges.splice(index, 1);
                };

                $scope.$watch('guests.Adults', function(newValue,oldValue, scope){
                    if(newValue.Trim() == ''|| parseInt(newValue) == 0) {
                        $scope.guests.MinorAges = [];
                    }
                });

                function doAdditionalProcess(serviceItem) {
                    var sliderImageData = [];
                    modules.angular.forEach(serviceItem.SliderImages, function (item, index) {
                        sliderImageData.push({
                            image: item.ImagePath,
                            thumb: item.ImagePath
                        });
                    });
                    if (sliderImageData.length > 0) {
                        initSlider(sliderImageData);
                    }
                    if (serviceItem.Latitude != 0 && serviceItem.Longitude != 0) {
                        $scope.showMap = true;
                        initMap(serviceItem.Latitude, serviceItem.Longitude, serviceItem.Name);
                    }
                }

                $scope.serviceItem = null;
                $scope.showMap = false;
                function loadService(reload) {
                    ServicesService.getServiceDetail($routeParams.serviceId).then(function (data) {
                        $scope.serviceItem = data;
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        clearEmptyAddress(data.Address);
                        if (!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.checkAvailability = function (reload) {

                    if ($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0 ){
                        showError('Guests required!');
                        return;
                    }

                    if ($scope.startDate == "") {
                        showError("Start date is required!");
                        return;
                    }

                    var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                    var now = new Date();
                    if (startDate < now.getTime()) {
                        showError("Start date must be later than now!");
                        return;
                    }


                    var param = {
                        ProductId: $routeParams.serviceId,
                        ServiceTime: null,
                        DestinationId: null,//$scope.selectedLocation,
                        LanguageId: $scope.languageId,
                        CategoryId: null,
                        ServiceType: null,
                        StartDate: $scope.startDate + 'T00:00:00.000Z',
                        Guests: GuestsToServiceCriteria($scope.guests)
                    };

                    ServicesService.getAvailability(param).then(function (data) {
                        if (data.length > 0) {
                            $scope.serviceItem = data[0];
                            clearEmptyAddress(data[0].Address);
                            if (!reload)
                                doAdditionalProcess(data[0]);
                        }
                        if(reload) {
                            scrollToControl('category');
                        }
                    }, function () {
                    });

                };

                function load(reload) {

                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    if ($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0 )
                        loadService(reload);
                    else
                        $scope.checkAvailability(reload);
                }

                load(false);

                $window.scrollTo(0, 0);

            }]);

    return modules;
});
