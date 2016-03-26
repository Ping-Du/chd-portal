define(['app/services/services-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$cookieStore','$filter', '$timeout',
            function (_, $rootScope, $scope, $location, SessionService, ServicesService, LanguageService, $translate, $cookieStore,$filter, $timeout) {

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

                $scope.locations = [];
                function fillLocations(value) {
                    if (!_.find($scope.locations, function (item) {
                            return item.Id == value.Id;
                        })) {
                        $scope.locations.push(value);
                    }
                }

                $scope.filterByLocation = function (id) {
                    fillServices();
                };

                $scope.featuredServices = [];
                $scope.showServices = [];
                $scope.allServices = [];
                function fillServices() {
                    $scope.featuredServices = [];
                    $scope.showServices = [];
                    _.each($scope.allServices, function (item, key) {
                        var locationed = (item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(locationed) {
                            if(item.Featured)
                                $scope.featuredServices.push(item);
                            //else
                                $scope.showServices.push(item);
                        }
                    });
                }

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

                $scope.searchServices = function() {
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

                        //check availability
                        $cookieStore.put('serviceCriteria', {
                            locationId: $scope.selectedLocation,
                            locationName:$scope.selectedLocationName,
                            startDate:$scope.startDate,
                            guests: $scope.guests
                        });

                        var param = {
                            ProductId:null,
                            ServiceTime:null,
                            DestinationId:$scope.selectedLocation,
                            LanguageId:$scope.languageId,
                            CategoryId:null,
                            ServiceType:serviceTypeId,
                            StartDate:$scope.startDate+'T00:00:00.000Z',
                            Guests:GuestsToServiceCriteria($scope.guests)
                        };

                        ServicesService.getAvailability(param).then(function(data){
                            $scope.allServices = [];
                            _.each(data, function (item, index) {
                                if(item.ServiceType.Id == serviceTypeId) {
                                    item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                                    //fillLocations(item.Location);
                                    $scope.allServices.push(item);
                                }
                            });
                            fillServices();
                        },function(){
                        });
                    }
                };

                function loadAllServices() {
                    ServicesService.getServiceByType(serviceType).then(function (data) {
                        $scope.allServices = data;
                        _.each($scope.allServices, function (item, index) {
                            item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                            fillLocations(item.Location);
                        });
                        fillServices();
                    }, function () {
                        $scope.allServices = [];
                    });
                }

                function load() {
                    if($scope.adults != '0' && $scope.adults != '')
                        $scope.searchServices();
                    else
                        loadAllServices();
                }

                load();

            }]);
});
