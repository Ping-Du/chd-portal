define(['app/services/trip-service', 'underscore'], function (modules, _) {
    'use strict';
    modules.services
        .service('ShoppingService', ['$cookieStore', 'localStorageService', 'TripService', '$rootScope',
            function ($cookieStore, localStorageService, TripService, $rootScope) {

            var hasShoppingItems = $cookieStore.get('hasShoppingItems');
            var shoppingItems = null;
            if (hasShoppingItems) {
                shoppingItems = localStorageService.get('shoppingItems');
            } else {
                //localStorageService.clearAll();
                localStorageService.remove('shoppingItems');
            }
            if (!shoppingItems)
                shoppingItems = {
                    hotels: [],
                    services: [],
                    packages:[]
                };

            return {
                getItems: function () {
                    return shoppingItems;
                },
                addItem: function (item, categoryIndex) {
                    var product = _.clone(item);
                    if (product.ProductType == 'HTL') {
                        shoppingItems.hotels.push({
                            product: product,
                            index: categoryIndex
                        });
                    } else if (product.ProductType == 'OPT') {
                        shoppingItems.services.push({
                            product: product,
                            index: categoryIndex
                        });
                    } else if (product.ProductType == 'PKG') {
                        shoppingItems.packages.push({
                            product: product,
                            index: categoryIndex
                        });
                    } else {
                        return;
                    }
                    //localStorageService.clearAll();
                    localStorageService.remove('shoppingItems');
                    localStorageService.set('shoppingItems', shoppingItems);
                    $cookieStore.put('hasShoppingItems', true);
                    $rootScope.$broadcast('ShoppingItemList:Show');
                },
                removeItem: function (type, index) {
                    if (type == 'HTL') {
                        shoppingItems.hotels.splice(index, 1);
                    } else if(type == 'OPT') {
                        shoppingItems.services.splice(index, 1);
                    } else if(type == 'PKG') {
                        shoppingItems.packages.splice(index, 1);
                    } else {
                        return;
                    }
                    //localStorageService.clearAll();
                    localStorageService.remove('shoppingItems');
                    localStorageService.set('shoppingItems', shoppingItems);
                    $cookieStore.put('hasShoppingItems', (shoppingItems.hotels.length + shoppingItems.services.length + shoppingItems.packages.length) > 0);
                    $rootScope.$broadcast('ShoppingItemList:Show');
                },
                removeAll: function () {
                    //localStorageService.clearAll();
                    localStorageService.remove('shoppingItems');
                    $cookieStore.put('hasShoppingItems', false);
                    shoppingItems.hotels = [];
                    shoppingItems.services = [];
                    shoppingItems.packages = [];
                    $rootScope.$broadcast('ShoppingItemList:Show');

                },
                book: function (param) {
                    return TripService.saveBooking(param);
                }
            };
        }]);

    return modules;
});
