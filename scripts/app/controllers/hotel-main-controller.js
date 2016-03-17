define(['app/services/hotel-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'HotelService', 'LanguageService', '$translate', '$cookieStore',
            function (_, $rootScope, $scope, $location, SessionService, HotelService, LanguageService, $translate, $cookieStore) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                var filter = $cookieStore.get('hotelFilter');
                function saveFilters() {
                    $cookieStore.put('hotelFilter', {
                        location: $scope.selectedLocation,
                        type:$scope.selectedType,
                        star:$scope.selectedStar
                    });
                }

                $scope.selectedLocation = (filter?filter.location:null);
                $scope.locations = [];
                function fillLocations(value) {
                    if(!_.find($scope.locations, function(item){
                            return item.Id == value.Id;
                        })) {
                        $scope.locations.push(value);
                    }
                }
                $scope.filterByLocation = function(id) {
                    $scope.selectedLocation = id;
                    saveFilters();
                    fillHotels();
                };

                $scope.selectedStar = (filter?filter.star:null);
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
                    saveFilters();
                    fillHotels();
                };

                $scope.selectedType = (filter?filter.type:null);
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
                    saveFilters();
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
                    HotelService.getHotelsByLanguageId().then(function(data){
                        $scope.allHotels = data;
                        _.each($scope.allHotels, function(item, index){
                            item.DetailsURI = 'hotels.html#/'+item.ProductId+'/'+$scope.languageId;
                            fillLocations(item.Location);
                            fillStars(item.StarRating);
                            fillTypes(item.HotelType);
                        });
                        fillHotels();
                    }, function(){
                        $scope.allHotels = [];
                    });
                }

                function load(){
                    loadAllHotels();
                }

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();

            }]);
});
