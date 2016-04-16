define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminMainController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$window',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window) {

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
                    }
                });



            }]);

    return modules;
});

