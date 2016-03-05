define(['config', 'app/modules'], function (cfg, modules) {
    'use strict';
    modules.services
        .service('SessionService', ['$cookies','$log', function ($cookies, $log) {
            var token = $cookies.get('token');
            var session = {
                config: cfg,
                token: token,
                user: (token ? $cookies.get('user') : ''),
                //password:(token?$cookies.get('password'):''),
                languageId: $cookies.get('languageId')
            };
            $log.debug('saved language:' + session.languageId);

            function setCookie(key, value) {
                if (value != null) {
                    var expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 14);
                    $cookies.put(key, value, {'expires': expireDate});
                } else {
                    $cookies.remove(key);
                }
            }

            //this.$get = function () {
            //    var self = this;
                return {
                    config: function () {
                        return session.config;
                    },
                    token: function (value) {
                        if (arguments.length == 0) {
                            return session.token;
                        }
                        else {
                            setCookie('token', value);
                            session.token = value;
                        }
                    },
                    user: function (value) {
                        if (arguments.length == 0) {
                            return session.user;
                        }
                        else {
                            setCookie('user', value);
                            session.user = value;
                        }
                    },
                    languageId: function (value) {
                        if (arguments.length == 0) {
                            return session.languageId;
                        }
                        else {
                            setCookie('languageId', null);
                            setCookie('languageId', value);
                            session.languageId = value;
                            $log.debug('change language:' + value);
                        }
                    }
                };
            //};
        }]);

    return modules;
});
