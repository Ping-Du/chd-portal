define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AccountResetPasswordController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$routeParams', 'AccountService', '$translate',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $routeParams, AccountService, $translate) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.message = '';

                $scope.userName = null;
                $scope.code = null;
                $scope.newPassword = "";
                $scope.confirmPassword = "";
                $scope.url = $location.absUrl();

                if($routeParams.userName && $routeParams.code) {
                    $scope.userName = $routeParams.userName;
                    $scope.code = $routeParams.code;
                } else {
                    $scope.message = "Wrong URL!";
                }

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.resetPassword = function() {
                    if ($scope.newPassword == '' || $scope.newPassword != $scope.confirmPassword) {
                        translate('PASSWORD_NOT_MATCH');
                        return;
                    }
                    if ($scope.newPassword.length < 6) {
                        translate('PASSWORD_LENGTH');
                        return;
                    }
                    AccountService.resetPassword($scope.userName, $scope.newPassword, $scope.confirmPassword, $scope.code, "").then(function () {
                        $scope.message = 'Your password is reset!';
                    }, function (data) {
                        $scope.message = data.ModelState.ResetPassword;
                    });
                }

            }]);

    return modules;
});
