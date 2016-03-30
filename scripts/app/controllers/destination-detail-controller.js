define(['app/services/language-service',
        'app/services/navbar-service',
        'app/services/destination-service', 'app/services/hotel-service',
        'app/services/services-service', 'stickup', 'app/utils'],
    function (modules) {
        'use strict';

        modules.controllers
            .controller('DestinationDetailController', ['_', '$rootScope', '$scope', '$location', '$routeParams', 'SessionService',
                'HotelService', 'LanguageService', '$translate', '$cookieStore', 'DestinationService', 'ServicesService',
                function (_, $rootScope, $scope, $location, $routeParams, SessionService, HotelService, LanguageService, $translate, $cookieStore, DestinationService, ServicesService) {

                    console.info('path:' + $location.path());
                    var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                    if (languageId && languageId != SessionService.languageId()) {
                        $rootScope.$broadcast('RequireChangeLanguage', languageId);
                    }

                    $scope.webRoot = SessionService.config().webRoot;
                    $scope.languageId = SessionService.languageId();

                    $scope.destinationItem = null;
                    $scope.showMap = false;
                    function loadDestination() {
                        $scope.destinationItem = null;
                        var sliderImageData = [];
                        DestinationService.getDestinationDetail($routeParams.destinationId).then(function (data) {
                            $scope.destinationItem = data;
                            _.each(data.SliderImages, function(item, index){
                            sliderImageData.push({
                                image:item.ImagePath,
                                thumb:item.ImagePath
                            });
                            });

                            if(sliderImageData.length > 0) {
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
                        HotelService.getFeaturedHotelsByDestinationId($routeParams.destinationId).then(function (data) {
                            _.each(data, function (item, index) {
                                item.DetailsURI = $scope.webRoot + 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                $scope.hotels.push(item);
                            });
                        });
                    }

                    $scope.services = [];
                    function loadServices() {
                        $scope.hotels = [];
                        ServicesService.getFeaturedServicesByDestination($routeParams.destinationId).then(function (data) {
                            _.each(data, function (item, index) {
                                if (serviceType[data.ServiceType.Id]) {
                                    item.DetailsURI = $scope.webRoot + 'services.html#/' + getServiceType(data.ServiceType.Id) + '/' + item.ProductId + '/' + $scope.languageId;
                                    $scope.hotels.push(item);
                                }
                            });
                        });
                    }

                    $scope.services = [];

                    function load() {
                        loadDestination();
                        loadHotels();
                        loadServices();
                    }


                    $scope.$on('LanguageChanged', function (event, data) {
                        if ($scope.languageId != data) {
                            $scope.languageId = data;
                            load();
                        }
                    });

                    load();

                }]);
    });


