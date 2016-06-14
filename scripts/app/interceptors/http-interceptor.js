define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.interceptors
        .factory('HttpInterceptor', ['$q', '$rootScope', 'SessionService', function ($q, $rootScope, SessionService) {
            var requests = 0;

            function showOrHideLoading(cfg, show) {
                if (cfg.showLoading === false) {
                    return;
                }

                if (cfg.url.indexOf(SessionService.config().apiRoot) >= 0) {
                    //if (cfg.url.indexOf('/account/') < 0) {
                        if(show) {
                            $rootScope.showLoading = true;
                            requests++;
                        } else {
                            requests --;
                            if (requests <= 0) {
                                requests = 0;
                                $rootScope.showLoading = false;
                            }
                        }
                    //}
                }
            }

            var httpInjector = {
                request: function (cfg) {
                    showOrHideLoading(cfg, true);
                    cfg.headers.Authorization = ('Bearer ' + (SessionService.token() ? SessionService.token() : SessionService.config().apiToken));
                    cfg.headers["X-API-Duration"] = 0;
                    return cfg;
                },
                response: function (response) {
                    showOrHideLoading(response.config, false);
                    return response;
                },
                responseError: function (rejection) {
                    //console.error('requests:' + requests + ' url:' + rejection.config.url);
                    showOrHideLoading(rejection.config, false);
                    return $q.reject(rejection);
                }
            };
            return httpInjector;
        }]);

    modules.interceptors.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('HttpInterceptor');
    }]);

    return modules;
});
