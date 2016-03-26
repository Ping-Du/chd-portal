define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'LanguageService', '$translate', '$window', '$cookieStore','$timeout',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, LanguageService, $translate, $window, $cookieStore, $timeout) {

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
                $scope.guests = criteria ? criteria.guests : [];
                $scope.rooms = '' + $scope.guests.length;
                $scope.roomsHasError = false;
                $scope.checkInDate = criteria ? criteria.checkInDate : "";
                $scope.checkOutDate = criteria ? criteria.checkOutDate : "";
                $scope.roomsInfo = ValidateHotelGuestsInfo($scope.guests).message;
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
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    var result = ValidateHotelGuestsInfo($scope.guests, false, false);

                    if (!result.hasError) {
                        $scope.showGuests = false;
                        $scope.roomsInfo = result.message;
                    }
                };
                $scope.updateRooms = function () {
                    if (!IsInteger($scope.rooms)) {
                        $scope.roomsHasError = true;
                        return;
                    } else {
                        $scope.roomsHasError = false;
                    }
                    var rooms = parseInt($scope.rooms);
                    if (rooms < $scope.guests.length) {
                        $scope.guests = _.first($scope.guests, rooms)
                    } else if (rooms > $scope.guests.length) {
                        var more = rooms - $scope.guests.length;
                        for (var i = 0; i < more; i++) {
                            $scope.guests.push({
                                adults: '1',
                                minors: '',
                                adultsError: false,
                                minorsError: false
                            });
                        }
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
                        $scope.showMap = true;
                        initMap(hotel.Latitude, hotel.Longitude, hotel.Name);
                    }
                }

                $scope.hotelItem = null;
                $scope.showMap = false;
                function loadHotel(reload) {
                    HotelService.getHotelDetail($routeParams.hotelId).then(function (data) {
                        $scope.hotelItem = data;
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        if(!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.checkAvailability = function (reload) {
                    var result = ValidateHotelGuestsInfo($scope.guests);
                    if ($scope.checkInDate == "") {
                        showError("Check in date is required!");
                        return;
                    }

                    if ($scope.checkOutDate == "") {
                        showError("Check Out date is required!");
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

                    if (result.rooms > 0 && result.hasError) {
                        showError("Guests is required!");
                        return;
                    }

                    //check availability

                    var param = {
                        Nights: DayDiff(new Date(checkInDate), new Date(checkOutDate)),
                        RatePlanId: null,
                        ProductId: $routeParams.hotelId,
                        DestinationId: null,
                        LanguageId: $scope.languageId,
                        CategoryId: null,
                        StartDate: $scope.checkInDate + 'T00:00:00.000Z',
                        Rooms: GuestsToArray($scope.guests)
                    };

                    HotelService.getAvailability(param).then(function (data) {
                        if (data.length > 0) {
                            $scope.hotelItem = data[0];
                            if(!reload)
                                doAdditionalProcess(data[0]);
                        }
                        if(reload) {
                            scrollToControl('category');
                        }
                    }, function () {
                    });

                };

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

                    if ($scope.rooms != '0' && $scope.rooms != '')
                        $scope.checkAvailability(reload);
                    else
                        loadHotel(reload);
                };

                $scope.load();

                $window.scrollTo(0, 0);


            }]);

    return modules;
});
