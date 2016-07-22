define(['app/services/hotel-service',
    'app/services/language-service',
    'app/services/destination-service',
    'app/services/navbar-service',
    'app/services/search-service',
    'app/utils'
], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelTopController', ['_', '$rootScope', '$scope', '$location', '$routeParams', '$cookieStore', 'SessionService',
            'HotelService', 'LanguageService', 'DestinationService', 'SearchService', '$filter', '$timeout', '$translate',
            function (_, $rootScope, $scope, $location, $routeParams, $cookieStore, SessionService, HotelService, LanguageService, DestinationService, SearchService, $filter, $timeout, $translate) {
                console.info('path:' + $location.path());
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
                        var locationId = SessionService.options('hotel.top.location');
                        var selected = 0;
                        _.each(data, function (item, index) {
                            $scope.destinations.push(item);
                            if(item.ProductId == locationId)
                                selected = index;
                        });
                        if(data.length > 0) {
                            $scope.loadHotels(data[selected]);
                        }
                    });
                }

                $scope.showHotelMainPage = function (destId, destName) {
                    $cookieStore.put('forDestination', {
                        ProductId: (destId ? destId : $scope.currentDestination.ProductId),
                        Name: (destName ? destName : $scope.currentDestination.Name)
                    });
                    $location.url("/" + $scope.languageId, true);
                };

                $scope.showHotelDetailPage = function (hotelId) {
                    $location.url("/" + hotelId + "/" + $scope.languageId);
                };

                $scope.hotels = null;
                $scope.loadHotels = function (destination) {
                    if (destination == $scope.currentDestination)
                        return;

                    $scope.hotels = [];
                    $scope.currentDestination = destination;
                    SessionService.options('hotel.top.location', destination.ProductId);
                    HotelService.getTopHotelsByDestinationId(destination.ProductId).then(function (data) {
                        $scope.hotels = data; //_.first(data, 3);

                        _.each($scope.hotels, function (item) {
                            item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                            item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    var allItems = [];

                    SearchService.getLocations().then(function (data) {
                        //$scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                        HotelService.getHotelsByLanguageId().then(function (hotelList) {
                            allItems = data.concat(hotelList);
                            $scope.searchLocations = allItems; //$filter('orderBy')(allItems, '+Name', false);
                        });
                    });

                }

                var criteria = $cookieStore.get('hotelCriteria');
                $scope.checkInDate = (criteria ? criteria.checkInDate : "");//hotelDestination?"":(criteria?criteria.checkInDate:"");
                $scope.checkOutDate = (criteria ? criteria.checkOutDate : ""); //hotelDestination?"":(criteria?criteria.checkOutDate:"");
                $scope.guests = (criteria && criteria.guests.length > 0 ? criteria.guests : [
                    {
                        Adults: '2',
                        Minors: '0',
                        MinorAges: []
                    }
                ]);
                $scope.roomsInfo = GetHotelGuestsInfo($scope.guests, $scope.languageId);
                $scope.selectedLocation = (criteria ? criteria.locationId : null);
                $scope.selectedLocationName = (criteria ? criteria.locationName : null);
                $scope.selectedSearchLocation = null;

                $scope.showGuests = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-hotel-popover.html";

                $scope.closeGuests = function () {
                    $scope.showGuests = false;
                    $scope.roomsInfo = GetHotelGuestsInfo($scope.guests, $scope.languageId);
                };

                $scope.addRoom = function () {
                    $scope.guests.push({
                        Adults: '2',
                        Minors: '0',
                        MinorAges: []
                    });
                };

                $scope.deleteRoom = function (index) {
                    $scope.guests.splice(index, 1);
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

                function showError(message) {
                    $scope.tooltips = message;
                    $scope.showTooltip = true;
                    $timeout(function () {
                        $scope.tooltips = "";
                        $scope.showTooltip = false;
                    }, 5000);
                }

                $scope.$watch('currentDestination', function (newVal, oldVal) {
                    if (newVal)
                        $scope.$broadcast('angucomplete-alt:changeInput', 'searchLocation', $scope.currentDestination);
                });

                $scope.$watch('checkInDate', function (newVal, oldVal) {
                    if (newVal === oldVal) {
                        return;
                    }

                    if(newVal === '') {
                        $('#checkInDate').datepicker('update','');
                    }

                    $('#checkOutDate').datepicker('setStartDate',
                        addDays($('#checkInDate').datepicker('getDate'), 1));
                    $('#checkOutDate').datepicker('setEndDate',
                        addDays($('#checkInDate').datepicker('getDate'), 30));

                    if(newVal === '') {
                        $('#checkOutDate').datepicker('update','');
                    } else {
                        $('#checkOutDate').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 1));
                        //var days = DayDiff($('#checkInDate').datepicker('getDate'), $('#checkOutDate').datepicker('getDate'));
                        //if ($scope.checkOutDate != '') {
                        //    var days = DayDiff($('#checkInDate').datepicker('getDate'), $('#checkOutDate').datepicker('getDate'));
                        //    if(days >= 30)
                        //        $('#checkOutDate').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 30));
                        //    else if(days <= 0) {
                        //        $('#checkOutDate').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 1));
                        //    }
                        //} else {
                        //    $('#checkOutDate').datepicker('update', addDays($('#checkInDate').datepicker('getDate'), 1));
                        //}
                    }
                });

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function () {
                    if (searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.searchHotels();
                    }
                });

                $scope.searchHotels = function () {

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

                    $cookieStore.put('hotelCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        checkInDate: $scope.checkInDate,
                        checkOutDate: $scope.checkOutDate,
                        guests: $scope.guests
                    });

                    if (SessionService.user() == null) {
                        searchAfterLogin = true;
                        $rootScope.$broadcast("OpenLoginModal");
                        return;
                    }

                    $scope.showHotelMainPage($scope.selectedLocation, $scope.selectedLocationName);
                };

                $scope.$watch('selectedSearchLocation', function (newVal, oldVal) {
                    if (newVal == oldVal)
                        return;

                    if (newVal && $scope.currentDestination != null && newVal.originalObject.ProductId != $scope.currentDestination.ProductId) {
                        if (newVal.originalObject.ProductType == 'HTL')
                            $scope.showHotelDetailPage(newVal.originalObject.ProductId, newVal.originalObject.Name);
                        else
                            $scope.showHotelMainPage(newVal.originalObject.ProductId, newVal.originalObject.Name);
                    }
                });

                function load() {
                    loadSearchLocations();
                    loadDestinations();
                }

                load();

            }]);
});
