define(['app/modules'], function (modules) {
    'use strict';
    modules.services
        .config(['$translateProvider', 'Config', function ($translateProvider, Config) {
            $translateProvider.useStaticFilesLoader({
                files: [{
                    prefix: Config.webRoot + 'i18n/',
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
        }])
        .service('LanguageService', ['$http', '$q', 'Config', function ($http, $q, Config) {
            function retrieveLanguage() {
                var languageId = '';
                if (arguments.length == 1) {
                    languageId = '/' + arguments[0];
                }
                var deferred = $q.defer();
                $http({
                    method: 'GET',
                    url: (Config.apiRoot + 'languages' + languageId)
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
                getLanguageById: function (languageId) {
                    return retrieveLanguage(languageId);
                }
            };
        }]);

    return modules;
});

