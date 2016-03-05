define(['config', 'app/services/session-service'], function (config, modules) {
    'use strict';
    modules.services
        .config(['$translateProvider', function ($translateProvider) {

            $translateProvider.useStaticFilesLoader({
                files: [{
                    prefix:  config.webRoot + 'i18n/',
                    suffix: '.json'
                }]
            });
            $translateProvider.registerAvailableLanguageKeys(['ENG', 'CHI'], {
                'en_*': 'ENG',
                'zh_*': 'CHI'
            });
            $translateProvider.useSanitizeValueStrategy('escape');
            //$translateProvider.useLocalStorage();

                if ($translateProvider.preferredLanguage() === undefined) {
                    $translateProvider.determinePreferredLanguage();
                }
                if ($translateProvider.preferredLanguage() === undefined) {
                    $translateProvider.preferredLanguage('CHI');
                }

        }])
        .service('LanguageService', ['$http', '$q', 'SessionService', function ($http, $q, SessionService) {
            function invoke(url, method, languageId) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: ( SessionService.config().apiRoot + 'languages' + url)
                }).success(function (data/*, status, headers, cfg*/) {
                    deferred.resolve(data);
                }).error(function (data/*, status, headers, cfg*/) {
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                getLanguages: function () {
                    return invoke('', 'GET');
                },
                getLanguageById: function (languageId) {
                    return invoke('/' + languageId, 'GET', languageId);
                }
            };
        }]);

    return modules;
});

