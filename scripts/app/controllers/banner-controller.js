define(['app/services/banner-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("BannerController", ['$rootScope', '$scope', '_', 'BannerService', function ($rootScope, $scope, _, BannerService) {
            $scope.slideInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.slides = [];

            function getBanners(languageId) {
                var promise = BannerService.getBannersByLanguageId(languageId);
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
            }

            $scope.$on('LanguageChanged', function(event, data){
                getBanners(data);
            });

        }]);
});

