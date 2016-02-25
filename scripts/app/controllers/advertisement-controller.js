define(['app/modules'], function (modules) {
    'use strict';

    modules.controllers
        .controller('AdvertisementController', ['$scope', function ($scope) {
            $scope.slideInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.slides = [];

            $scope.slides.push({
                image: 'images/temp/banner1.jpg',
                caption: 'Advertisement Banner Caption 1',
                description: 'It is perfect if it can be got from Server!',
                id: 0
            });

            $scope.slides.push({
                image: 'images/temp/56428_los_angeles_los_angeles.jpg',
                caption: 'Advertisement Banner Caption 2',
                description: 'Description, can be null!',
                id: 1
            });

        }]);

    return modules;
});
