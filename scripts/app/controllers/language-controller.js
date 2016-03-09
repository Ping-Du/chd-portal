define(['app/services/language-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("LanguageController", ['$rootScope', '$scope', '$translate', '$log', 'cssInjector',
            'SessionService', 'LanguageService', '$location',
            function ($rootScope, $scope, $translate, $log, cssInjector, SessionService, LanguageService, $location) {

                $log.debug('LanguageController:'+$location.path());

                var path = $location.path();
                var lang = LanguageService.determineLanguageIdFromPath(path);
                if (!lang)
                    lang = SessionService.languageId();
                if (!lang)
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

                $scope.changeLanguage = function (languageKey, reload, broadcast) {
                    //if($scope.languageId == languageKey)
                    //    return;

                    SessionService.languageId(languageKey);
                    if (reload) {
                        var url = $location.path();
                        $log.debug('original:' + url);
                        url = url.replace('/' + $scope.currentLanguage.Id, '/' + languageKey);
                        $log.debug('redirect:' + url);
                        $location.path(url);
                    }
                    $translate.use(languageKey);
                    setCurrentLanguage(languageKey);
                    addCss(languageKey);
                    if(broadcast)
                        $rootScope.$broadcast('LanguageChanged', languageKey);
                    $log.debug('use language:' + languageKey);
                };

                $scope.getLanguages = function () {
                    var promise = LanguageService.getLanguages();
                    promise.then(function (data) {
                        $scope.availableLanguages = data;
                        $scope.changeLanguage($scope.currentLanguage);
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

                $scope.$on('RequireChangeLanguage', function(event, languageId){
                    $scope.changeLanguage(languageId, false, true);
                });

                $scope.getLanguages();

            }]);

    return modules;
});
