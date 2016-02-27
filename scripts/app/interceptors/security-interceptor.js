define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.interceptors
        .factory('SecurityInterceptor', ['SessionService', function (SessionService) {
            var tokenInjector = {
                request: function (cfg) {
                    cfg.headers['Authorization'] = 'Bearer ' + SessionService.token()?SessionService.token():SessionService.config().apiToken;
                    return cfg;
                }
            };
            return tokenInjector;
        }]);

    modules.interceptors.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('SecurityInterceptor');
    }]);

    return modules;
});
