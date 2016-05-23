define(['app/services/navbar-service',
    'app/services/session-service',
    'app/controllers/shopping-cart-modal-controller',
    'app/controllers/shopping-items-controller'], function (modules) {
    'use strict';

    modules.controllers
        .controller("NavbarController", ['$rootScope', '$scope', 'NavbarService', 'SessionService', 'ShoppingService', function ($rootScope, $scope, NavbarService, SessionService, ShoppingService) {

            $scope.navigator = {
                active: NavbarService.getActiveItem(),
                isCollapsed: true
            };

            console.log('Active Item:'+$scope.navigator.active);

            $scope.webRoot = SessionService.config().webRoot;
            $scope.isAuthorized = (SessionService.token() != null);
            $scope.languageId = SessionService.languageId();

            $scope.$on('LOGIN', function(event, data){
                $scope.isAuthorized = true;
            });
            $scope.$on('LOGOUT', function(event, data){
                $scope.isAuthorized = false;
            });
            $scope.$on('ServiceChanged', function(event, data){
                $scope.navigator.active = data;
                console.log('Active Item:'+$scope.navigator.active);
            });
            $scope.$on('LanguageChanged', function(event, data){
                $scope.languageId = data;
            });


            $scope.shoppingItems = ShoppingService.getItems();

            $scope.openShoppingCart = function() {
                $rootScope.$broadcast('ShoppingCart:Open');
            };

            $scope.openShoppingItemList = function() {
                $rootScope.$broadcast('ShoppingItemList:Show', true);
            };

            $scope.$on('ShoppingCart:Animate', function(event){
                times = 5;
                blink('#shopping-cart');
            });

            var times;
            function blink(selector){
                $(selector).fadeOut('slow', function(){
                    $(this).fadeIn('slow', function(){
                        times --;
                        if(times > 0)
                           blink(this);
                    });
                });
            }

        }]);

    return modules;
});
