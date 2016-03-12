define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AccountResetPasswordController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.message = '';

                $scope.userName = null;
                $scope.code = null;
                $scope.newPassword = null;
                $scope.confirmPassword = null;
                $scope.url = $location.absUrl();

                var search = $location.search();
                if(search.userName && search.code) {
                    $scope.userName = search.userName;
                    $scope.code = search.code;
                    //AccountService.resetPassword(search.userId, search.code).then(function () {
                    //    $scope.message = 'Your email is confirmed!';
                    //}, function (data) {
                    //    $scope.message = 'There is an error when confirming email!';
                    //});
                } else {
                    $scope.message = 'Wrong url!'
                }

            }]);

    return modules;
});
