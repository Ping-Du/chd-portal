define([ 'app/navbar/navbar-service'], function (module) {
    'use strict';

    module.controller("navbarController",['$scope','navbarService', function($scope, navbarService){

        $scope.navigator = {
            active: navbarService.getActiveItem(),
            isCollapsed:true
        };

    }]);

    return module;
});
