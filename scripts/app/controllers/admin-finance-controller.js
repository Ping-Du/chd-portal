define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminFinanceController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$window', 'AccountService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window, AccountService) {

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

                $scope.financeInfo = null;
                $scope.userName = SessionService.user();
                function load() {
                    AccountService.getFinanceInfo().then(function(data){
                        $scope.financeInfo = data;
                    });
                }

                load();
            }]);

    return modules;
});

