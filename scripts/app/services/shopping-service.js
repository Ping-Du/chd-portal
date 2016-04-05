define(['app/services/trip-service'], function (modules) {
    'use strict';
    modules.services
        .service('ShoppingService', ['$cookieStore', 'localStorageService', 'TripService', function($cookieStore, localStorageService, TripService){

            var hasShoppingItems = $cookieStore.get('hasShoppingItems');
            var shoppingItems = null;
            if(hasShoppingItems) {
                shoppingItems = localStorageService.get('shoppingItems');
            } else {
                localStorageService.clearAll();
            }
            if(!shoppingItems)
                shoppingItems = {
                    hotels:[],
                    services:[]
                };

            return {
                getItems: function () {
                    return shoppingItems;
                },
                addItem:function(product, categoryIndex) {
                    if (product.ProductType == 'HTL') {
                        shoppingItems.hotels.push({
                            product: product,
                            index: categoryIndex
                        });
                } else {
                        shoppingItems.services.push({
                            product: product,
                            index: categoryIndex
                        });
                    }
                    localStorageService.clearAll();
                    localStorageService.set('shoppingItems', shoppingItems);
                    $cookieStore.put('hasShoppingItems', true);
                },
                removeItem:function(type, index) {
                    if(type == 'HTL') {
                        shoppingItems.hotels.splice(index, 1);
                    } else {
                        shoppingItems.services.splice(index, 1);
                    }
                    //localStorageService.clearAll();
                    localStorageService.set('shoppingItems', shoppingItems);
                    $cookieStore.put('hasShoppingItems', (shoppingItems.hotels.length + shoppingItems.services.length) > 0);
                }
            };
        }]);

    return modules;
});
