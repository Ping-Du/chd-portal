define(['config', 'app/i18n/i18n-service'], function (config, module) {
    'use strict';

    module.controller("languageController",['$scope', '$translate', 'cssInjector', 'languageService', function($scope, $translate, cssInjector, languageService){

        var currentLanguage = $translate.proposedLanguage() || $translate.use(); // $translate.preferredLanguage();

        //{
        //    "Id": "string",
        //    "Culture": "string",
        //    "Name": "string",
        //    "LocalName": "string",
        //    "FlagImageURI": "string",
        //    "DestinationsURI": "string",
        //    "FeaturedDestinationsURI": "string",
        //    "HotelsURI": "string",
        //    "FeaturedHotelsURI": "string",
        //    "ServicesURI": "string",
        //    "FeaturedServicesURI": "string",
        //    "TopHotelDestinationsURI": "string"
        //}

        //$scope.language = {
        //    key: currentLanguage,
        //    isChinese: (currentLanguage === 'cn')
        //};

        $scope.currentLanguage = null;
        $scope.availableLanguages = null;

        function addCss(language) {
            cssInjector.removeAll();
            cssInjector.add(config.webRoot + 'styles/font-' + language + '.css');
        }

        $scope.changeLanguage = function(languageKey){
            $translate.use(languageKey);
            $scope.language.key = languageKey;
            $scope.language.isChinese = (languageKey === 'cn');
            addCss(languageKey);
        };

        $scope.getLanguages = function() {
            var promise = languageService.getLanguages();
            promise.then(function(data){
                $scope.availableLanguages = data;

            }, function(/*data*/){
                $scope.availableLanguages = null;
            });
        };

        $scope.getLanguageById = function(languageId) {
            var promise = languageService.getLanguageById(languageId);
            promise.then(function(data){
                $scope.currentLanguage = data;
            }, function(/*data*/){
                $scope.currentLanguage = null;
            });
        };

        addCss(currentLanguage);
        $scope.getLanguages();

    }]);

    return module;
});

