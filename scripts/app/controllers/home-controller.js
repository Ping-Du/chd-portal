define(['app/services/banner-service',
    'app/services/destination-service',
    'app/services/hotel-service',
    'app/services/services-service',
    'jssor.slider'], function (modules) {
    'use strict';

    modules.controllers
        .controller("HomeController", ['$rootScope', '$scope', 'SessionService',
            'BannerService', 'DestinationService', 'HotelService', 'ServicesService', '$log', '$location', 'LanguageService',
            function ($rootScope, $scope, SessionService, BannerService, DestinationService, HotelService, ServicesService, $log, $location, LanguageService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.slide = {
                    slideInterval: 5000,
                    noWrapSlides: false
                };
                $scope.banners = [];

                function loadBanners() {
                    BannerService.getBannersByLanguageId().then(function (data) {
                        var array = [];
                        modules.angular.forEach(data, function(element, index){
                            array.push(modules.angular.extend(element,{ProductId:index}));
                        });
                        $scope.banners = array;
                    }, function (/*data*/) {
                    });
                }

                function fillSlideData(images) {
                    var slides = [];
                    modules.angular.forEach(images, function(item, index){
                        slides.push({
                            url:'destinations.html#/'+item.ProductId+'/'+$scope.languageId,
                            caption:item.Name,
                            image:item.MainInformation.LargeImageURI
                        });
                    });
                    return slides;
                }

                $scope.destinations = [];
                function loadDestinations() {
                    DestinationService.getTopDestinations().then(function (data) {
                        $scope.destinations = data;
                        initSlider(fillSlideData(data));
                    });
                }

                $scope.hotels = [];
                function loadHotels() {
                    HotelService.getTopHotels().then(function(data){
                        $scope.hotels = data;
                        _.each($scope.hotels, function(item, index) {
                            item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                            item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                }

                $scope.activities = [];
                function loadActivities() {
                    ServicesService.getTopActivities().then(function(data) {
                        $scope.activities = data;
                    });
                }

                $scope.languageId = SessionService.languageId();
                function load() {
                    loadBanners();
                    loadDestinations();
                    loadHotels();
                    loadActivities();
                }

                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();

            }]);

    return modules;
});


