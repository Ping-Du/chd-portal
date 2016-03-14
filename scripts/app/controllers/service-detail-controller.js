define(['app/services/services-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/services/image-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'ServicesService', 'LanguageService','$translate','ImageService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, ServicesService, LanguageService, $translate, ImageService) {

                console.info('path:' + $location.path());
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

                /* jssor slider  - start */
                var jssorObject1 = null;
                function ScaleSlider1() {
                    var refSize = jssorObject1.$Elmt.parentNode.clientWidth;
                    if (refSize) {
                        refSize = Math.min(refSize, 770);
                        jssorObject1.$ScaleWidth(refSize);
                    }
                    else {
                        window.setTimeout(ScaleSlider1, 30);
                    }
                }
                $scope.jssorOptions1 = {
                    $AutoPlay: true,
                    $ArrowNavigatorOptions: {
                        $Class: $JssorArrowNavigator$
                    },
                    $ThumbnailNavigatorOptions: {
                        $Class: $JssorThumbnailNavigator$,
                        $Cols: 9,
                        $SpacingX: 3,
                        $SpacingY: 3,
                        $Align: 260
                    },
                    onReady: function () {
                        jssorObject1 = this.handle.slider;
                        ScaleSlider1();
                        $(window).bind("load", ScaleSlider1);
                        $(window).bind("resize", ScaleSlider1);
                        $(window).bind("orientationchange", ScaleSlider1);
                    }
                };
                /* jssor slider - end */

                $scope.serviceItem = null;
                $scope.showMap = false;
                function loadService() {
                    ServicesService.getServiceDetail($routeParams.serviceId).then(function(data){
                        $scope.serviceItem = data;
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


            }]);
});
