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
            'ServicesService', 'LanguageService','$translate', '$window', '$cookieStore',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, ServicesService, LanguageService, $translate, $window, $cookieStore) {

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

                var criteria = $cookieStore.get('serviceCriteria');
                $scope.guests = criteria?criteria.guests:[];
                $scope.adults = ''+$scope.guests.length;
                $scope.adultsHasError = false;
                $scope.startDate = criteria?criteria.startDate:"";
                $scope.guestsInfo = ValidateServiceGuestsInfo($scope.guests).message;
                $scope.selectedLocation = criteria?criteria.locationId:null;
                $scope.selectedLocationName = criteria?criteria.locationName:'';
                $scope.selectedSearchLocation = null;

                $scope.showTooltip = false;
                $scope.tooltips = "";

                function showError(message) {
                    $scope.tooltips = message;
                    $scope.showTooltip = true;
                    $timeout(function(){
                        $scope.tooltips = "";
                        $scope.showTooltip = false;
                    }, 5000);
                }

                $scope.showGuests = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-service-popover.html";//"GuestsTemplate.html";

                $scope.closeGuests = function(){
                    var result = ValidateServiceGuestsInfo($scope.guests, false, false);

                    if(!result.hasError) {
                        $scope.showGuests = false;
                        $scope.guestsInfo = result.message;
                    }
                };

                $scope.updateGuests = function() {
                    if(!IsInteger($scope.adults)) {
                        $scope.adultsHasError = true;
                        return;
                    } else {
                        $scope.adultsHasError = false;
                    }

                    var adults = parseInt($scope.adults);
                    if(adults < $scope.guests.length) {
                        $scope.guests = _.first($scope.guests, adults)
                    } else if(adults > $scope.guests.length){
                        var more = adults - $scope.guests.length;
                        for(var i = 0; i < more; i++) {
                            $scope.guests.push({
                                minors: '',
                                minorsError:false
                            });
                        }
                    }
                };

                function doAdditionalProcess(serviceItem){
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
                    ServicesService.getServiceDetail($routeParams.serviceId).then(function(data){
                        $scope.serviceItem = data;
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        if(!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.checkAvailability = function (reload) {
                    $scope.selectedLocation = $scope.selectedSearchLocation?$scope.selectedSearchLocation.originalObject.Id:$scope.selectedLocation;
                    $scope.selectedLocationName = $scope.selectedSearchLocation?$scope.selectedSearchLocation.originalObject.Name:$scope.selectedLocationName;

                    if($scope.selectedLocation == null) {
                        showError("Please select a location!");
                        return;
                    }

                    var result = ValidateServiceGuestsInfo($scope.guests);
                    if(result.adults == 0) {
                        $scope.filterByLocation($scope.selectedLocation);
                    } else {

                        if($scope.startDate == "") {
                            showError("Start date is required!");
                            return;
                        }

                        var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                        var now = new Date();
                        if(startDate < now.getTime()){
                            showError("Start date must be later than now!");
                            return;
                        }

                        if(result.adults > 0 &&  result.hasError) {
                            showError("Guests is required!");
                            return;
                        }

                        var param = {
                            ProductId:$routeParams.serviceId,
                            ServiceTime:null,
                            DestinationId:null,//$scope.selectedLocation,
                            LanguageId:$scope.languageId,
                            CategoryId:null,
                            ServiceType:null,
                            StartDate:$scope.startDate+'T00:00:00.000Z',
                            Guests:GuestsToServiceCriteria($scope.guests)
                        };

                        ServicesService.getAvailability(param).then(function(data){
                            if (data.length > 0) {
                                $scope.serviceItem = data[0];
                                if(!reload)
                                    doAdditionalProcess(data[0]);
                                else
                                    scrollToControl('category');
                            }
                        },function(){
                        });
                    }

                };

                $scope.load = function(reload) {

                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName:$scope.selectedLocationName,
                        startDate:$scope.startDate,
                        guests: $scope.guests
                    });

                    if ($scope.adults != '0' && $scope.adults != '')
                        $scope.checkAvailability(reload);
                    else
                        loadService(reload);
                };

                $scope.load(false);

                $window.scrollTo(0, 0);

            }]);

    return modules;
});
