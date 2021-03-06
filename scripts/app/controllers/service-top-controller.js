define(['app/services/services-service',
    'app/services/language-service',
    'app/services/destination-service',
    'app/services/navbar-service',
    'app/services/search-service', 'app/utils'
], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceTopController', ['_','$rootScope', '$scope', '$location', '$routeParams', '$cookieStore', 'SessionService',
            'ServicesService', 'LanguageService', 'DestinationService', '$translate','$timeout', '$filter','SearchService',
            function (_, $rootScope, $scope, $location, $routeParams, $cookieStore, SessionService, ServicesService, LanguageService,
                      DestinationService, $translate, $timeout, $filter, SearchService){
                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.apiRoot = SessionService.config().apiRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        //load();
                    }
                });

                function parseService(hash) {
                    var temp = hash.split('/');
                    if (temp.length >= 2 && temp[0] == '')
                        return temp[1];
                    else
                        return null;
                }

                var serviceType = parseService($location.path());
                $scope.serviceType = modules.angular.uppercase(serviceType);
                $scope.imageName = getImageByServiceType(serviceType);

                //var serviceTypeId = getServiceType(serviceType, true);
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.destinations = null;
                $scope.currentDestination = null;
                function loadDestinations() {
                    $scope.destinations = [];
                    $scope.currentDestination = null;
                    DestinationService.getTopDestinations().then(function (data) {
                        var locationId = SessionService.options('service.top.location');
                        var selected = 0;
                        var productType = $filter('capitalize')(serviceType);
                        _.each(data, function (item, index) {
                            if(item.Products[productType] > 0) {
                                $scope.destinations.push(item);
                                if (item.ProductId == locationId)
                                    selected = $scope.destinations.length - 1;
                            }
                        });
                        if(data.length > 0) {
                            $scope.loadServices(data[selected]);
                        }
                    });
                }

                $scope.showServicesMainPage = function (destId, destName) {
                    $cookieStore.put('forDestination', {
                        ProductId: (destId ? destId : $scope.currentDestination.ProductId),
                        Name: (destName ? destName : $scope.currentDestination.Name)
                    });
                    $location.url("/" + serviceType + '/'+ $scope.languageId, true);
                };

                $scope.showServiceDetailPage = function(serviceId) {
                    $location.url("/" + serviceType + '/'+ serviceId+'/'+ $scope.languageId, true);
                };

                $scope.services = null;
                $scope.loadServices = function(destination) {
                    if(destination == $scope.currentDestination)
                        return;

                    $scope.services = [];
                    $scope.currentDestination = destination;
                    SessionService.options('service.top.location', destination.ProductId);
                    ServicesService.getTopServiceByTypeAndDestination(serviceType, destination.ProductId).then(function(data){
                        $scope.services = data; // _.first(data, 3);

                        _.each($scope.services, function(item){
                            item.DetailsURI = 'services.html#/' + serviceType + '/'+item.ProductId+'/'+$scope.languageId;
                            //item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                var criteria = $cookieStore.get('serviceCriteria');
                var servicesDestination = $cookieStore.get('forDestination');
                $cookieStore.remove('forDestination');
                $scope.guests = (criteria? criteria.guests : {Adults: '1', MinorAges: []});
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests,$scope.languageId);
                $scope.startDate = (criteria ? criteria.startDate : ""); //servicesDestination?"":(criteria?criteria.startDate:"");
                $scope.selectedLocation = servicesDestination ? servicesDestination.ProductId : (criteria ? criteria.locationId : null);
                $scope.selectedLocationName = servicesDestination ? servicesDestination.Name : (criteria ? criteria.locationName : null);
                $scope.selectedSearchLocation = null;

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    var allItems = [];
                    SearchService.getLocations().then(function (data) {
                        //$scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                        ServicesService.getServiceByType(serviceType).then(function(serviceList){
                            allItems = data.concat(serviceList);
                            $scope.searchLocations = allItems; //$filter('orderBy')(allItems, '+Name', false);
                        });
                    });
                }

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

                $scope.regexOption = {
                    regex: "[0-9]{1,2}"
                };

                $scope.addMinor = function () {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    if ($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0) {
                        $scope.guests.Adults = '1';
                    }
                    $scope.guests.MinorAges.push('0');
                };

                $scope.deleteMinor = function (index) {
                    $scope.guests.MinorAges.splice(index, 1);
                };

                $scope.$watch('guests.Adults', function (newValue, oldValue, scope) {
                    if (newValue.Trim() == '' || parseInt(newValue) == 0) {
                        $scope.guests.MinorAges = [];
                        $scope.guestsInfo = GetServiceGuestsInfo($scope.guests,$scope.languageId);
                    }
                });

                $scope.closeGuests = function () {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    $scope.showGuests = false;
                    $scope.guestsInfo = GetServiceGuestsInfo($scope.guests,$scope.languageId);
                };

                $scope.$watch('currentDestination', function(newVal, oldVal){
                    if(newVal)
                        $scope.$broadcast('angucomplete-alt:changeInput', 'searchLocation', $scope.currentDestination);
                });

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function() {
                    if(searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.searchServices();
                    }
                });

                $scope.searchServices = function () {


                    if ($scope.selectedSearchLocation === undefined) { // user delete location
                        $scope.selectedLocation = null;
                        $scope.selectedLocationName = '';
                    } else {
                        $scope.selectedLocation = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.ProductId : $scope.selectedLocation;
                        $scope.selectedLocationName = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.Name : $scope.selectedLocationName;
                    }

                    if ($scope.selectedLocation == null) {
                        showError('SELECT_LOCATION');
                        return null;
                    }

                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    if (SessionService.user() == null) {
                        searchAfterLogin = true;
                        $rootScope.$broadcast("OpenLoginModal");
                        return;
                    }

                    $scope.showServicesMainPage($scope.selectedLocation, $scope.selectedLocationName);
                };

                $scope.focusIn = function() {
                    $('#searchLocation_value').select();
                };
                $scope.$watch('selectedSearchLocation', function (newVal, oldVal) {
                    if (newVal == oldVal)
                        return;

                    if (newVal && $scope.currentDestination != null && newVal.originalObject.ProductId != $scope.currentDestination.ProductId) {
                        if(newVal.originalObject.ProductType == 'OPT')
                          $scope.showServiceDetailPage(newVal.originalObject.ProductId, newVal.originalObject.ServiceType.Id);
                        else
                            $scope.showServicesMainPage(newVal.originalObject.ProductId,newVal.originalObject.Name );
                    }
                });

                function load(){
                    //loadSearchLocations();
                    loadDestinations();
                }

                load();

            }]);
});
