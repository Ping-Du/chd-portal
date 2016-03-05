define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('AccountController', ['$rootScope', '$scope', 'SessionService', 'AccountService',
            function ($rootScope, $scope, SessionService, AccountService) {

                $scope.user = SessionService.user();
                $scope.token = SessionService.token();
                $scope.config = SessionService.config();
                $scope.isAuthorized = $scope.token != null;

                $scope.openLoginModal = function (size) {
                    $rootScope.$broadcast('OpenLoginModal', size);
                };

                $scope.openRegisterModal = function (size) {
                    $rootScope.$broadcast('OpenRegisterModal', size);
                };

                $scope.logout = function () {
                    var promise = AccountService.logout();
                    promise.then(function () {
                        $rootScope.$broadcast('LOGOUT');
                    });
                };

                $scope.changePassword = function (size) {
                    $rootScope.$broadcast('OpenChangePasswordModal', size);
                };

                $scope.$on('LOGIN', function (event, data) {
                    $scope.user = SessionService.user();
                    $scope.token = SessionService.token();
                    $scope.isAuthorized = true;
                });

                $scope.$on('LOGOUT', function (event, data) {
                    $scope.user = null;
                    $scope.token = null;
                    $scope.isAuthorized = false;
                });
            }]);
});
