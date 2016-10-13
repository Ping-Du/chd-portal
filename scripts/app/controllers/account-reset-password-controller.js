define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AccountResetPasswordController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$routeParams', 'AccountService', '$translate', '$window',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $routeParams, AccountService, $translate, $window) {

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

                $scope.disableBtn = false;
                if($routeParams.userName && $routeParams.code) {
                    $scope.userName = $routeParams.userName;
                    $scope.code = $routeParams.code;
                } else {
                    $scope.message = "Wrong URL!";
                    $scope.disableBtn = true;
                }

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.btnText = 'OK';
                //var btnOK = 'OK';
                //var btnLogin = 'LOGIN';
                //$translate('OK').then(function (translation) {
                //    $scope.btnText = translation;
                //});

                $scope.resetPassword = function() {
                    if($scope.btnText == 'OK') {
                        if ($scope.newPassword == '' || $scope.newPassword != $scope.confirmPassword) {
                            translate('PASSWORD_NOT_MATCH');
                            return;
                        }
                        if ($scope.newPassword.length < 6) {
                            translate('PASSWORD_LENGTH');
                            return;
                        }
                        AccountService.resetPassword($scope.userName, $scope.newPassword, $scope.confirmPassword, $scope.code, "").then(function () {
                            $scope.btnText = 'LOGIN';
                            translate('PASSWORD_RESET');
                        }, function (data) {
                            $scope.message = data.ModelState.ResetPassword;
                        });
                    } else {
                        $window.location.href = SessionService.config().webRoot + "home.html#/"+languageId + "?login=true";
                    }
                }

            }]);

    return modules;
});
