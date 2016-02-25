define([ 'app/services/navbar-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("NavbarController",['$scope','NavbarService', function($scope, NavbarService){

        $scope.navigator = {
            active: NavbarService.getActiveItem(),
            isCollapsed:true
        };

    }]);

    return modules;
});
