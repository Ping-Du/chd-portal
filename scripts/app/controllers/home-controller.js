define(['app/services/banner-service',
    'app/services/destination-service',
    'app/services/hotel-service',
    'app/services/services-service',
    'jssor.slider'], function (modules) {
    'use strict';

    modules.controllers
        .controller("HomeController", ['$rootScope', '$scope', '$cookieStore', 'SessionService',
            'BannerService', 'DestinationService', 'HotelService', 'ServicesService', '$log', '$location', 'LanguageService','$window',
            function ($rootScope, $scope, $cookieStore, SessionService, BannerService, DestinationService, HotelService, ServicesService, $log, $location, LanguageService, $window) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

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
                        $scope.loadHotels(data[0]);
                        $scope.loadActivities(data[0]);
                    });
                }

                $scope.hotels = [];
                $scope.currentHotelsDestination = null;
                $scope.loadHotels = function(destination) {
                    if(destination == $scope.currentHotelsDestination)
                        return;
                    $scope.hotels = [];
                    $scope.currentHotelsDestination = destination;
                    HotelService.getTopHotelsByDestinationId($scope.currentHotelsDestination.ProductId).then(function(data){
                        $scope.hotels = _.first(data, 3);
                        _.each($scope.hotels, function(item, index) {
                            item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                            item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                $scope.showHotelMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentHotelsDestination.ProductId,
                        Name:$scope.currentHotelsDestination.Name
                    });
                    $window.location.href = $scope.webRoot + "hotels.html#/"+$scope.languageId;
                };

                $scope.activities = [];
                $scope.currentActivitiesDestination = null;
                $scope.loadActivities = function(destination) {
                    if(destination == $scope.currentActivitiesDestination)
                        return;

                    $scope.activities = [];
                    $scope.currentActivitiesDestination = destination;
                    ServicesService.getTopActivitiesByDestinationId($scope.currentActivitiesDestination.ProductId).then(function(data) {
                        $scope.activities = _.first(data, 3);
                        _.each($scope.activities, function(item){
                            item.DetailsURI = 'services.html#/activities/'+item.ProductId+'/'+$scope.languageId;
                            //item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };
                $scope.showActivitiesMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentActivitiesDestination.ProductId,
                        Name:$scope.currentActivitiesDestination.Name
                    });
                    $window.location.href = $scope.webRoot + "services.html#/activities/"+$scope.languageId;
                };


                function load() {
                    loadBanners();
                    loadDestinations();
                }

                load();

            }]);

    return modules;
});


