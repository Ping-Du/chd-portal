define(['app/services/services-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/services/search-service',
    'app/directives/datepicker-directive', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$cookieStore','$filter', '$timeout', 'SearchService','$routeParams',
            function (_, $rootScope, $scope, $location, SessionService, ServicesService, LanguageService, $translate, $cookieStore,$filter, $timeout, SearchService, $routeParams) {

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
                //var serviceTypeId = getServiceType(serviceType, true);
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
                var servicesDestination = $cookieStore.get('forDestination');
                $cookieStore.remove('forDestination');
                $scope.guests = servicesDestination?{Adults:'0', MinorAges:[]}:(criteria?criteria.guests:{Adults:'0', MinorAges:[]});
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests);
                $scope.startDate = servicesDestination?"":(criteria?criteria.startDate:"");
                $scope.selectedLocation = servicesDestination?servicesDestination.ProductId:(criteria?criteria.locationId:null);
                $scope.selectedLocationName = servicesDestination?servicesDestination.Name:(criteria?criteria.locationName:null);
                $scope.selectedSearchLocation = null;

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    SearchService.getLocations().then(function(data){
                        $scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                    });
                }
                $scope.filterByLocation = function (id) {
                    fillServices();
                };

                $scope.types = [];
                function fillTypes(value) {
                    if(!_.find($scope.types, function(item){
                            return item.Id == value.Id;
                        })){
                        _.extend(value, {
                            selected:true
                        });
                        $scope.types.push(value);
                    }
                }

                $scope.selectedType = null;
                $scope.showTypeFilter = (serviceType == 'activities');
                $scope.filterByType = function(typeId) {
                    $scope.selectedType = typeId;
                    fillServices();
                };

                $scope.selectedPrice = null;
                $scope.prices = [];
                function fillPrices(price) {
                    var index = Math.floor(price/100);
                    if(!_.find($scope.prices, function(item){
                            return item.Id == index;
                        })){
                        $scope.prices.push({
                            Id:index,
                            Name:(index==0?'$0-$99':'$'+index+'00-$'+index+'99')
                        });
                    }
                }
                $scope.filterByPrice = function(id){
                    $scope.selectedPrice = id;
                    fillServices();
                };

                $scope.onlyAvailable = false;
                $scope.filterByAvailable = function() {
                    fillServices();
                };

                $scope.featuredServices = [];
                $scope.showServices = [];
                $scope.allServices = [];
                function fillServices() {
                    $scope.featuredServices = [];
                    $scope.showServices = [];
                    _.each($scope.allServices, function (item, key) {
                        // because location is not as same as the parameter sent: 'Los Angeles' got 'Long Beach'
                        var locationed = true; //(item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        var priced = ($scope.selectedPrice == null);
                        var available = ($scope.onlyAvailable == false);
                        var typed = (item.ServiceType.Id == $scope.selectedType || $scope.selectedType == null);
                        typed = _.find($scope.types, function(tp){
                            return (tp.Id == item.ServiceType.Id && tp.selected);
                        });
                        if(!priced || !available) {
                            if(_.find(item.AvailabilityCategories, function(category){
                                    if(!priced && !available)
                                        return ((Math.floor(category.Price/100) == $scope.selectedPrice) && (category.AvailabilityLevel == "Available"));
                                    else if(!priced && available)
                                        return (Math.floor(category.Price/100) == $scope.selectedPrice);
                                    else if(priced && !available) {
                                        return category.AvailabilityLevel == "Available"
                                    } else
                                        return true;
                                })){
                                priced = true;
                                available = true;
                            }
                        }
                        if(locationed && priced && available && typed) {
                            if(item.Featured)
                                $scope.featuredServices.push(item);
                            else
                                $scope.showServices.push(item);
                        }
                    });
                }

                function fillAllServices(data){
                    $scope.allServices = [];
                    $scope.prices = [];
                    $scope.types = [];
                    _.each(data, function (item, index) {
                        if(getServiceType(item.ServiceType.Id) == serviceType) {
                            item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                            //fillLocations(item.Location);
                            fillTypes(item.ServiceType);
                            $scope.allServices.push(item);
                        }

                        if(item.AvailabilityCategories){
                            var minPrice = 0;
                            var maxPrice = 0;
                            _.each(item.AvailabilityCategories, function(category, index){
                                fillPrices(category.Price);
                                if(category.Price < minPrice || minPrice == 0)
                                    minPrice = category.Price;
                                if(category.Price > maxPrice) {
                                    maxPrice = category.Price;
                                }
                            });
                            item.price = makePriceString(minPrice, maxPrice);
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

                $scope.regexOption = {
                    regex: "[0-9]{1,2}"
                };

                $scope.addMinor = function() {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
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

                $scope.closeGuests = function(){
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                        $scope.showGuests = false;
                        $scope.guestsInfo = GetServiceGuestsInfo($scope.guests);
                };

                $scope.searchServices = function() {

                    if($scope.selectedSearchLocation === undefined) { // user delete location
                        $scope.selectedLocation = null;
                        $scope.selectedLocationName = '';
                    } else {
                        $scope.selectedLocation = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.ProductId : $scope.selectedLocation;
                        $scope.selectedLocationName = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.Name : $scope.selectedLocationName;
                    }

                    $scope.selectedPrice = null;

                    //check availability
                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName:$scope.selectedLocationName,
                        startDate:$scope.startDate,
                        guests: $scope.guests
                    });

                    if($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0) {
                        loadAllServices();
                        fillServices();
                    } else {

                        if($scope.selectedLocation == null) {
                            showError("Please select a location!");
                            return;
                        }

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

                        var param = {
                            ProductId:null,
                            ServiceTime:null,
                            DestinationId:$scope.selectedLocation,
                            LanguageId:$scope.languageId,
                            CategoryId:null,
                            ServiceType:getServiceId(serviceType),
                            StartDate:$scope.startDate+'T00:00:00.000Z',
                            Guests:GuestsToServiceCriteria($scope.guests)
                        };

                        ServicesService.getAvailability(param).then(function(data){
                            fillAllServices(data);
                            fillServices();
                        },function(){
                        });
                    }
                };

                function loadAllServices(destinationId) {
                    if(destinationId) {
                        ServicesService.getServiceByTypeAndDestination(serviceType, destinationId).then(function (data) {
                            fillAllServices(data);
                            fillServices();
                        }, function () {
                            $scope.allServices = [];
                        });
                    } else {
                        ServicesService.getServiceByType(serviceType).then(function (data) {
                            fillAllServices(data);
                            fillServices();
                        }, function () {
                            $scope.allServices = [];
                        });
                    }
                }

                function load() {
                    loadSearchLocations();
                    if($scope.guests.Adults != '0' && $scope.guests.Adults != '')
                        $scope.searchServices();
                    else
                        loadAllServices($scope.selectedLocation);
                }

                load();

            }]);
});
