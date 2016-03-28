define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AccountMainController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                $scope.message = "Wrong URL, Please make sure the URL is right!";

            }]);

    return modules;
});



