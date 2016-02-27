define(['app/services/session-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('SessionController', ['$scope', 'SessionService', function ($scope, SessionService) {

            $scope.user = SessionService.user();
            $scope.password = SessionService.password();
            $scope.token = SessionService.token();
            $scope.config = SessionService.config();

            $scope.$on('login', function(event, data){
                $scope.user = SessionService.user();
                $scope.password = SessionService.password();
                $scope.token = SessionService.token();
            });

            $scope.$on('logout', function(event, data){
                $scope.user = null;
                $scope.password = null;
                $scope.token = null;
            });

        }]);

    return modules;
});
