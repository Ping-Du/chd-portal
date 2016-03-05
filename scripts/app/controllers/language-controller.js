define(['app/services/language-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("LanguageController", ['$rootScope', '$scope', '$translate', '$log', 'cssInjector',
            'SessionService', 'LanguageService', '$location', '$routeParams',
            function ($rootScope, $scope, $translate, $log, cssInjector, SessionService, LanguageService, $location, $rootParams) {

                if($rootParams.languageId)
                    SessionService.languageId($rootParams.languageId);

                var lang = SessionService.languageId();
                if(!lang)
                    lang = $translate.proposedLanguage() || $translate.use();

                $scope.currentLanguage = lang;
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

                $scope.changeLanguage = function (languageKey, noReload) {
                    SessionService.languageId(languageKey);
                    if(!noReload && SessionService.reloadOnChangeLanguage()) {
                        var url = $location.absUrl();
                        $log.debug('original:' + url);
                        url = url.replace('/'+$scope.currentLanguage.Id, '/'+languageKey);
                        $log.debug('redirect:' + url);
                        window.location.href = url;
                        window.location.reload();
                    } else {
                        $translate.use(languageKey);
                        setCurrentLanguage(languageKey);
                        addCss(languageKey);
                        SessionService.languageId(languageKey);
                        $rootScope.$broadcast('LanguageChanged', languageKey);
                        $log.debug('use language:' + languageKey);
                    }
                };

                $scope.getLanguages = function () {
                    var promise = LanguageService.getLanguages();
                    promise.then(function (data) {
                        $scope.availableLanguages = data;
                        $scope.changeLanguage($scope.currentLanguage, true);
                    }, function (/*data*/) {
                        $scope.availableLanguages = null;
                    });
                };

                $scope.getLanguageById = function (languageId) {
                    var promise = LanguageService.getLanguageById(languageId);
                    promise.then(function (data) {
                        //$scope.currentLanguage = data;
                    }, function (/*data*/) {
                        //$scope.currentLanguage = null;
                    });
                };

                $scope.getLanguages();

            }]);

    return modules;
});
