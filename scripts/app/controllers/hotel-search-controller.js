define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelSearchController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'DestinationService','LanguageService', '$filter',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, DestinationService, LanguageService, $filter) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.dest = ($routeParams.destination == 'all')?null:$routeParams.destination;
                $scope.startDate = $routeParams.startDate;
                $scope.nights = $routeParams.nights;
                $scope.rooms = $routeParams.rooms;
                $scope.adults = $routeParams.adults;
                $scope.children = $routeParams.children;

                $scope.filterStars = ['5', '4', '3', '2'];
                $scope.star = null;

                $scope.filterPrices = ['$99 or less', '$100-$199', '$200-$299', '$300-$399', '$400-$499', '$500 or more'];
                $scope.price = null;

                $scope.sortBy = null;

                $scope.destinations = [];
                function loadDestinations() {
                    DestinationService.getDestinationsByLanguageId().then(function(data){
                        $scope.destinations = data;
                        if($scope.dest == null && data.length > 0)
                            $scope.dest = data[0].ProductId
                    });
                    //$scope.destinations.push({
                    //    ProductId: "ANA",
                    //    Name: 'ANAHEIM, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img1.jpg'
                    //    }
                    //});
                    //$scope.destinations.push({
                    //    ProductId: "NYC",
                    //    Name: 'NEW YORK, NY',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img2.jpg'
                    //    }
                    //});
                    //$scope.destinations.push({
                    //    ProductId: "SFO",
                    //    Name: 'SAN FRANCISCO, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img3.jpg'
                    //    }
                    //});
                    //$scope.destinations.push({
                    //    ProductId: "LAJ",
                    //    Name: 'LA JOLLA, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img1.jpg'
                    //    }
                    //});
                }

                $scope.hotels = [];
                $scope.allHotels = [];

                function search(){
                    //HotelService.getHotelsByDestinationId($scope.dest).then(function(data){
                    //    $scope.allHotels = data;
                    //});
                    //var rooms = [];
                    //for(var i = 0; i < $scope.rooms; i++) {
                    //    rooms.push({
                    //        "Guests":{
                    //            "A"
                    //        }
                    //    });
                    //}
                    HotelService.getAvailability({
                        "Nights": $scope.nights,
                        "RatePlanId": "",
                        "Rooms": [
                            {
                                "Guests": {
                                    "Adults": 0,
                                    "MinorAges": [
                                        0
                                    ]
                                }
                            }
                        ],
                        "ProductId": "",
                        "DestinationId": $scope.dest,
                        "LanguageId": languageId,
                        "CategoryId": "",
                        "StartDate": $scope.startDate+"T00:00:00.000Z"
                    });
                    $scope.fillResult();
                }

                $scope.fillResult = function(){
                    $scope.hotels = [];

                };

                $scope.filterByStar = function(star){
                    $scope.star = star;
                    $scope.fillResult();
                };

                $scope.filterByPrice = function(price) {
                    $scope.price = price;
                    $scope.fillResult();
                };

                $scope.sort = function(value) {
                    $scope.sortBy = value;
                    $scope.fillResult();
                };

                $scope.languageId = SessionService.languageId();
                function load(){
                    loadDestinations();
                    search();
                }

                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();

            }]);
});
