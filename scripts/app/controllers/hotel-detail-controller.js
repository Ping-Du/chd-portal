define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/controllers/consent-required-modal-controller',
    'app/controllers/warnings-modal-controller',
    'app/services/shopping-service',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelDetailController', ['_','$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'LanguageService', '$translate', '$window', '$cookieStore', '$timeout', 'ShoppingService','$filter',
            function (_, $rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, LanguageService, $translate, $window, $cookieStore, $timeout, ShoppingService, $filter) {

                console.info('path:' + $location.path());
                //console.info('url:' + $location.url());
                //console.info('absurl:' + $location.absUrl());
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
                        $scope.load(true);
                    }
                });

                $scope.hideSearchBar = ($location.absUrl().indexOf("hotelinfo.html") >= 0);

                $scope.searchLocations = [];

                var criteria = $cookieStore.get('hotelCriteria');
                $scope.guests = criteria ? criteria.guests : [{
                    Adults: '2',
                    Minors: '0',
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

                $scope.$watch('checkOutDate', function (newVal, oldVal) {
                    if (newVal == oldVal) {
                        return;
                    }

                    var str = newVal.replace(/-/g, "/");
                    if(str == '') {
                        $('#checkOutDate').datepicker('update', '');
                        $('#checkOutDate2').datepicker('update', '');
                    } else {
                        var date = new Date(str);
                        if (!date)
                            return;

                        $('#checkOutDate').datepicker('update', date);
                        $('#checkOutDate2').datepicker('update', date);
                    }

                });

                $scope.$watch('checkInDate', function (newVal, oldVal) {
                    if (newVal == oldVal) {
                        return;
                    }

                    if(newVal === '') {
                        $('#checkInDate').datepicker('update','');
                        $('#checkInDate2').datepicker('update','');
                    } else {
                        var str = newVal.replace(/-/g, "/");
                        var date = new Date(str);

                        $('#checkInDate').datepicker('update', date ? date : '');
                        $('#checkInDate2').datepicker('update', date ? date : '');
                    }

                    $('#checkOutDate').datepicker('setStartDate',
                        addDays(date, 1));
                    $('#checkOutDate').datepicker('setEndDate',
                        addDays(date, 30));

                    $('#checkOutDate2').datepicker('setStartDate',
                        addDays(date, 1));
                    $('#checkOutDate2').datepicker('setEndDate',
                        addDays(date, 30));

                    //if ($scope.checkOutDate != '' && $scope.checkInDate >= $scope.checkOutDate) {
                    //    //$scope.checkOutDate = '';
                    //    $('#checkOutDate').datepicker('update', '');
                    //    $('#checkOutDate2').datepicker('update', '');
                    //}

                    if(newVal === '') {
                        $('#checkOutDate').datepicker('update','');
                        $('#checkOutDate2').datepicker('update','');
                    } else {
                        $('#checkOutDate').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 1));
                        $('#checkOutDate2').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 1));
                    }
                });

                $scope.showGuests = false;
                $scope.showGuests1 = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";//"GuestsTemplate.html";


                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.showGuests1 = false;
                    $scope.roomsInfo = GetHotelGuestsInfo($scope.guests, $scope.languageId);
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

                $scope.starClass = '';
                function doAdditionalProcess(hotel) {
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

                $scope.detailTitle = (SessionService.languageId() == 'ENG'?'Details':'详细介绍');
                function setDetailTitle(data) {
                    _.each(data.AdditionalInformation, function(item, index){
                        if(item.Section == 'HDFULLDESC') {
                            $scope.detailTitle = item.Title;
                        }
                    });
                }

                $scope.hotelItem = null;
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
                    for(i = 0; i < $scope.hotelItem.AdditionalInformation.length; i++) {
                        if($scope.hotelItem.AdditionalInformation[i].InformationId == $scope.hotelItem.MainInformation.InformationId) {
                            $scope.hotelItem.AdditionalInformation.splice(i, 1);
                        }
                    }

                    // remove duplicated info
                    if($scope.hotelItem.Warnings) {
                        for (i = 0; i < $scope.hotelItem.Warnings.length; i++) {
                            for (j = 0; j < $scope.hotelItem.AdditionalInformation.length; j++) {
                                if ($scope.hotelItem.Warnings[i].InformationId == $scope.hotelItem.AdditionalInformation[j].InformationId) {
                                    $scope.hotelItem.AdditionalInformation.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }

                    for(i = 0; i < $scope.hotelItem.AdditionalInformation.length; i++) {
                        parts[""+(i+2)] = "" + $scope.hotelItem.AdditionalInformation[i].InformationId;
                    }

                    parts[""+(2+$scope.hotelItem.AdditionalInformation.length)] = "term";
                    parts[""+(2+$scope.hotelItem.AdditionalInformation.length+1)] = "map";

                    $timeout(function() {
                        $('.detail-nav-wrap').stickUp({
                            parts: parts,
                            itemClass: 'menu-item',
                            itemHover: 'active'
                        });
                    }, 1000);
                }

                function loadHotel(reload) {
                    $scope.showNotAvailable = false;
                    HotelService.getHotelDetail($routeParams.hotelId).then(function (data) {
                        $scope.hotelItem = data;
                        setDetailTitle(data);
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        prepareInformation();
                        clearEmptyAddress(data.Address);
                        if (!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.currentCategory = [];
                $scope.totalPayAtHotel = 0;
                $scope.showRoomSupplements = false;
                $scope.showNightSupplements = false;
                $scope.showGuestPrice = false;
                $scope.showGuestSupplements = false;
                $scope.showBeds = false;
                $scope.totalColSpan = 6;
                $scope.currentIndex = -1;

                $scope.closePrice = function() {
                    if($scope.currentIndex >= 0) {
                        $scope.showHidePrice($scope.currentIndex);
                    }
                };

                $scope.showHidePrice = function (index) {
                    var i, j, k;
                    $scope.currentCategory = [];
                    $scope.totalPayAtHotel = 0;
                    $scope.showRoomSupplements = false;
                    $scope.showNightSupplements = false;
                    $scope.showGuestSupplements = false;
                    $scope.showBeds = false;
                    $scope.totalColSpan = 6;
                    $scope.currentIndex = index;
                    for (i = 0; i < $scope.hotelItem.AvailabilityCategories.length; i++) {
                        if (i == index)
                            continue;
                        else
                            $scope.hotelItem.AvailabilityCategories[i].showPrice = false;
                    }
                    $scope.hotelItem.AvailabilityCategories[index].showPrice = !$scope.hotelItem.AvailabilityCategories[index].showPrice;
                    if (!$scope.hotelItem.AvailabilityCategories[index].showPrice) {
                        return;
                    }

                    var category = $scope.hotelItem.AvailabilityCategories[index];
                    //$scope.currentCategory = $scope.hotelItem.AvailabilityCategories[index];

                    var m;
                    var totalPayAtHotel = 0;

                    for (i = 0; i < category.Rooms.length; i++) {
                        var room = category.Rooms[i];
                        var roomSupplements = '';
                        var payAtHotel = 0;
                        $scope.showRoomSupplements = (room.Supplements.length > 0);
                        $scope.showBeds = (room.Beds && room.Beds != 0);
                        for(m = 0; m < room.Supplements.length; m++) {
                            if(roomSupplements != '')
                                roomSupplements += '<br>';
                            roomSupplements += room.Supplements[m].Description + ' - $' + room.Supplements[m].Price;
                            if(room.Supplements[m].AtProperty) {
                                roomSupplements += " - Pay at hotel";
                                payAtHotel +=  room.Supplements[m].Price;
                                $scope.totalPayAtHotel += room.Supplements[m].Price;
                            }
                        }


                        for (j = 0; j < room.Nights.length; j++) {
                            var night = room.Nights[j];
                            var nightSupplements = '';
                            $scope.showNightSupplements = (night.Supplements.length > 0);
                            for(m = 0; m < night.Supplements.length; m++) {
                                if(nightSupplements != '')
                                    nightSupplements += '<br>';
                                nightSupplements += night.Supplements[m].Description + ' - $' + night.Supplements[m].Price;
                                if(night.Supplements[m].AtProperty) {
                                    nightSupplements += " - Pay at hotel";
                                    payAtHotel += night.Supplements[m].Price;
                                    $scope.totalPayAtHotel += night.Supplements[m].Price;
                                }
                            }
                            for (k = 0; k < room.Guests.length; k++) {
                                var guest = room.Guests[k];
                                var guestSupplements = '';
                                $scope.showGuestSupplements = (guest.Supplements.length > 0);
                                for(m = 0; m < guest.Supplements.length; m++) {
                                    if(guestSupplements != '')
                                        guestSupplements += '<br>';
                                    guestSupplements += guest.Supplements[m].Description + ' - $' + guest.Supplements[m].Price;
                                    if(guest.Supplements[m].AtProperty) {
                                        guestSupplements += " - Pay at hotel";
                                        payAtHotel += guest.Supplements[m].Price;
                                        $scope.totalPayAtHotel += guest.Supplements[m].Price;
                                    }
                                }

                                //guest.Nights[j].Price = 0;

                                $scope.currentCategory.push({
                                    beds:room.Beds,
                                    roomSupplements:roomSupplements,
                                    roomId: room.RoomId + 1,
                                    roomPrice: room.Price,
                                    roomSpan: room.Guests.length * room.Nights.length,
                                    roomShow: (j == 0 && k == 0),
                                    nightId: night.NightId + 1,
                                    nightPrice: night.Price,
                                    nightPayAtHotel: 0,
                                    nightSpan: room.Guests.length,
                                    nightShow: (k == 0),
                                    nightSupplements:nightSupplements,
                                    guestId: guest.GuestId,
                                    guestType: guest.Type,
                                    guestAge: guest.Age,
                                    guestPrice: guest.Nights[j].Price,
                                    guestSupplements:guestSupplements,
                                    totalPrice: category.Price
                                });

                                if(guest.Nights[j].Price != 0) {
                                    $scope.showGuestPrice = true;
                                }
                            }

                            for(k = 0; k < room.Guests.length; k++) {
                                $scope.currentCategory[$scope.currentCategory.length - k - 1].nightPayAtHotel = payAtHotel;
                            }
                            payAtHotel = 0;
                        }
                    }

                    if($scope.showRoomSupplements)
                        $scope.totalColSpan ++;
                    if($scope.showNightSupplements)
                        $scope.totalColSpan ++;
                    if($scope.showGuestSupplements)
                        $scope.totalColSpan ++;
                    if($scope.showBeds)
                        $scope.totalColSpan++;
                    if($scope.showGuestPrice)
                        $scope.totalColSpan++;
                };

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
                            _.each(data[0].AvailabilityCategories, function(item, index){
                                item.show = false;
                            });
                            setDetailTitle(data[0]);
                            if ($scope.hotelItem.AvailabilityCategories == null)
                                $scope.hotelItem.AvailabilityCategories = [];
                            if (data[0].AvailabilityCategories.length == 0) {
                                $scope.showNotAvailable = true;
                            }

                            prepareInformation();

                            clearEmptyAddress(data[0].Address);
                            if (!reload)
                                doAdditionalProcess(data[0]);

                            //angular.forEach($scope.hotelItem.AvailabilityCategories, function(item, index){
                            //    item.CancelInfo = null;
                            //});
                        }
                        if (reload) {
                            scrollToControl('category');
                        }
                    }, function () {
                        $scope.hotelItem.AvailabilityCategories = [];
                        $scope.showNotAvailable = true;
                    });

                };

                $scope.checkCancelInfo = function(index) {
                    var item = $scope.hotelItem.AvailabilityCategories[index];
                    HotelService.getCancellationPolicies($scope.hotelItem.ProductId, item.Id,
                        $scope.hotelItem.StartDate, item.Rooms[0].Nights.length, item.ConnectionId).then(function(data){
                        $scope.hotelItem.AvailabilityCategories[index].CancelInfo = data;
                    });
                };

                function add(product, index) {
                    ShoppingService.addItem(product, index);
                    scrollToControl('header');
                    $rootScope.$broadcast('ShoppingCart:Animate');
                }

                $scope.addToShoppingCart = function (categoryIndex) {
                    if (SessionService.user() == null) {
                        $rootScope.$broadcast("OpenLoginModal");
                    } else {

                        if( $scope.hotelItem.Warnings.length > 0 || $scope.hotelItem.AvailabilityCategories[categoryIndex].Warnings.length > 0 ) {
                            $rootScope.$broadcast('Warnings:Open', $scope.hotelItem, categoryIndex);
                        } else if($scope.hotelItem.AvailabilityCategories[categoryIndex].AvailabilityLevel == "Requestable") {
                            $rootScope.$broadcast('ConsentRequired:Open', $scope.hotelItem, categoryIndex);
                        } else {
                            add($scope.hotelItem, categoryIndex);
                        }
                    }
                };

                $scope.$on('ConsentRequired:Confirmed', function (event, product, index) {
                    add(product, index);
                });

                $scope.$on('Warnings:Confirmed', function(event, product, index){
                    if(product.AvailabilityCategories[index].AvailabilityLevel == "Requestable") {
                        $rootScope.$broadcast('ConsentRequired:Open', product, index);
                    } else {
                        add(product, index);
                    }
                });

                $scope.load = function (reload) {
                    if (reload) {
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
