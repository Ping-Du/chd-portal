define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/controllers/consent-required-modal-controller',
    'app/services/shopping-service',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'LanguageService', '$translate', '$window', '$cookieStore','$timeout','ShoppingService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, LanguageService, $translate, $window, $cookieStore, $timeout, ShoppingService) {

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

                var criteria = $cookieStore.get('hotelCriteria');
                $scope.guests = criteria?criteria.guests:[{
                    Adults: '2',
                    Minors:'0',
                    MinorAges: []
                }];
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests, $scope.languageId);
                $scope.checkInDate = criteria ? criteria.checkInDate : "";
                $scope.checkOutDate = criteria ? criteria.checkOutDate : "";
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

                $scope.$watch('checkOutDate', function(newVal, oldVal){
                    if(newVal == oldVal) {
                        return;
                    }

                    var str = newVal.replace(/-/g,"/");
                    var date = new Date(str);
                    if(!date)
                        return;

                    $('#checkOutDate').datepicker('update', date);
                    $('#checkOutDate2').datepicker('update', date);

                });

                $scope.$watch('checkInDate', function(newVal, oldVal){
                    if(newVal == oldVal && newVal == '') {
                        return;
                    }

                    var str = newVal.replace(/-/g,"/");
                    var date = new Date(str);
                    if(!date)
                        return;

                    $('#checkInDate').datepicker('update', date);
                    $('#checkInDate2').datepicker('update', date);

                    $('#checkOutDate').datepicker('setStartDate',
                        addDays(date, 1));
                    $('#checkOutDate').datepicker('setEndDate',
                        addDays(date, 30));

                    $('#checkOutDate2').datepicker('setStartDate',
                        addDays(date, 1));
                    $('#checkOutDate2').datepicker('setEndDate',
                        addDays(date, 30));

                    if($scope.checkOutDate != '' && $scope.checkInDate >= $scope.checkOutDate) {
                        //$scope.checkOutDate = '';
                        $('#checkOutDate').datepicker('update', '');
                        $('#checkOutDate2').datepicker('update', '');
                    }
                });

                $scope.showGuests = false;
                $scope.showGuests1 = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.showGuests1 = false;
                    $scope.roomsInfo = GetHotelGuestsInfo($scope.guests,$scope.languageId);
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
                function doAdditionalProcess(hotel){
                    $scope.starClass = 'icon-star-' + (hotel.StarRating * 10);
                    var sliderImageData = [];
                    modules.angular.forEach(hotel.SliderImages, function (item, index) {
                        sliderImageData.push({
                            image: item.ImagePath,
                            thumb: item.ImagePath
                        });
                    });
                    if (sliderImageData.length > 0) {
                        initSlider(sliderImageData);
                    }
                    if (hotel.Latitude != 0 && hotel.Longitude != 0) {
                        $scope.showMap = false;
                        //$scope.showMap = true;
                        //initMap(hotel.Latitude, hotel.Longitude, hotel.Name);
                    }
                }

                $scope.hotelItem = null;
                $scope.showMap = false;
                function loadHotel(reload) {
                    $scope.showNotAvailable = false;
                    HotelService.getHotelDetail($routeParams.hotelId).then(function (data) {
                        $scope.hotelItem = data;
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        clearEmptyAddress(data.Address);
                        if(!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.showNotAvailable = false;
                $scope.checkAvailability = function (reload) {

                    if (SessionService.user() == null) {
                        $rootScope.$broadcast("OpenLoginModal");
                        return null;
                    }

                    if ($scope.checkInDate == "") {
                        showError('CHECK_IN_REQUIRED');
                        return;
                    }

                    if ($scope.checkOutDate == "") {
                        showError('CHECK_OUT_REQUIRED');
                        return;
                    }

                    var checkInDate = Date.parse($scope.checkInDate.replace(/-/g, "/"));
                    var checkOutDate = Date.parse($scope.checkOutDate.replace(/-/g, "/"));
                    var now = new Date();
                    if (checkInDate < now.getTime()) {
                        showError("Check in date must be later than now!");
                        return;
                    }
                    if (checkOutDate < checkInDate) {
                        showError("Check out date must be later than check in date!");
                        return;
                    }

                    if ($scope.guests.length < 1) {
                        showError('GUESTS_REQUIRED');
                        return;
                    }

                    //check availability

                    $scope.showNotAvailable = false;

                    var param = {
                        Nights: DayDiff(new Date(checkInDate), new Date(checkOutDate)),
                        RatePlanId: null,
                        ProductId: $routeParams.hotelId,
                        DestinationId: null,
                        LanguageId: $scope.languageId,
                        CategoryId: null,
                        StartDate: $scope.checkInDate + 'T00:00:00.000Z',
                        Rooms: GuestsToHotelArray($scope.guests)
                    };

                    $cookieStore.put('hotelCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        checkInDate: $scope.checkInDate,
                        checkOutDate: $scope.checkOutDate,
                        guests: $scope.guests
                    });

                    HotelService.getAvailability(param).then(function (data) {
                        if (data.length > 0) {
                            $scope.hotelItem = data[0];
                            if($scope.hotelItem.AvailabilityCategories == null)
                                $scope.hotelItem.AvailabilityCategories = [];
                            if(data[0].AvailabilityCategories.length == 0) {
                                $scope.showNotAvailable = true;
                            }

                            clearEmptyAddress(data[0].Address);
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
                        if($scope.hotelItem.AvailabilityCategories[categoryIndex].AvailabilityLevel == "Requestable" || (
                            $scope.hotelItem.Warnings.length > 0 && $scope.hotelItem.Warnings[0].ConsentRequired
                            ))
                            $rootScope.$broadcast('ConsentRequired:Open', $scope.hotelItem, categoryIndex);
                        else {
                            ShoppingService.addItem($scope.hotelItem, categoryIndex);
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

                $scope.load = function(reload) {
                    if(reload) {
                        $cookieStore.put('hotelCriteria', {
                            locationId: $scope.selectedLocation,
                            locationName: $scope.selectedLocationName,
                            checkInDate: $scope.checkInDate,
                            checkOutDate: $scope.checkOutDate,
                            guests: $scope.guests
                        });
                    }

                    if ($scope.guests.length > 0 && $scope.checkInDate != "" && $scope.checkOutDate != "" && $scope.selectedLocation != null && !$routeParams.noAvailability)
                        $scope.checkAvailability(reload);
                    else
                        loadHotel(reload);
                };

                $scope.load();

                $window.scrollTo(0, 0);


            }]);

    return modules;
});
