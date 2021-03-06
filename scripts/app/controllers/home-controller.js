define(['app/services/banner-service',
    'app/services/destination-service',
    'app/services/hotel-service',
    'app/services/services-service',
    'app/services/package-service',
    'jssor.slider'], function (modules) {
    'use strict';

    modules.controllers
        .controller("HomeController", ['$rootScope', '$scope', '$cookieStore', 'SessionService',
            'BannerService', 'DestinationService', 'HotelService', 'ServicesService', '$log', '$location', 'LanguageService','$window','PackageService','$routeParams',
            function ($rootScope, $scope, $cookieStore, SessionService, BannerService, DestinationService, HotelService, ServicesService,
                      $log, $location, LanguageService, $window, PackageService, $routeParams) {

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

                $scope.topDestinations = [];
                $scope.hotelDestinations = [];
                $scope.tourDestinations = [];
                $scope.transportationDestinations = [];
                $scope.activityDestinations = [];
                $scope.packageDestinations = [];
                function loadDestinations() {
                    DestinationService.getTopDestinations().then(function(data){
                        $scope.topDestinations = data;
                        initSlider(fillSlideData(data));
                    });

                    var maxDest = 10;
                    DestinationService.getDestinationsByLanguageId().then(function (data) {
                        angular.forEach(data, function(value, key){
                            if(value.Products.Hotels > 0 && $scope.hotelDestinations.length <  maxDest ) {
                                $scope.hotelDestinations.push(value);
                            }
                            if(value.Products.Tours > 0 && $scope.tourDestinations.length <  maxDest) {
                                $scope.tourDestinations.push(value)
                            }
                            if(value.Products.Transportation > 0 && $scope.transportationDestinations.length <  maxDest) {
                                $scope.transportationDestinations.push(value)
                            }
                            if(value.Products.Activities > 0 && $scope.activityDestinations.length <  maxDest) {
                                $scope.activityDestinations.push(value)
                            }
                            if(value.Products.Packages > 0 && $scope.packageDestinations.length <  maxDest) {
                                $scope.packageDestinations.push(value)
                            }
                        });

                        if($scope.hotelDestinations.length > 0)
                            $scope.loadHotels($scope.hotelDestinations[0]);
                        if($scope.activityDestinations.length > 0)
                            $scope.loadActivities($scope.activityDestinations[0]);
                        if($scope.tourDestinations.length > 0)
                            $scope.loadTours($scope.tourDestinations[0]);
                        if($scope.packageDestinations.length > 0)
                            $scope.loadPackages($scope.packageDestinations[0]);
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

                $scope.tours = [];
                $scope.currentToursDestination = null;
                $scope.loadTours = function(destination) {
                    if(destination == $scope.currentToursDestination)
                        return;

                    $scope.tours = [];
                    $scope.currentToursDestination = destination;
                    ServicesService.getTopToursByDestinationId($scope.currentToursDestination.ProductId).then(function(data) {
                        $scope.tours = _.first(data, 3);
                        _.each($scope.tours, function(item){
                            item.DetailsURI = 'services.html#/tours/'+item.ProductId+'/'+$scope.languageId;
                            //item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };
                $scope.showToursMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentToursDestination.ProductId,
                        Name:$scope.currentToursDestination.Name
                    });
                    $window.location.href = $scope.webRoot + "services.html#/tours/"+$scope.languageId;
                };

                $scope.packages = [];
                $scope.currentPackagesDestination = null;
                $scope.loadPackages = function(destination) {
                    if(destination == $scope.currentPackagesDestination)
                        return;
                    $scope.packages = [];
                    $scope.currentPackagesDestination = destination;
                    PackageService.getTopPackagesByDestinationId($scope.currentPackagesDestination.ProductId).then(function(data){
                        $scope.packages = _.first(data, 3);
                        _.each($scope.packages, function(item, index) {
                            item.DetailsURI = 'packages.html#/' + item.ProductId + '/' + $scope.languageId;
                        });
                    });
                };

                $scope.showPackagesMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentPackagesDestination.ProductId,
                        Name:$scope.currentPackagesDestination.Name
                    });
                    $window.location.href = $scope.webRoot + "packages.html#/"+$scope.languageId;
                };


                function load() {
                    loadBanners();
                    loadDestinations();
                }

                load();

                if($routeParams.login) {
                    $rootScope.$broadcast('OpenLoginModal');
                }

            }]);

    return modules;
});


