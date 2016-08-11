define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('AccountController', ['$rootScope', '$scope', 'SessionService', 'AccountService', '$cookieStore',
            function ($rootScope, $scope, SessionService, AccountService, $cookieStore) {

                $scope.user = SessionService.user();
                $scope.token = SessionService.token();
                $scope.config = SessionService.config();
                $scope.isAuthorized = $scope.token != null;
                $scope.showRegister = (SessionService.roleId() == "Manager");
                $scope.displayName = SessionService.displayName();

                $scope.openLoginModal = function (size) {
                    $rootScope.$broadcast('OpenLoginModal', size);
                };

                $scope.openRegisterModal = function (size) {
                    $rootScope.$broadcast('OpenRegisterModal', size);
                };

                $scope.logout = function () {
                    var promise = AccountService.logout();
                    promise.then(function () {
                        $cookieStore.remove('serviceCriteria');
                        $cookieStore.remove('hotelCriteria');
                        $cookieStore.remove('packageCriteria');
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
                    $scope.showRegister = (SessionService.roleId() == "Manager");
                    $scope.displayName = SessionService.displayName();
                });

                $scope.$on('LOGOUT', function (event, data) {
                    $scope.user = null;
                    $scope.token = null;
                    $scope.isAuthorized = false;
                    $scope.showRegister = false;
                    $scope.displayName = null;
                });
            }]);
});
