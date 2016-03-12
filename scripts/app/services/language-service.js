define(['config', 'app/services/session-service'], function (config, modules) {
    'use strict';
    modules.services
        .config(['$translateProvider', 'SessionServiceProvider', function ($translateProvider, SessionServiceProvider) {

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

            var languageId = $.cookie('languageId');
            if(languageId){
                $translateProvider.preferredLanguage(languageId);
            } else {
                if ($translateProvider.preferredLanguage() === undefined) {
                    $translateProvider.determinePreferredLanguage();
                }
                if ($translateProvider.preferredLanguage() === undefined) {
                    $translateProvider.preferredLanguage('CHI');
                }
            }
            console.log('preferredLanguage:'+$translateProvider.preferredLanguage());
            SessionServiceProvider.languageId($translateProvider.preferredLanguage());

        }])
        .service('LanguageService', ['$http', '$q', 'SessionService', '$translate', function ($http, $q, SessionService, $translate) {
            function invoke(url, method) {
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
                    return invoke('/' + languageId, 'GET');
                },
                determineLanguageIdFromPath: function(path) {
                    var lang = null;
                    if (path.indexOf('/CHI') >= 0)
                        lang = 'CHI';
                    if (path.indexOf('/ENG') >= 0)
                        lang = 'ENG';
                    return lang;
                }
            };
        }]);

    return modules;
});

