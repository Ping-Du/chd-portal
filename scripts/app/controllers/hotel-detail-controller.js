define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'LanguageService','$translate', '$window',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, LanguageService, $translate,  $window) {

                console.info('path:' + $location.path());
                $scope.path = $location.path();
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.hotelItem = null;
                $scope.showMap = false;
                function loadHotel() {
                    HotelService.getHotelDetail($routeParams.hotelId).then(function(data){
                        $scope.hotelItem = data;
                        var sliderImageData = [];
                        modules.angular.forEach(data.SliderImages, function(item, index){
                            sliderImageData.push({
                                image:item.ImagePath,
                                thumb:item.ImagePath
                            });
                        });
                        if(sliderImageData.length > 0) {
                            initSlider(sliderImageData);
                        }
                        if(data.Latitude != 0 && data.Longitude != 0) {
                            $scope.showMap = true;
                            initMap(data.Latitude, data.Longitude, data.Name);
                        }
                    });
                }

                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        loadService();
                    }
                });

                loadHotel();

                $window.scrollTo(0, 0);


            }]);

    return modules;
});
