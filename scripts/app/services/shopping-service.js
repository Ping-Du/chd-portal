define(['app/services/trip-service'], function (modules) {
    'use strict';
    modules.services
        .service('ShoppingService', ['$cookieStore', 'localStorageService', 'TripService', function ($cookieStore, localStorageService, TripService) {

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
                addItem: function (product, categoryIndex) {
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
                },
                removeAll: function () {
                    //localStorageService.clearAll();
                    localStorageService.remove('shoppingItems');
                    $cookieStore.put('hasShoppingItems', false);
                    shoppingItems.hotels = [];
                    shoppingItems.services = [];
                    shoppingItems.packages = [];

                },
                book: function (param) {
                    return TripService.saveBooking(param);
                }
            };
        }]);

    return modules;
});
