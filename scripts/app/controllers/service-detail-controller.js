define(['app/services/services-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/services/image-service',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'ServicesService', 'LanguageService','$translate','ImageService', '$window',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, ServicesService, LanguageService, $translate, ImageService, $window) {

                console.info('path:' + $location.path());
                $scope.path = $location.path();
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }
                function parseService(hash) {
                    var temp = hash.split('/');
                    if (temp.length >= 2 && temp[0] == '')
                        return temp[1];
                    else
                        return null;
                }
                var serviceType = parseService($location.path());
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.webRoot = SessionService.config().webRoot;

                $scope.serviceItem = null;
                $scope.showMap = false;
                function loadService() {
                    ServicesService.getServiceDetail($routeParams.serviceId).then(function(data){
                        $scope.serviceItem = data;
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

                loadService();

                $window.scrollTo(0, 0);


            }]);

    return modules;
});
