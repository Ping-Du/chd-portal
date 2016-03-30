define(['app/services/services-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/services/search-service',
    'app/directives/datepicker-directive', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$cookieStore','$filter', '$timeout', 'SearchService',
            function (_, $rootScope, $scope, $location, SessionService, ServicesService, LanguageService, $translate, $cookieStore,$filter, $timeout, SearchService) {

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
                $scope.guests = criteria?criteria.guests:{Adults:'0', MinorAges:[]};
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests);
                $scope.startDate = criteria?criteria.startDate:"";
                $scope.selectedLocation = criteria?criteria.locationId:null;
                $scope.selectedLocationName = criteria?criteria.locationName:'';
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

                $scope.featuredServices = [];
                $scope.showServices = [];
                $scope.allServices = [];
                function fillServices() {
                    $scope.featuredServices = [];
                    $scope.showServices = [];
                    _.each($scope.allServices, function (item, key) {
                        var locationed = (item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        var priced = ($scope.selectedPrice == null);
                        if(!priced) {
                            if(_.find(item.AvailabilityCategories, function(category){
                                    return (Math.floor(category.Price/100) == $scope.selectedPrice);
                                })){
                                priced = true;
                            }
                        }
                        if(locationed && priced) {
                            if(item.Featured)
                                $scope.featuredServices.push(item);
                            //else
                                $scope.showServices.push(item);
                        }
                    });
                }

                function fillAllServices(data){
                    $scope.allServices = [];
                    $scope.prices = [];
                    _.each(data, function (item, index) {
                        if(item.ServiceType.Id == serviceTypeId) {
                            item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                            //fillLocations(item.Location);
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
                            ServiceType:serviceTypeId,
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

                function loadAllServices() {
                    ServicesService.getServiceByType(serviceType).then(function (data) {
                        fillAllServices(data);
                        fillServices();
                    }, function () {
                        $scope.allServices = [];
                    });
                }

                function load() {
                    loadSearchLocations();
                    if($scope.guests.Adults != '0' && $scope.guests.Adults != '')
                        $scope.searchServices();
                    else
                        loadAllServices();
                }

                //load();

            }]);
});
