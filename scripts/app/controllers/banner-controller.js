define(['app/services/banner-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("BannerController", ['$rootScope', '$scope', '_', 'BannerService', function ($rootScope, $scope, _, BannerService) {
            $scope.slideInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.slides = [];

            function getBanners() {
                var promise = BannerService.getBannersByLanguageId();
                promise.then(function (data) {
                    var array = [];
                    _.each(data, function(element, index, list){
                        //{
                        //    "ImageURI": "string",
                        //    "Link": "string",
                        //    "Title": "string",
                        //    "SubTitle": "string",
                        //    "LanguageId": "string"
                        //}
                        array.push(_.extend(element,{id:index}));
                    });
                    $scope.slides = array;
                }, function (/*data*/) {
                });
                //$scope.slides.push({ImageURI:'images/temp/56428_los_angeles_los_angeles.jpg', 'Title':'Los Angeles', SubTitle:'What\'s your LA Stroy?'});
                //$scope.slides.push({ImageURI:'images/temp/banner1.jpg', 'Title':'Los Angeles', SubTitle:'What\'s your LA Stroy?'});
            }

            $scope.$on('LanguageChanged', function(event, data){
                getBanners();
            });

            // load
            //getBanners();

        }]);
});

