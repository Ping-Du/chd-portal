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


            }]);

    return modules;
});



