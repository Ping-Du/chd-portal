define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.interceptors
        .factory('HttpInterceptor', ['$q', '$rootScope', 'SessionService', function ($q, $rootScope, SessionService) {
            var requests = 0;
            var httpInjector = {
                request: function (cfg) {
                    if(cfg.url.indexOf(SessionService.config().apiRoot) >= 0) {
                        if(cfg.url.indexOf('/account/') < 0) {
                            $rootScope.showLoading = true;
                            requests++;
                            //console.log('requests:'+requests+' url:'+cfg.url);
                        }
                    }
                    cfg.headers.Authorization = ('Bearer ' + (SessionService.token()?SessionService.token():SessionService.config().apiToken));
                    return cfg;
                },
                response:function(response) {
                    if(response.config.url.indexOf(SessionService.config().apiRoot) >= 0) {
                        if(response.config.url.indexOf('/account/') < 0) {
                            requests--;
                            //console.log('requests:'+requests+' url:'+response.config.url);
                            if (requests <= 0) {
                                requests = 0;
                                $rootScope.showLoading = false;
                            }
                        }
                    }
                    return response;
                },
                responseError:function(rejection) {
                    console.error('requests:'+requests+' url:'+rejection.config.url);
                    if(rejection.config.url.indexOf(SessionService.config().apiRoot) >= 0) {
                        if(rejection.config.url.indexOf('/account/') < 0) {
                            requests--;
                            //console.log('requests:'+requests+' url:'+response.config.url);
                            if (requests <= 0) {
                                requests = 0;
                                $rootScope.showLoading = false;
                            }
                        }
                    }
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
