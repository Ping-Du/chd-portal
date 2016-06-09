define(['app/services/account-service', 'app/services/shopping-service', 'sweetalert', 'app/utils'], function (modules) {
    'use strict';
    modules.controllers
        .controller('ShoppingItemsController', ['$rootScope', '$scope', 'ShoppingService', '$cookieStore', 'localStorageService','$location',
            function ($rootScope, $scope, ShoppingService, $cookieStore, localStorageService, $location) {

                $scope.shoppingItems = ShoppingService.getItems();
                $scope.totalPrice = 0;
                $scope.availability = 0;

                function load() {

                    $scope.totalPrice = 0;
                    $scope.availability = 0;

                    if ($scope.shoppingItems) {

                        var i = 0;
                        var index;
                        for (i = 0; i < $scope.shoppingItems.hotels.length; i++) {
                            index = $scope.shoppingItems.hotels[i].index;
                            $scope.totalPrice += $scope.shoppingItems.hotels[i].product.AvailabilityCategories[index].Price;
                            $scope.shoppingItems.hotels[i].totalGuests = 0;
                            switch($scope.shoppingItems.hotels[i].product.AvailabilityCategories[index].AvailabilityLevel) {
                                case 'Available':
                                    $scope.availability = $scope.availability | 1;
                                    break;
                                case 'Requestable':
                                    $scope.availability = $scope.availability | 2;
                            }

                            for(var j = 0; j < $scope.shoppingItems.hotels[i].product.AvailabilityCategories[index].Rooms.length; j++) {
                                $scope.shoppingItems.hotels[i].totalGuests += $scope.shoppingItems.hotels[i].product.AvailabilityCategories[index].Rooms[j].Guests.length;
                            }
                        }

                        for (i = 0; i < $scope.shoppingItems.services.length; i++) {
                            index = $scope.shoppingItems.services[i].index;
                            $scope.totalPrice += $scope.shoppingItems.services[i].product.AvailabilityCategories[index].Price;
                            switch($scope.shoppingItems.services[i].product.AvailabilityCategories[index].AvailabilityLevel) {
                                case 'Available':
                                    $scope.availability = $scope.availability | 1;
                                    break;
                                case 'Requestable':
                                    $scope.availability = $scope.availability | 2;
                            }
                        }

                        for (i = 0; i < $scope.shoppingItems.packages.length; i++) {
                            index = $scope.shoppingItems.packages[i].index;
                            $scope.totalPrice += $scope.shoppingItems.packages[i].product.AvailabilityCategories[index].Price;
                            switch($scope.shoppingItems.packages[i].product.AvailabilityCategories[index].AvailabilityLevel) {
                                case 'Available':
                                    $scope.availability = $scope.availability | 1;
                                    break;
                                case 'Requestable':
                                    $scope.availability = $scope.availability | 2;
                            }

                        }

                    }

                }

                $scope.close = function() {
                    $scope.show = false;
                };

                $scope.removeItem = function(type, index) {
                  ShoppingService.removeItem(type, index);
                    //load();
                };

                $scope.checkOut = function() {
                    $rootScope.$broadcast('ShoppingCart:Open');
                };

                $scope.$on('ShoppingItemList:Show', function (event, show) {
                    load();
                    $scope.show = (show?true:$scope.totalPrice > 0);
                });

                load();

                var url = $location.absUrl();
                if(url.indexOf('/hotels.html') > 0 || url.indexOf('/services.html') > 0 || url.indexOf('/packages.html') > 0)
                    $scope.show = ($scope.totalPrice > 0);
                else
                    $scope.show = false;

            }]);

    return modules;
});

