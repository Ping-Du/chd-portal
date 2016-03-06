define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/services-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService', 'HotelService', 'ServicesService','DestinationService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, ServicesService, DestinationService) {

                $scope.webRoot = SessionService.config().webRoot;
                $scope.slide = {
                    slideInterval: 5000,
                    noWrapSlides: false
                };

                $scope.destinations = [];
                function loadDestinations() {
                    //DestinationService.getFeaturedDestinations().then(function (data) {
                    //    $scope.destinations = data;
                    //    require(['app/slider/hotel-destination-slider']);
                    //});
                    $scope.destinations.push({
                        Id: "1",
                        Name: 'City 1',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img1.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "2",
                        Name: 'City 2',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img2.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "3",
                        Name: 'City 3',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img3.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "4",
                        Name: 'City 4',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img1.jpg'
                        }
                    });
                    require(['app/slider/hotel-destination-slider']);
                }

                $scope.hotels = [];
                function loadHotels() {
                    //HotelService.getFeaturedHotels().then(function(data){
                    //    $scope.hotels = data;
                    //});
                    $scope.hotels.push({
                        Id: 1, Name: 'Hotel 1', StarRating: 4, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img1.jpg'
                        },StarClass:('icon-star-4'),Location:{Name:'Los Angeles'}
                    });
                    $scope.hotels.push({
                        Id: 2, Name: 'Hotel 2', StarRating: 3, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img2.jpg'
                        },StarClass:('icon-star-3'),Location:{Name:'Las Vegas'}
                    });
                    $scope.hotels.push({
                        Id: 3, Name: 'Hotel 3', StarRating: 2, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img3.jpg'
                        },StarClass:('icon-star-2'),Location:{Name:'New York'}
                    });
                }

                $scope.languageId = SessionService.languageId();
                function load(){
                    loadDestinations();
                    loadHotels();
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
