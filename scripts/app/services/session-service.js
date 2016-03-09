define(['config', 'app/modules'], function (cfg, modules) {
    'use strict';
    modules.services
        .provider('SessionService', function () {
            //var token = $.cookie('token');
            var session = {
                config: cfg,
                token: $.cookie('token'),
                user: (this.token ? $.cookie('user') : ''),
                //password:(token?$cookies.get('password'):''),
                languageId: null// $.cookie('languageId')
            };

            function setCookie(key, value) {
                if (value != null) {
                    $.cookie(key, value, {expires: 14});
                } else {
                    $.removeCookie(key);
                }
            }

            this.languageId = function (languageId) {
                if(languageId)
                    session.languageId = languageId;
                else
                    return session.languageId;
            };

            this.$get = function () {
                var self = this;
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
                            setCookie('languageId', value);
                            session.languageId = value;
                        }
                    }
                };
            };
        });

    return modules;
});
