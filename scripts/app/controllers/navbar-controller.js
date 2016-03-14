define(['app/services/navbar-service', 'app/services/session-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("NavbarController", ['$scope', 'NavbarService', 'SessionService', function ($scope, NavbarService, SessionService) {

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
            })

        }]);

    return modules;
});
