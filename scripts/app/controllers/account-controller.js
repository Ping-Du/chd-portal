define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('AccountController', ['$rootScope', '$scope', 'AccountService', function ($rootScope, $scope, AccountService) {

            $scope.openLoginModal = function(size){
                $rootScope.$broadcast('OpenLoginModal', size);
            };

            $scope.openRegisterModal = function(size) {
                $rootScope.$broadcast('OpenRegisterModal', size);
            };

            $scope.logout = function() {
                var promise = AccountService.logout();
                promise.then(function(){
                    $rootScope.$broadcast('LOGOUT');
                });
            };

            $scope.changePassword = function(size) {
                $rootScope.$broadcast('OpenChangePasswordModal', size);
            }
        }]);
});
