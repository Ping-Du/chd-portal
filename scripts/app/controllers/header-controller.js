define(['app/services/header-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HeaderController', ['$scope', 'HeaderService', function($scope, HeaderService){
            $scope.showLanguage = HeaderService.showLanguage;
            $scope.showAccount = HeaderService.showAccount;
            $scope.showSearchBox = HeaderService.showSearchBox;
        }]);
});
