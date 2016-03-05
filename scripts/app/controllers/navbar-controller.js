define(['app/services/navbar-service', 'app/services/session-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("NavbarController", ['$scope', 'NavbarService', 'SessionService', function ($scope, NavbarService, SessionService) {

            $scope.navigator = {
                active: NavbarService.getActiveItem(),
                isCollapsed: true
            };

            $scope.webRoot = SessionService.config().webRoot;
            $scope.isAuthorized = (SessionService.token() != null);
            $scope.$on('LOGIN', function(event, data){
                $scope.isAuthorized = true;
            });
            $scope.$on('LOGOUT', function(event, data){
                $scope.isAuthorized = false;
            });

        }]);

    return modules;
});
