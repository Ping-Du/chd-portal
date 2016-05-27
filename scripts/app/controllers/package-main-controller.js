define(['app/services/package-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/services/search-service',
    'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('PackageMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'PackageService', 'LanguageService', '$translate', '$cookieStore', '$filter','SearchService','$timeout','$routeParams',
            function (_, $rootScope, $scope, $location, SessionService, PackageService, LanguageService, $translate, $cookieStore, $filter, SearchService,
                      $timeout, $routeParams) {

                //console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    SearchService.getLocations().then(function(data){
                        $scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                    });
                }

                $scope.selectedType = null;
                $scope.types = [];
                function fillTypes(value) {
                    if(value == null)
                        return;
                    if(!_.find($scope.types, function(item){
                            return item.Id == value.Id;
                        })){
                        _.extend(value, {
                            selected:true
                        });
                        $scope.types.push(value);
                    }
                }
                $scope.filterByType = function(value){
                    $scope.selectedType = value;
                    fillPackages();
                };

                $scope.featuredPackages = [];
                $scope.showPackages = [];
                $scope.allPackages = [];
                function fillPackages(){
                    $scope.featuredPackages = [];
                    $scope.showPackages = [];
                    _.each($scope.allPackages, function(item, key){

                        var typed = true;
                        if(item.PackageType) {
                            //typed = (item.PackageType.Id == $scope.selectedType || $scope.selectedType == null);
                            typed = _.find($scope.types, function(tp){
                                return (tp.Id == item.PackageType.Id && tp.selected);
                            });
                        }
                        
                        var priced = ($scope.selectedPrice == null);
                        var available = ($scope.onlyAvailable == false);
                        if(!priced || !available) {
                            if(_.find(item.AvailabilityCategories, function(category){
                                    if(!priced && !available)
                                        return ((Math.floor(category.Price/100) == $scope.selectedPrice) && (category.AvailabilityLevel == "Available" || (category.AvailabilityLevel == "Requestable" && packageDestination)));
                                    else if(!priced && available)
                                        return (Math.floor(category.Price/100) == $scope.selectedPrice);
                                    else if(priced && !available) {
                                        return (category.AvailabilityLevel == "Available" || (category.AvailabilityLevel == "Requestable" && packageDestination));
                                    } else
                                        return true;
                                })){
                                priced = true;
                                available = true
                            }
                        }
                        var locationed = true; //(item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(typed && locationed && priced && available) {
                            if(item.Featured)
                                $scope.featuredPackages.push(item);
                            else
                                $scope.showPackages.push(item);
                        }
                    });
                }

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
                    fillPackages();
                };

                $scope.onlyAvailable = false;
                $scope.filterByAvailable = function() {
                    fillPackages();
                };

                function fillAllPackages(data){
                    $scope.allPackages = data;
                    $scope.types = [];
                    $scope.prices = [];
                    _.each($scope.allPackages, function(item, index){
                        item.DetailsURI = 'packages.html#/'+item.ProductId+'/'+$scope.languageId;
                        fillTypes(item.PackageType);
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
                function loadAllPackages(locationId) {
                    $scope.selectedType = null;
                    //$loading.start('main');
                    if(locationId) {
                        PackageService.getPackagesByDestinationId(locationId).then(function (data) {
                            fillAllPackages(data);
                            fillPackages();
                            //$loading.finish('main');
                        }, function () {
                            $scope.allPackages = [];
                            //$loading.finish('main');
                        });
                    } else {
                        PackageService.getPackagesByLanguageId().then(function (data) {
                            fillAllPackages(data);
                            fillPackages();
                            //$loading.finish('main');
                        }, function () {
                            $scope.allPackages = [];
                            //$loading.finish('main');
                        });
                    }
                }

                function getAvailability(param) {
                    $scope.allPackages = [];
                    $scope.showPackages = [];
                    //$loading.start('main');
                    PackageService.getAvailability(param).then(function(data){
                        fillAllPackages(data);
                        fillPackages();
                    },function(){
                        //$loading.finish('main');
                    });
                }

                var criteria = $cookieStore.get('packageCriteria');
                var packageDestination = $cookieStore.get('forDestination');
                $cookieStore.remove('forDestination');
                $scope.startDate = (criteria?criteria.startDate:"");//packageDestination?"":(criteria?criteria.startDate:"");
                //$scope.guests = packageDestination?[]:(criteria?criteria.guests:[]);
                $scope.guests = (criteria && criteria.guests.length > 0 ? criteria.guests : [{
                    Adults: '2',
                    Minors: '0',
                    MinorAges: []
                }]);
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests);
                $scope.selectedLocation = packageDestination?packageDestination.ProductId:(criteria?criteria.locationId:null);
                $scope.selectedLocationName = packageDestination?packageDestination.Name:(criteria?criteria.locationName:null);
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
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";

                function getParam(showTips) {
                    if($scope.selectedSearchLocation === undefined) { // user delete location
                        $scope.selectedLocation = null;
                        $scope.selectedLocationName = '';
                    } else {
                        $scope.selectedLocation = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.ProductId : $scope.selectedLocation;
                        $scope.selectedLocationName = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.Name : $scope.selectedLocationName;
                    }
                    $scope.selectedType = null;

                    //check availability
                    $cookieStore.put('packageCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName:$scope.selectedLocationName,
                        startDate:$scope.startDate,
                        guests: $scope.guests
                    });

                    //if($scope.guests.length == 0) {
                    //    loadAllPackages($scope.selectedLocation);
                    //} else {

                    if($scope.selectedLocation == null) {
                        if(showTips)
                            showError("Please select a location!");
                        return;
                    }

                    if($scope.startDate == "") {
                        if(showTips)
                            showError("Start date is required!");
                        return;
                    }

                    var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                    var now = new Date();
                    if(startDate < now.getTime()){
                        if(showTips)
                            showError("Start date must be later than now!");
                        return;
                    }

                    if($scope.guests.length < 1 ) {
                        if(showTips)
                            showError("Guests is required!");
                        return;
                    }

                    var param = {
                        PackageType:null,
                        ProductId:null,
                        DestinationId:$scope.selectedLocation,
                        LanguageId:$scope.languageId,
                        CategoryId:null,
                        StartDate:$scope.startDate+'T00:00:00.000Z',
                        Rooms:GuestsToHotelArray($scope.guests)
                    };

                    return param;
                }

                $scope.searchPackages = function() {
                    var param = getParam(true);
                    if(param)
                        getAvailability(param);
                };

                $scope.closeGuests = function(){
                    $scope.showGuests = false;
                    $scope.roomsInfo = GetHotelGuestsInfo($scope.guests);
                };

                $scope.addRoom = function() {
                    $scope.guests.push({
                        Adults: '2',
                        Minors:'0',
                        MinorAges: []
                    });
                };

                $scope.deleteRoom = function(index) {
                    $scope.guests.splice(index, 1);
                };

                $scope.minorsChange = function(index) {
                    if($scope.guests[index].Minors > $scope.guests[index].MinorAges.length) {
                        while($scope.guests[index].MinorAges.length < $scope.guests[index].Minors) {
                            $scope.guests[index].MinorAges.push('0');
                        }
                    } else {
                        $scope.guests[index].MinorAges.splice($scope.guests[index].Minors, $scope.guests[index].MinorAges.length - $scope.guests[index].Minors);
                    }
                };


                $scope.$watch('selectedSearchLocation', function(newVal, oldVal){
                    if(newVal == oldVal)
                        return;

                    if(newVal) {
                        $scope.selectedLocation = newVal.originalObject.ProductId;
                        $scope.selectedLocationName = newVal.originalObject.Name;
                        load(false);
                    }

                });

                var packages1, packages2;
                function populate() {
                    $scope.selectedStar = null;
                    $scope.selectedType = null;
                    var all = null;
                    if(packages1 && packages2) {
                        all = packages1.concat(packages2);
                    } else if(packages1){
                        all = packages1;
                    } else if(packages2) {
                        all = packages2;
                    }
                    packages1 = null;
                    packages2 = null;
                    fillAllPackages(all);
                    fillPackages();
                }
                function load(loadLocations){
                    if(loadLocations)
                        loadSearchLocations();

                    if (packageDestination) {
                        PackageService.getPackagesByDestinationId(packageDestination.ProductId).then(function (data1) {
                            packages1 = data1;
                            var param = getParam(false);
                            if (param) {
                                PackageService.getAvailability(param).then(function (data2) {
                                    packages2 = data2;
                                    populate();
                                }, function () {
                                    populate();
                                });
                            } else {
                                populate();
                            }
                        }, function () {
                            populate();
                        });

                    } else {
                        if ($scope.guests.length > 0 && $scope.startDate != '' && $scope.selectedLocation != null)
                            $scope.searchPackages();
                        else
                            loadAllPackages($scope.selectedLocation);
                    }
                }

                load(true);

            }]);
});
