define(['app/services/language-service',
        'app/services/navbar-service',
        'app/services/destination-service',
        'app/services/hotel-service',
        'app/services/package-service',
        'app/services/services-service', 'stickup', 'app/utils'],
    function (modules) {
        'use strict';

        modules.controllers
            .controller('DestinationDetailController', ['_', '$rootScope', '$scope', '$location', '$routeParams', 'SessionService',
                'HotelService', 'LanguageService', '$translate', '$cookieStore', 'DestinationService', 'ServicesService','PackageService','$timeout','$window',
                function (_, $rootScope, $scope, $location, $routeParams, SessionService, HotelService, LanguageService, $translate, $cookieStore, DestinationService, ServicesService, PackageService, $timeout, $window) {

                    console.info('path:' + $location.path());
                    var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                    if (languageId && languageId != SessionService.languageId()) {
                        $rootScope.$broadcast('RequireChangeLanguage', languageId);
                    }

                    $scope.webRoot = SessionService.config().webRoot;
                    $scope.languageId = SessionService.languageId();

                    $scope.$on('LanguageChanged', function (event, data) {
                        if ($scope.languageId != data) {
                            $scope.languageId = data;
                            load(true);
                        }
                    });

                    $scope.detailTitle = "";
                    function setDetailTitle(data) {
                        _.each(data.AdditionalInformation, function(item, index){
                            if(item.Section == 'HDFULLDESC') {
                                $scope.detailTitle = item.Title;
                            }
                        });
                    }

                    $scope.destinationItem = null;
                    $scope.showMap = false;
                    function loadDestination(reload) {
                        $scope.destinationItem = null;
                        var sliderImageData = [];
                        DestinationService.getDestinationDetail($routeParams.destinationId).then(function (data) {
                            $scope.destinationItem = data;
                            setDetailTitle(data);
                            _.each(data.SliderImages, function(item, index){
                            sliderImageData.push({
                                image:item.ImagePath,
                                thumb:item.ImagePath
                            });
                            });

                            if(sliderImageData.length > 0) {
                                if(!reload)
                                    initSliderDetail(sliderImageData);
                            }

                            if(data.Latitude != 0 && data.Longitude != 0) {
                                $scope.showMap = true;
                                initMap(data.Latitude, data.Longitude, data.Name);
                            }

                        }, function (data) {
                        });
                    }

                    $scope.hotels = [];
                    function loadHotels() {
                        $scope.hotels = [];
                        HotelService.getTopHotelsByDestinationId($routeParams.destinationId).then(function (data) {
                            for(var i = 0; i < data.length && i < 3; i++){
                                var item = data[i];
                                item.DetailsURI = $scope.webRoot + 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                $scope.hotels.push(item);
                            }
                        });
                    }

                    $scope.activities = [];
                    function loadActivities() {
                        loadingCount++;
                        $scope.hotels = [];
                        ServicesService.getTopActivitiesByDestinationId($routeParams.destinationId).then(function (data) {
                            loadingCount--;
                            for(var i = 0; i < data.length && i < 3; i++){
                                var item = data[i];
                                item.DetailsURI = $scope.webRoot + 'services.html#/activities/' + item.ProductId + '/' + $scope.languageId;
                                $scope.activities.push(item);
                            }
                        }, function(){
                            loadingCount--;
                        });
                    }

                    $scope.tours = [];
                    function loadTours() {
                        loadingCount ++;
                        $scope.hotels = [];
                        ServicesService.getTopToursByDestinationId($routeParams.destinationId).then(function (data) {
                            loadingCount --;
                            for(var i = 0; i < data.length && i < 3; i++){
                                var item = data[i];
                                item.DetailsURI = $scope.webRoot + 'services.html#/tours/' + item.ProductId + '/' + $scope.languageId;
                                $scope.tours.push(item);
                            }
                        }, function(){
                            loadingCount--;
                        });
                    }

                    $scope.transportation = [];
                    function loadTransportation() {
                        loadingCount ++;
                        $scope.transportation = [];
                        ServicesService.getTopTransportationByDestinationId($routeParams.destinationId).then(function (data) {
                            loadingCount --;
                            for(var i = 0; i < data.length && i < 3; i++){
                                var item = data[i];
                                item.DetailsURI = $scope.webRoot + 'services.html#/transportation/' + item.ProductId + '/' + $scope.languageId;
                                $scope.transportation.push(item);
                            }
                        }, function(){
                            loadingCount--;
                        });
                    }

                    $scope.packages = [];
                    function loadPackages() {
                        loadingCount ++;
                        $scope.packages = [];
                        PackageService.getTopPackagesByDestinationId($routeParams.destinationId).then(function (data) {
                            loadingCount --;
                            for(var i = 0; i < data.length && i < 3; i++){
                                var item = data[i];
                                item.DetailsURI = $scope.webRoot + 'packages.html#/' + item.ProductId + '/' + $scope.languageId;
                                $scope.packages.push(item);
                            }
                        }, function(){
                            loadingCount --;
                        });
                    }

                    var loadingCount = 0;
                    function checkLoading(){
                        if(loadingCount > 0) {
                            $timeout(checkLoading, 1000);
                        } else {
                            var parts = {
                                '0':'top',
                                '1':'Detail'
                            };
                            if($scope.hotels.length > 0) {
                                parts[''+Object.keys(parts).length] = 'hotel';
                            }
                            if($scope.activities.length > 0) {
                                parts[''+Object.keys(parts).length] = 'activities';
                            }
                            if($scope.tours.length > 0) {
                                parts[''+Object.keys(parts).length] = 'tours';
                            }
                            if($scope.transportation.length > 0) {
                                parts[''+Object.keys(parts).length] = 'transportation';
                            }
                            if($scope.packages.length > 0) {
                                parts[''+Object.keys(parts).length] = 'packages';
                            }
                            parts[''+Object.keys(parts).length] = 'map';
                            initStickup(parts);
                        }
                    }

                    $scope.gotoUrl = function(url) {
                        $cookieStore.put('forDestination', {
                            ProductId:$scope.destinationItem.ProductId,
                            Name:$scope.destinationItem.Name
                        });
                        $window.location.href = $scope.webRoot + url + $scope.languageId;
                    };

                    function load(reload) {
                        loadDestination(reload);
                        loadHotels();
                        loadActivities();
                        loadTours();
                        loadTransportation();
                        loadPackages();
                        checkLoading();
                    }

                    load();

                }]);
    });


