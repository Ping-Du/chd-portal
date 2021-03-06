define(['app/services/package-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/controllers/category-detail-modal-controller',
    'app/controllers/consent-required-modal-controller',
    'app/controllers/warnings-modal-controller',
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

                $scope.hideSearchBar = ($location.absUrl().indexOf("packageinfo.html") >= 0);

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        $scope.load(true);
                    }
                });


                $scope.searchLocations = [];

                var criteria = $cookieStore.get('packageCriteria');
                $scope.guests = criteria?criteria.guests:[];
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests,$scope.languageId);
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

                $scope.availabilityFilter = '0';
                $scope.myFilter = function(v1, v2) {
                    if(v2 === '1')
                        return v1 === 'Available';
                    else if(v2 === '2')
                        return v1 === 'Requestable';
                    else if(v2 === '3')
                        return v1 !== 'NotAvailable';
                    else
                        return true;
                };

                $scope.myComparator = function(v1, v2) {
                    if(v1.AvailabilityLevel === v2.AvailabilityLevel) {
                        if(v1.Price === v2.Price)
                            return 0;
                        else if(v1.Price < v2.Price)
                            return -1;
                        else
                            return 1;
                    } else {
                        if(v1.AvailabilityLevel === 'Available')
                            return -1;
                        else if(v1.AvailabilityLevel === 'Requestable') {
                            if(v2.AvailabilityLevel === 'Available')
                                return 1;
                            else
                                return -1;
                        } else {
                            return 1;
                        }
                    }
                };

                $scope.showGuests = false;
                $scope.showGuests1 = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.showGuests1 = false;
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
                        $scope.showMap = false;
                        //$scope.showMap = true;
                        //initMap(pkg.Latitude, pkg.Longitude, pkg.Location.Name);
                    }
                }

                $scope.detailTitle = (SessionService.languageId() == 'ENG'?'Details':'详细介绍');
                function setDetailTitle(data) {
                    _.each(data.AdditionalInformation, function(item, index){
                        if(item.Section == 'HDFULLDESC') {
                            $scope.detailTitle = item.Title;
                        }
                    });
                }

                $scope.packageItem = null;
                $scope.allPackages = [];
                $scope.showMap = false;

                $scope.scrollToControl = function(controlId) {
                    scrollToControl(''+controlId);
                };

                function prepareInformation() {
                    var i, j;
                    var parts = {};
                    parts['0'] = 'top';
                    parts["1"] = 'category';

                    // remove main info
                    for(i = 0; i < $scope.packageItem.AdditionalInformation.length; i++) {
                        if($scope.packageItem.AdditionalInformation[i].InformationId == $scope.packageItem.MainInformation.InformationId) {
                            $scope.packageItem.AdditionalInformation.splice(i, 1);
                        }
                    }

                    // remove duplicated info
                    if($scope.packageItem.Warnings) {
                        for (i = 0; i < $scope.packageItem.Warnings.length; i++) {
                            for (j = 0; j < $scope.packageItem.AdditionalInformation.length; j++) {
                                if ($scope.packageItem.Warnings[i].InformationId == $scope.packageItem.AdditionalInformation[j].InformationId) {
                                    $scope.packageItem.AdditionalInformation.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }

                    for(i = 0; i < $scope.packageItem.AdditionalInformation.length; i++) {
                        parts[""+(i+2)] = "" + $scope.packageItem.AdditionalInformation[i].InformationId;
                    }

                    parts[""+(2+$scope.packageItem.AdditionalInformation.length)] = "term";
                    parts[""+(2+$scope.packageItem.AdditionalInformation.length+1)] = "map";

                    $timeout(function() {
                        $('.detail-nav-wrap').stickUp({
                            parts: parts,
                            itemClass: 'menu-item',
                            itemHover: 'active'
                        });
                    }, 1000);
                }

                function loadPackage(reload) {
                    $scope.showNotAvailable = false;
                    $scope.allPackages = [];
                    PackageService.getPackageDetail($routeParams.packageId).then(function (data) {
                        $scope.allPackages.push(data);
                        $scope.packageItem = data;
                        setDetailTitle(data);
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        prepareInformation();
                        if(!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.getIndexByCategoryId = function(categoryId) {
                    for (var i = 0; i < $scope.packageItem.AvailabilityCategories.length; i++) {
                        if ($scope.packageItem.AvailabilityCategories[i].Id == categoryId)
                            return i;
                    }

                    return -1;
                };

                $scope.currentIndex = -1;
                $scope.closePrice = function() {
                    if($scope.currentIndex >= 0) {
                        $scope.showHidePrice($scope.packageItem.AvailabilityCategories[$scope.currentIndex].Id);
                    }
                };

                $scope.currentCategory = null;
                $scope.showHidePrice = function(categoryId) {
                    var index = $scope.getIndexByCategoryId(categoryId);
                    $scope.currentCategory = null;
                    $scope.currentIndex = index;
                    for (var i = 0; i < $scope.packageItem.AvailabilityCategories.length; i++) {
                        if (i == index)
                            continue;
                        else
                            $scope.packageItem.AvailabilityCategories[i].showPrice = false;
                    }
                    $scope.packageItem.AvailabilityCategories[index].showPrice = !$scope.packageItem.AvailabilityCategories[index].showPrice;
                    $scope.currentCategory = $scope.packageItem.AvailabilityCategories[index];
                };

                //$scope.$watch('packageItem', function(newVal, oldVal){
                //    if(!newVal)
                //        return;
                //    if(newVal == oldVal)
                //        return;
                //    doAdditionalProcess(newVal);
                //});

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function() {
                    if(searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.checkAvailability(true);
                    }
                });

                $scope.showNotAvailable = false;
                $scope.checkAvailability = function (reload) {
                    if (SessionService.user() == null) {
                        searchAfterLogin = true;
                        $rootScope.$broadcast("OpenLoginModal");
                        return;
                    }

                    if ($scope.startDate == "") {
                        showError("START_DATE_REQUIRED");
                        return;
                    }

                    var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                    var now = new Date();
                    if (startDate < now.getTime()) {
                        showError("Start date must be later than now!");
                        return;
                    }

                    if ($scope.guests.length < 1) {
                        showError("GUESTS_REQUIRED");
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
                            setDetailTitle(data[0]);
                            if($scope.packageItem.AvailabilityCategories == null)
                                $scope.packageItem.AvailabilityCategories = [];
                            if($scope.packageItem.AvailabilityCategories.length == 0) {
                                $scope.showNotAvailable = true;
                            }

                            prepareInformation();

                            if(!reload)
                                doAdditionalProcess(data[0]);
                        }
                        if(reload) {
                            scrollToControl('category');
                        }

                        //angular.forEach($scope.packageItem.AvailabilityCategories, function(item, index){
                        //    item.CancelInfo = null;
                        //});

                    }, function () {
                        $scope.packageItem.AvailabilityCategories = [];
                        $scope.showNotAvailable = true;
                    });

                };

                $scope.checkCancelInfo = function(categoryId) {
                    var index = $scope.getIndexByCategoryId(categoryId);
                    var item = $scope.packageItem.AvailabilityCategories[index];
                    PackageService.getCancellationPolicies($scope.packageItem.ProductId, item.Id,
                        $scope.packageItem.StartDate).then(function(data){
                            $scope.packageItem.AvailabilityCategories[index].CancelInfo = data;
                        });
                };

                function add(product, index) {
                    ShoppingService.addItem(product, index);
                    scrollToControl('header');
                    $rootScope.$broadcast('ShoppingCart:Animate');
                }

                $scope.addToShoppingCart = function (categoryId) {
                    var categoryIndex = $scope.getIndexByCategoryId(categoryId);
                    if (SessionService.user() == null) {
                        $rootScope.$broadcast("OpenLoginModal");
                    } else {
                        if( $scope.packageItem.Warnings.length > 0 || $scope.packageItem.AvailabilityCategories[categoryIndex].Warnings.length > 0 ) {
                            $rootScope.$broadcast('Warnings:Open', $scope.packageItem, categoryIndex);
                        } else if($scope.packageItem.AvailabilityCategories[categoryIndex].AvailabilityLevel == "Requestable") {
                            $rootScope.$broadcast('ConsentRequired:Open', $scope.packageItem, categoryIndex);
                        } else {
                            add($scope.packageItem, categoryIndex);
                        }
                    }
                };

                $scope.$on('ConsentRequired:Confirmed', function(event, product, index){
                    add(product, index);
                });

                $scope.$on('Warnings:Confirmed', function(event, product, index){
                    if(product.AvailabilityCategories[index].AvailabilityLevel == "Requestable") {
                        $rootScope.$broadcast('ConsentRequired:Open', product, index);
                    } else {
                        add(product, index);
                    }
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
