define([ 'app/common/common-service'], function (module) {
    'use strict';
    module.controller('commonController', ['$scope', 'config', function ($scope, config) {
        $scope.app = {
            root: config.webRoot
        };
    }]);
    return module;
});
