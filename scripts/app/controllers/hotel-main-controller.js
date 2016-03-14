define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelMainController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'DestinationService', 'LanguageService','$filter',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService,DestinationService, LanguageService, $filter) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.dest = null;
                $scope.startDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                $scope.nights = 1;
                $scope.rooms = 1;
                $scope.adults = 1;
                $scope.children = 0;

                var jssorObject = null;
                var slides = 3;
                function ScaleSlider() {
                    var refSize = jssorObject.$Elmt.parentNode.clientWidth;
                    if (refSize) {
                        refSize = Math.min(refSize, 400 * slides + 30 * (slides - 1));
                        jssorObject.$ScaleWidth(refSize);
                    }
                    else {
                        window.setTimeout(ScaleSlider, 30);
                    }
                }
                $scope.jssorOptions = {
                    $AutoPlay: true,
                    $AutoPlaySteps: 3,
                    $SlideDuration: 160,
                    $SlideWidth: 400,
                    $SlideSpacing: 0,
                    $Cols: 3,
                    $ArrowNavigatorOptions: {
                        $Class: $JssorArrowNavigator$,
                        $Steps: 3
                    },
                    $BulletNavigatorOptions: {
                        $Class: $JssorBulletNavigator$,
                        $SpacingX: 1,
                        $SpacingY: 1
                    },
                    onReady:function(){
                        jssorObject = this.handle.slider;
                        ScaleSlider();
                        $(window).bind("load", ScaleSlider);
                        $(window).bind("resize", ScaleSlider);
                        $(window).bind("orientationchange", ScaleSlider);
                    }
                };
                $scope.featuredDestinations = [];
                function loadFeaturedDestinations() {
                    DestinationService.getFeaturedDestinations().then(function (data) {
                        $scope.destinations = data;
                    });
                    //$scope.dest = "ANA";
                    //$scope.featuredDestinations.push({
                    //    ProductId: "ANA",
                    //    Name: 'ANAHEIM, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img1.jpg'
                    //    }
                    //});
                    //$scope.featuredDestinations.push({
                    //    ProductId: "NYC",
                    //    Name: 'NEW YORK, NY',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img2.jpg'
                    //    }
                    //});
                    //$scope.featuredDestinations.push({
                    //    ProductId: "SFO",
                    //    Name: 'SAN FRANCISCO, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img3.jpg'
                    //    }
                    //});
                    //$scope.featuredDestinations.push({
                    //    ProductId: "LAJ",
                    //    Name: 'LA JOLLA, CA',
                    //    MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/city-img1.jpg'
                    //    }
                    //});
                }

                $scope.destinations = [];
                function loadDestinations() {
                    DestinationService.getDestinationsByLanguageId().then(function(data){
                        $scope.destinations = data;
                        if(data.length > 0)
                            $scope.dest = data[0].ProductId;
                    });
                    //$scope.dest = "ANA";
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
                function loadHotels() {
                    HotelService.getFeaturedHotels().then(function(data){
                        $scope.hotels = data;
                    });
                    //$scope.hotels.push({
                    //    ProductId: 1, Name: 'Hotel 1', StarRating: 4, MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/hotel-img1.jpg'
                    //    },StarClass:('icon-star-4'),Location:{Name:'Los Angeles'}
                    //});
                    //$scope.hotels.push({
                    //    ProductId: 2, Name: 'Hotel 2', StarRating: 3, MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/hotel-img2.jpg'
                    //    },StarClass:('icon-star-3'),Location:{Name:'Las Vegas'}
                    //});
                    //$scope.hotels.push({
                    //    ProductId: 3, Name: 'Hotel 3', StarRating: 2, MainInformation: {
                    //        ThumbnailImageURI: 'images/temp/hotel-img3.jpg'
                    //    },StarClass:('icon-star-2'),Location:{Name:'New York'}
                    //});
                }

                $scope.languageId = SessionService.languageId();
                function load(){
                    loadFeaturedDestinations();
                    loadDestinations();
                    loadHotels();
                }

                $scope.search = function(){
                    //$log.debug('dest:'+$scope.dest + ' startDate:'+$scope.startDate + ' endDate:'+$scope.endDate);
                    //var start = $('#startDate').datepicker('getDate');
                    //var end = $('#endDate').datepicker('getDate');
                    var dest = $scope.dest?$scope.dest:'all';
                    var path = '/destination/'+$scope.dest+'/'+SessionService.languageId();
                    var param = '';
                    if($scope.startDate != '') {
                        param += 'startDate='+$scope.startDate+'&nights='+$scope.nights;
                    }
                    if($scope.rooms != null){
                        if(param != null)
                            param += "&";
                        param += 'rooms='+$scope.rooms + '&adults=' + $scope.adults + '&children='+ $scope.children;
                    }

                    $location.search(param);
                    $location.path(path);

                };


                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();


            }]);
});
