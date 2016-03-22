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
                        var locationed = true; //(item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(stared && typed && locationed) {
                            if(item.Featured)
                                $scope.featuredHotels.push(item);
                            //else
                                $scope.showHotels.push(item);
                        }
                    });
                }
                function fillAllHotels(data){
                    $scope.allHotels = data;
                    $scope.stars = [];
                    $scope.types = [];
                    _.each($scope.allHotels, function(item, index){
                        item.DetailsURI = 'hotels.html#/'+item.ProductId+'/'+$scope.languageId;
                        item.starClass = "icon-star-" + (item.StarRating * 10);
                        fillStars(item.StarRating);
                        fillTypes(item.HotelType);
                    });
                }
                function loadAllHotels(locationId) {
                    $scope.selectedStar = null;
                    $scope.selectedType = null;
                    if(locationId) {
                        HotelService.getHotelsByDestinationId(locationId).then(function (data) {
                            fillAllHotels(data);
                            fillHotels();
                        }, function () {
                            $scope.allHotels = [];
                        });
                    } else {
                        HotelService.getHotelsByLanguageId().then(function (data) {
                            fillAllHotels(data);
                            fillHotels();
                        }, function () {
                            $scope.allHotels = [];
                        });
                    }
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
                    $scope.selectedLocation = $scope.selectedSearchLocation?$scope.selectedSearchLocation.originalObject.ProductId:$scope.selectedLocation;
                    $scope.selectedLocationName = $scope.selectedSearchLocation?$scope.selectedSearchLocation.originalObject.Name:$scope.selectedLocationName;
                    $scope.selectedStar = null;
                    $scope.selectedType = null;

                    if($scope.selectedLocation == null) {
                        showError("Please select a location!");
                        return;
                    }

                    var result = ValidateHotelGuestsInfo($scope.guests);
                    if(result.rooms == 0) {
                        loadAllHotels($scope.selectedLocation);
                    } else {

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

                        //check availability
                        $cookieStore.put('hotelCriteria', {
                            locationId: $scope.selectedLocation,
                            locationName:$scope.selectedLocationName,
                            checkInDate:$scope.checkInDate,
                            checkOutDate:$scope.checkOutDate,
                            guests: $scope.guests
                        });

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

                        HotelService.getAvailability(param).then(function(data){
                            fillAllHotels(data);
                            fillHotels();
                        },function(){
                            $scope.allHotels= [];
                        });
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
                                firstName: '',
                                lastName: '',
                                ages: '',
                                minors: '',
                                firstNameError:false,
                                lastNameError:false,
                                agesError:false,
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
