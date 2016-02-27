define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('AccountController', ['$rootScope', '$scope', '$window', '$location', 'AccountService', function ($rootScope, $scope, $window, $location, AccountService) {

            $scope.isAuthorized = AccountService.isAuthorized();

            $scope.login = function(userName, password) {
                var promise = AccountService.login(userName, password);
                promise.then(function (data) {
                    $scope.isAuthorized = true;
                    //$rootScope.$broadcast('login', data.access_token)
                }, function (/*data*/) {
                    $scope.isAuthorized = false;
                });
            }

        }]);
});
