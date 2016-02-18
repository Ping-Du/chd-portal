define(['config', 'angular', 'angular-translate-storage-local'],
    function (config, angular) {
        'use strict';
        var module = angular.module('chd.i18n', ['ngCookies', 'ngSanitize', 'pascalprecht.translate', 'angular.css.injector']);
        module.config(['$translateProvider', function ($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                files: [{
                    prefix: config.webRoot + 'i18n/',
                    suffix: '.json'
                }]
            });
            $translateProvider.registerAvailableLanguageKeys(['ENG', 'CHI'], {
                'en_*': 'ENG',
                'zh_*': 'CHI'
            });
            $translateProvider.useSanitizeValueStrategy('escape');
            $translateProvider.useLocalStorage();
            if ($translateProvider.preferredLanguage() === undefined) {
                $translateProvider.determinePreferredLanguage();
            }
            if ($translateProvider.preferredLanguage() === undefined) {
                $translateProvider.preferredLanguage('CHI');
            }
        }]);

        module.service('languageService', ['$http', '$q', 'config', function ($http, $q, config) {
            function retrieveLanguage(){
                var languageId = '';
                if (arguments.length == 1) {
                    languageId = '/' + arguments[0];
                }
                var deferred = $q.defer();
                $http({
                    method: 'GET',
                    url: (config.apiRoot + 'languages' + languageId)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getLanguages: function () {
                    return retrieveLanguage();
                },
                getLanguageById: function(languageId) {
                    return retrieveLanguage(languageId);
                }
            };
        }]);

        return module;
    });
