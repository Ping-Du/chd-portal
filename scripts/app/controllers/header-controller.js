define(['app/services/header-service', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HeaderController', ['$scope', 'HeaderService', '$location', 'SessionService','$window',
            function ($scope, HeaderService, $location, SessionService, $window) {
                $scope.showLanguage = HeaderService.showLanguage;
                $scope.showAccount = HeaderService.showAccount;
                $scope.showSearchBox = HeaderService.showSearchBox;

                $scope.keyword = ($location.search().keyword ? $location.search().keyword : '');
                $scope.results = null;
                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                $scope.search = function () {
                    var word = $scope.keyword.Trim();
                    if (word != '') {
                        $window.location.href = $scope.webRoot + 'search.html#/' + $scope.languageId + '?keyword=' + word;
                    }
                };

                $scope.onKeyPressed = function(e) {
                    var keyCode = window.event?e.keyCode:e.which;
                    if(keyCode == 13) {
                        $scope.search();
                    }
                }
            }]);
});
