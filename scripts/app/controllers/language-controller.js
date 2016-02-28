define(['app/services/language-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("LanguageController", ['$rootScope', '$scope', '$translate', 'cssInjector', 'SessionService', 'LanguageService',
            function ($rootScope, $scope, $translate, cssInjector, SessionService, LanguageService) {

                var currentLanguage = $translate.proposedLanguage() || $translate.use(); // $translate.preferredLanguage();

                $scope.currentLanguage = null;
                $scope.availableLanguages = null;
                //[{"Id":"CHI","Culture":"zh","Name":"CHINESE","LocalName":"中文","FlagImageURI":"https://chdtracelink.azurewebsites.net/images/zh.png","DestinationsURI":"/destinations/languages/CHI","FeaturedDestinationsURI":"/destinations/featured/languages/CHI","HotelsURI":"/hotels/languages/CHI","FeaturedHotelsURI":"/hotels/featured/languages/CHI","ServicesURI":"/services/languages/CHI","FeaturedServicesURI":"/services/featured/languages/CHI","TopHotelDestinationsURI":"/hotels/top/destinations/languages/CHI"},
                // {"Id":"ENG","Culture":"en","Name":"ENGLISH","LocalName":"","FlagImageURI":"https://chdtracelink.azurewebsites.net/images/en-us.png","DestinationsURI":"/destinations/languages/ENG","FeaturedDestinationsURI":"/destinations/featured/languages/ENG","HotelsURI":"/hotels/languages/ENG","FeaturedHotelsURI":"/hotels/featured/languages/ENG","ServicesURI":"/services/languages/ENG","FeaturedServicesURI":"/services/featured/languages/ENG","TopHotelDestinationsURI":"/hotels/top/destinations/languages/ENG"}];

                function addCss(language) {
                    cssInjector.removeAll();
                    cssInjector.add(SessionService.config().webRoot + 'styles/font-' + language + '.css');
                }

                function setCurrentLanguage(languageKey) {
                    if ($scope.availableLanguages != null) {
                        for (var i = 0; i < $scope.availableLanguages.length; i++) {
                            if ($scope.availableLanguages[i].Id === languageKey) {
                                $scope.currentLanguage = $scope.availableLanguages[i];
                            }
                        }
                    }
                }

                $scope.changeLanguage = function (languageKey) {
                    $translate.use(languageKey);
                    setCurrentLanguage(languageKey);
                    addCss(languageKey);
                };

                $scope.getLanguages = function () {
                    var promise = LanguageService.getLanguages();
                    promise.then(function (data) {
                        $scope.availableLanguages = data;

                    }, function (/*data*/) {
                        $scope.availableLanguages = null;
                    });
                };

                $scope.getLanguageById = function (languageId) {
                    var promise = LanguageService.getLanguageById(languageId);
                    promise.then(function (data) {
                        $scope.currentLanguage = data;
                        $rootScope.$broadcast('LanguageChanged', data);
                    }, function (/*data*/) {
                        //$scope.currentLanguage = null;
                    });
                };

                addCss(currentLanguage);
                $scope.getLanguageById(currentLanguage);
                $scope.getLanguages();

            }]);

    return modules;
});
