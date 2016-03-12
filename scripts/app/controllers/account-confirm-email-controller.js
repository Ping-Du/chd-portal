define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AccountConfirmEmailController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', 'AccountService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, AccountService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.message = '';

                var search = $location.search();
                if(search.userId && search.code) {
                    AccountService.confirmEmail(search.userId, search.code).then(function () {
                        $scope.message = 'Your email is confirmed!';
                    }, function (data) {
                        $scope.message = 'There is an error when confirming email!';
                    });
                } else {
                    $scope.message = 'Wrong url!'
                }

            }]);

    return modules;
});
