define(['app/services/hotel-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/services/search-service'], function (modules) {
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
                $scope.selectedLocation = null;
                $scope.selectedSearchLocation = null;
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
                        var locationed = (item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(stared && typed && locationed) {
                            if(item.Featured)
                                $scope.featuredHotels.push(item);
                            //else
                                $scope.showHotels.push(item);
                        }
                    });
                }
                function loadAllHotels() {
                    $scope.selectedStar = null;
                    $scope.selectedType = null;
                    HotelService.getHotelsByLanguageId().then(function(data){
                        $scope.allHotels = data;
                        _.each($scope.allHotels, function(item, index){
                            item.DetailsURI = 'hotels.html#/'+item.ProductId+'/'+$scope.languageId;
                            item.starClass = "icon-star-" + (item.StarRating * 10);
                            fillStars(item.StarRating);
                            fillTypes(item.HotelType);
                        });
                        fillHotels();
                    }, function(){
                        $scope.allHotels = [];
                    });
                }

                $scope.checkInDate = "";
                $scope.checkOutDate = "";
                $scope.roomsInfo = "";
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
                $scope.guestsTemplateUrl = "templates/partials/guests-popover.html";//"GuestsTemplate.html";

                $scope.searchHotels = function() {
                    $scope.selectedLocation = $scope.selectedSearchLocation?$scope.selectedSearchLocation.originalObject.ProductId:null;
                    $scope.selectedStar = null;
                    $scope.selectedType = null;

                    if($scope.selectedLocation == null) {
                        showError("Please select a location!");
                        return;
                    }

                    if($scope.checkInDate == "" && $scope.checkOutDate == "" && $scope.rooms == "") {
                        fillHotels();
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
                        if(checkOutDate < checkInDate) {
                            showError("Check out date must be later than check in date!");
                            return;
                        }

                        if($scope.roomsInfo == "") {
                            showError("Guests is required!");
                            return;
                        }

                    }
                };

                $scope.rooms = 0;
                $scope.guests = [];

                $scope.closeGuests = function(){
                  $scope.showGuests = false;
                };

                $scope.updateRooms = function() {
                    //$scope.rooms = qty;
                    if($scope.rooms < $scope.guests.length) {
                        $scope.guests = _.first($scope.guests, $scope.rooms)
                    } else if($scope.rooms > $scope.guests.length){
                        var more = $scope.rooms - $scope.guests.length;
                        for(var i = 0; i < more; i++) {
                            $scope.guests.push({
                                firstName: '',
                                lastName: '',
                                age: null,
                                minors: null
                            });
                        }
                    }
                };

                function load(){
                    loadSearchLocations();
                    //loadAllHotels();
                }

                load();

            }]);
});
