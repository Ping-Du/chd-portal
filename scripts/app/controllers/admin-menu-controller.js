define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminMenuController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location','LanguageService', '$window',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window) {

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

                $scope.menuItems = [{
                    href:'/trips/'+languageId,
                    active:false
                }, {
                    href:'/finance/'+languageId,
                    active:false
                }];

                $scope.clickMenuItem = function(index) {
                   modules.angular.forEach($scope.menuItems, function(item, idx){
                       item.active = (idx == index);
                   });
                    $location.url($scope.menuItems[index].href, true);
                };

                $scope.changePassword = function (size) {
                    $rootScope.$broadcast('OpenChangePasswordModal', size);
                };

                function setMenuItemClass() {
                    if(SessionService.user() == null) {
                        $window.location.href = 'home.html#/' + languageId;
                    } else {
                        modules.angular.forEach($scope.menuItems, function (item) {
                            item.active = ($location.path().indexOf(item.href) == 0);
                        });
                    }
                }

                $scope.$on('LOGOUT', function(event, data){
                    $window.location.href = 'home.html#/' + languageId;
                });

                setMenuItemClass();

            }]);

    return modules;
});

