define(['app/services/package-service',
    'app/services/language-service',
    'app/services/destination-service',
    'app/services/navbar-service',
    'app/services/search-service', 'app/utils'
], function (modules) {
    'use strict';

    modules.controllers
        .controller('PackageTopController', ['_', '$rootScope', '$scope', '$location', '$routeParams', '$cookieStore', 'SessionService',
            'PackageService', 'LanguageService', 'DestinationService', 'SearchService', '$timeout','$filter',
            function (_, $rootScope, $scope, $location, $routeParams, $cookieStore, SessionService, PackageService, LanguageService, DestinationService, SearchService, $timeout, $filter) {
                //console.info('path:' + $location.path());
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

                $scope.destinations = null;
                $scope.currentDestination = null;
                function loadDestinations() {
                    $scope.destinations = [];
                    $scope.currentDestination = null;
                    DestinationService.getTopDestinations().then(function (data) {
                        var locationId = SessionService.options('package.top.location');
                        var selected = 0;
                        _.each(data, function (item, index) {
                            if(item.Products.Packages > 0) {
                                $scope.destinations.push(item);
                                if (item.ProductId == locationId)
                                    selected = $scope.destinations.length-1;
                            }
                        });
                        if(data.length > 0) {
                            $scope.loadPackages(data[selected]);
                        }
                    });
                }

                $scope.showPackagesMainPage = function (destId, destName) {
                    $cookieStore.put('forDestination', {
                        ProductId: (destId ? destId : $scope.currentDestination.ProductId),
                        Name: (destName ? destName : $scope.currentDestination.Name)
                    });
                    $location.url("/" + $scope.languageId, true);
                };

                $scope.showPackageDetailPage = function(packageId) {
                    $location.url("/" + packageId + "/" + $scope.languageId);
                };

                $scope.packages = null;
                $scope.loadPackages = function (destination) {
                    if (destination == $scope.currentDestination)
                        return;

                    $scope.packages = [];
                    $scope.currentDestination = destination;
                    SessionService.options('package.top.location', destination.ProductId);
                    PackageService.getTopPackagesByDestinationId(destination.ProductId).then(function (data) {
                        $scope.packages = data;

                        _.each($scope.packages, function (item) {
                            item.DetailsURI = 'packages.html#/' + item.ProductId + '/' + $scope.languageId;
                            //item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    var allItems = [];
                    SearchService.getLocations().then(function (data) {
                        //$scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                        //PackageService.getPackagesByLanguageId().then(function(pkgList){
                        PackageService.getPackageNamesByLanguageId().then(function(pkgList){
                            //allItems = data.concat(pkgList);
                            allItems = data.concat([]);
                            _.each(pkgList, function(item, index){
                                allItems.push({
                                    ProductId: item.Id,
                                    Name: item.Name,
                                    ProductType:item.Type
                                });
                            });
                            $scope.searchLocations = allItems; //$filter('orderBy')(allItems, '+Name', false);
                        });
                    });
                }

                var criteria = $cookieStore.get('packageCriteria');
                var packageDestination = $cookieStore.get('forDestination');
                $cookieStore.remove('forDestination');
                $scope.startDate = (criteria ? criteria.startDate : "");//packageDestination?"":(criteria?criteria.startDate:"");
                //$scope.guests = packageDestination?[]:(criteria?criteria.guests:[]);
                $scope.guests = (criteria && criteria.guests.length > 0 ? criteria.guests : [
                    {
                        Adults: '2',
                        Minors: '0',
                        MinorAges: []
                    }
                ]);
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests,$scope.languageId);
                $scope.selectedLocation = packageDestination ? packageDestination.ProductId : (criteria ? criteria.locationId : null);
                $scope.selectedLocationName = packageDestination ? packageDestination.Name : (criteria ? criteria.locationName : null);
                $scope.selectedSearchLocation = null;

                $scope.showGuests = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.roomsInfo = GetHotelGuestsInfo($scope.guests,$scope.languageId);
                };

                var maxRoomAllowed = 9;
                $scope.addRoomBtn = true;
                $scope.addRoom = function () {
                    if($scope.guests.length < maxRoomAllowed) {
                        $scope.guests.push({
                            Adults: '2',
                            Minors: '0',
                            MinorAges: []
                        });
                    } else {
                        $scope.addRoomBtn = false;
                    }
                };

                $scope.deleteRoom = function (index) {
                    $scope.guests.splice(index, 1);
                    $scope.addRoomBtn = ($scope.guests.length < maxRoomAllowed);
                };

                $scope.minorsChange = function (index) {
                    if ($scope.guests[index].Minors > $scope.guests[index].MinorAges.length) {
                        while ($scope.guests[index].MinorAges.length < $scope.guests[index].Minors) {
                            $scope.guests[index].MinorAges.push('0');
                        }
                    } else {
                        $scope.guests[index].MinorAges.splice($scope.guests[index].Minors, $scope.guests[index].MinorAges.length - $scope.guests[index].Minors);
                    }
                };

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

                $scope.$watch('currentDestination', function (newVal, oldVal) {
                    if(newVal)
                        $scope.$broadcast('angucomplete-alt:changeInput', 'searchLocation', $scope.currentDestination);
                });

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function() {
                    if(searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.searchPackages();
                    }
                });

                $scope.searchPackages = function () {
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

                    $cookieStore.put('packageCriteria', {
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

                    $scope.showPackagesMainPage($scope.selectedLocation, $scope.selectedLocationName);
                };

                $scope.$watch('selectedSearchLocation', function (newVal, oldVal) {
                    if (newVal == oldVal)
                        return;

                    if (newVal && $scope.currentDestination != null && newVal.originalObject.ProductId != $scope.currentDestination.ProductId) {
                        if(newVal.originalObject.ProductType == 'PKG')
                            $scope.showPackageDetailPage(newVal.originalObject.ProductId);
                        else
                            $scope.showPackagesMainPage(newVal.originalObject.ProductId,newVal.originalObject.Name );
                    }
                });

                function load() {
                    loadSearchLocations();
                    loadDestinations();
                }

                load();

            }]);
});
