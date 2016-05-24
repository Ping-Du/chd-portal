define(['app/services/package-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/controllers/category-detail-modal-controller',
    'app/controllers/consent-required-modal-controller',
    'app/services/shopping-service',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('PackageDetailController', ['_', '$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'PackageService', 'LanguageService', '$translate', '$window', '$cookieStore','$timeout','ShoppingService',
            function (_, $rootScope, $scope, $location, $routeParams, $log, SessionService, PackageService, LanguageService, $translate, $window, $cookieStore, $timeout, ShoppingService) {

                console.info('path:' + $location.path());
                $scope.path = $location.path();
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        $scope.load();
                    }
                });


                $scope.searchLocations = [];

                var criteria = $cookieStore.get('packageCriteria');
                $scope.guests = criteria?criteria.guests:[];
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests);
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
                $scope.showGuests1 = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.showGuests1 = false;
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

                $scope.starClass = '';
                function doAdditionalProcess(pkg){
                    var sliderImageData = [];
                    modules.angular.forEach(pkg.SliderImages, function (item, index) {
                        sliderImageData.push({
                            image: item.ImagePath,
                            thumb: item.ImagePath
                        });
                    });
                    if (sliderImageData.length > 0) {
                        initSlider(sliderImageData);
                    }
                    if (pkg.Latitude != 0 && pkg.Longitude != 0) {
                        $scope.showMap = true;
                        initMap(pkg.Latitude, pkg.Longitude, pkg.Location.Name);
                    }


                }

                $scope.packageItem = null;
                $scope.allPackages = [];
                $scope.showMap = false;
                function loadPackage(reload) {
                    $scope.showNotAvailable = false;
                    $scope.allPackages = [];
                    PackageService.getPackageDetail($routeParams.packageId).then(function (data) {
                        $scope.allPackages.push(data);
                        $scope.packageItem = data;
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        if(!reload)
                            doAdditionalProcess(data);
                    });
                }

                //$scope.$watch('packageItem', function(newVal, oldVal){
                //    if(!newVal)
                //        return;
                //    if(newVal == oldVal)
                //        return;
                //    doAdditionalProcess(newVal);
                //});

                $scope.showNotAvailable = false;
                $scope.checkAvailability = function (reload) {

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

                    if ($scope.guests.length < 1) {
                        showError("Guests is required!");
                        return;
                    }

                    //check availability

                    var param = {
                        PackageType:null,
                        ProductId: $routeParams.packageId,
                        DestinationId: null,
                        LanguageId: $scope.languageId,
                        CategoryId: null, // TODO provide a category
                        StartDate: $scope.startDate + 'T00:00:00.000Z',
                        Rooms: GuestsToHotelArray($scope.guests)
                    };

                    $cookieStore.put('packageCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    $scope.showNotAvailable = false;
                    $scope.allPackages = [];
                    PackageService.getAvailability(param).then(function (data) {

                        //_.each(data[0].AvailabilityCategories[0].Hotels, function(item, index){
                        //    //item.starClass = 'icon-star-' + (item.StarRating * 10);
                        //});

                        //data.HotelPrice = 0;
                        //_.each(data.AvailabilityCategories.Rooms, function(item) {
                        //    data.HotelPrice += item.Price;
                        //});
                        //
                        //data.ServicePrice = 0;
                        //_.each(data.AvailabilityCategories.Services, function(item){
                        //    data.ServicePrice += item.
                        //});

                        if (data.length > 0) {
                            $scope.allPackages = data;
                            $scope.packageItem = data[0];
                            if($scope.packageItem.AvailabilityCategories.length == 0) {
                                $scope.showNotAvailable = true;
                            }
                            if(!reload)
                                doAdditionalProcess(data[0]);
                        }
                        if(reload) {
                            scrollToControl('category');
                        }
                    }, function () {
                        $scope.showNotAvailable = true;
                    });

                };

                $scope.addToShoppingCart = function (categoryIndex) {
                    if (SessionService.user() == null) {
                        $rootScope.$broadcast("OpenLoginModal");
                    } else {
                        if($scope.packageItem.AvailabilityCategories[categoryIndex].AvailabilityLevel == "Requestable" || (
                                $scope.packageItem.Warnings.length > 0 && $scope.packageItem.Warnings[0].ConsentRequired
                            ))
                            $rootScope.$broadcast('ConsentRequired:Open', $scope.packageItem, categoryIndex);
                        else {
                            ShoppingService.addItem($scope.packageItem, categoryIndex);
                            scrollToControl('header');
                            $rootScope.$broadcast('ShoppingCart:Animate');
                        }
                    }
                };

                $scope.$on('ConsentRequired:Confirmed', function(event, product, index){
                    ShoppingService.addItem(product, index);
                    scrollToControl('header');
                    $rootScope.$broadcast('ShoppingCart:Animate');
                });

                $scope.showCategoryDetail = function(index) {
                    $rootScope.$broadcast('CategoryDetail:Open', $scope.packageItem.AvailabilityCategories[index]);
                };

                $scope.load = function(reload) {
                    if(reload) {
                        $cookieStore.put('packageCriteria', {
                            locationId: $scope.selectedLocation,
                            locationName: $scope.selectedLocationName,
                            startDate: $scope.startDate,
                            guests: $scope.guests
                        });
                    }

                    if ($scope.guests.length > 0 && $scope.startDate != '' && $scope.selectedLocation != null)
                        $scope.checkAvailability(reload);
                    else
                        loadPackage(reload);
                };

                $scope.load();

                $window.scrollTo(0, 0);


            }]);

    return modules;
});
