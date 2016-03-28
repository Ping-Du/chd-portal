define(['app/services/hotel-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/services/search-service',
    'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'HotelService', 'LanguageService', '$translate', '$cookieStore', '$filter','SearchService','$timeout',
            function (_, $rootScope, $scope, $location, SessionService, HotelService, LanguageService, $translate, $cookieStore, $filter, SearchService, $timeout) {

                console.info('path:' + $location.path());
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

                $scope.isCollapsed = true;
                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    SearchService.getLocations().then(function(data){
                        $scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                    });
                }

                $scope.selectedStar = null;
                $scope.stars = [];
                function fillStars(value) {
                    if(value == 0)
                        return;
                    if(!_.find($scope.stars, function(item){
                            return item.Id == value;
                        })){
                        $scope.stars.push({
                            Id:value,
                            Name:value
                        });
                    }
                }
                $scope.filterByStar = function(value) {
                    $scope.selectedStar = value;
                    fillHotels();
                };

                $scope.selectedType = null;
                $scope.types = [];
                function fillTypes(value) {
                    if(!_.find($scope.types, function(item){
                            return item.Id == value.Id;
                        })){
                        $scope.types.push(value);
                    }
                }
                $scope.filterByType = function(value){
                    $scope.selectedType = value;
                    fillHotels();
                };

                $scope.featuredHotels = [];
                $scope.showHotels = [];
                $scope.allHotels = [];
                function fillHotels(){
                    $scope.featuredHotels = [];
                    $scope.showHotels = [];
                    _.each($scope.allHotels, function(item, key){
                        var stared = (item.StarRating == $scope.selectedStar || $scope.selectedStar == null) ;
                        var typed = (item.HotelType.Id == $scope.selectedType || $scope.selectedType == null) ;
                        var priced = ($scope.selectedPrice == null);
                        if(!priced) {
                            if(_.find(item.AvailabilityCategories, function(category){
                                return (Math.floor(category.Price/100) == $scope.selectedPrice);
                            })){
                                priced = true;
                            }
                        }
                        var locationed = true; //(item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(stared && typed && locationed && priced) {
                            if(item.Featured)
                                $scope.featuredHotels.push(item);
                            //else
                                $scope.showHotels.push(item);
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
                    fillHotels();
                };

                function fillAllHotels(data){
                    $scope.allHotels = data;
                    $scope.stars = [];
                    $scope.types = [];
                    $scope.prices = [];
                    _.each($scope.allHotels, function(item, index){
                        item.DetailsURI = 'hotels.html#/'+item.ProductId+'/'+$scope.languageId;
                        item.starClass = "icon-star-" + (item.StarRating * 10);
                        fillStars(item.StarRating);
                        fillTypes(item.HotelType);
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
                function loadAllHotels(locationId) {
                    $scope.selectedStar = null;
                    $scope.selectedType = null;
                    //$loading.start('main');
                    if(locationId) {
                        HotelService.getHotelsByDestinationId(locationId).then(function (data) {
                            fillAllHotels(data);
                            fillHotels();
                            //$loading.finish('main');
                        }, function () {
                            $scope.allHotels = [];
                            //$loading.finish('main');
                        });
                    } else {
                        HotelService.getHotelsByLanguageId().then(function (data) {
                            fillAllHotels(data);
                            fillHotels();
                            //$loading.finish('main');
                        }, function () {
                            $scope.allHotels = [];
                            //$loading.finish('main');
                        });
                    }
                }

                function getAvailability(param) {
                    $scope.allHotels = [];
                    $scope.showHotels = [];
                    //$loading.start('main');
                    HotelService.getAvailability(param).then(function(data){
                        fillAllHotels(data);
                        fillHotels();
                        //$loading.finish('main');
                    },function(){
                        //$loading.finish('main');
                    });
                }

                var criteria = $cookieStore.get('hotelCriteria');
                $scope.guests = criteria?criteria.guests:[];
                $scope.rooms = ''+$scope.guests.length;
                $scope.roomsHasError = false;
                $scope.checkInDate = criteria?criteria.checkInDate:"";
                $scope.checkOutDate = criteria?criteria.checkOutDate:"";
                $scope.roomsInfo = ValidateHotelGuestsInfo($scope.guests).message;
                $scope.selectedLocation = criteria?criteria.locationId:null;
                $scope.selectedLocationName = criteria?criteria.locationName:'';
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

                $scope.searchHotels = function() {

                    if($scope.selectedSearchLocation === undefined) { // user delete location
                        $scope.selectedLocation = null;
                        $scope.selectedLocationName = '';
                    } else {
                        $scope.selectedLocation = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.ProductId : $scope.selectedLocation;
                        $scope.selectedLocationName = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.Name : $scope.selectedLocationName;
                    }
                    $scope.selectedStar = null;
                    $scope.selectedType = null;

                    var result = ValidateHotelGuestsInfo($scope.guests);

                    //check availability
                    $cookieStore.put('hotelCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName:$scope.selectedLocationName,
                        checkInDate:$scope.checkInDate,
                        checkOutDate:$scope.checkOutDate,
                        guests: $scope.guests
                    });

                    if(result.rooms == 0) {
                        loadAllHotels($scope.selectedLocation);
                    } else {

                        if($scope.selectedLocation == null) {
                            showError("Please select a location!");
                            return;
                        }

                        if($scope.checkInDate == "") {
                            showError("Check in date is required!");
                            return;
                        }

                        if($scope.checkOutDate == "") {
                            showError("Check Out date is required!");
                            return;
                        }

                        var checkInDate = Date.parse($scope.checkInDate.replace(/-/g, "/"));
                        var checkOutDate = Date.parse($scope.checkOutDate.replace(/-/g, "/"));
                        var now = new Date();
                        if(checkInDate < now.getTime()){
                            showError("Check in date must be later than now!");
                            return;
                        }
                        if(checkOutDate < checkInDate) {
                            showError("Check out date must be later than check in date!");
                            return;
                        }

                        if(result.rooms > 0 &&  result.hasError) {
                            showError("Guests is required!");
                            return;
                        }

                        var param = {
                            Nights: DayDiff(new Date(checkInDate), new Date(checkOutDate)),
                            RatePlanId:null,
                            ProductId:null,
                            DestinationId:$scope.selectedLocation,
                            LanguageId:$scope.languageId,
                            CategoryId:null,
                            StartDate:$scope.checkInDate+'T00:00:00.000Z',
                            Rooms:GuestsToArray($scope.guests)
                        };

                        getAvailability(param);
                    }
                };

                $scope.closeGuests = function(){
                    var result = ValidateHotelGuestsInfo($scope.guests, false, false);

                    if(!result.hasError) {
                        $scope.showGuests = false;
                        $scope.roomsInfo = result.message;
                    }
                };

                $scope.updateRooms = function() {
                    if(!IsInteger($scope.rooms)) {
                        $scope.roomsHasError = true;
                        return;
                    } else {
                        $scope.roomsHasError = false;
                    }

                    var rooms = parseInt($scope.rooms);
                    if(rooms < $scope.guests.length) {
                        $scope.guests = _.first($scope.guests, rooms)
                    } else if(rooms > $scope.guests.length){
                        var more = rooms - $scope.guests.length;
                        for(var i = 0; i < more; i++) {
                            $scope.guests.push({
                                adults:'1',
                                minors: '',
                                adultsError:false,
                                minorsError:false
                            });
                        }
                    }
                };

                function load(){
                    loadSearchLocations();
                    if($scope.rooms != '0' && $scope.rooms != '')
                        $scope.searchHotels();
                    else
                        loadAllHotels($scope.selectedLocation);
                }

                load();

            }]);
});
