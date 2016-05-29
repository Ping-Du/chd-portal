define(['config', 'app/modules'], function (cfg, modules) {
    'use strict';
    modules.services
        .provider('SessionService', function () {
            var token = $.cookie('token');
            var session = {
                config: cfg,
                token: token,
                user: (token ? $.cookie('user') : null),
                //password:(token?$cookies.get('password'):''),
                languageId: (token? $.cookie('languageId') :null),
                roleId:(token? $.cookie('roleId'):null)
            };

            console.log('user:' + session.user + ' languageId:'+session.languageId);

            function setCookie(key, value) {
                if (value != null) {
                    $.cookie(key, value, {expires: 14});
                } else {
                    $.removeCookie(key);
                }
            }

            this.languageId = function (languageId) {
                if(languageId) {
                    setCookie('languageId', languageId);
                    session.languageId = languageId;
                }
                else
                    return session.languageId;
            };

            this.user = function (value) {
                if (arguments.length == 0) {
                    return session.user;
                }
                else {
                    setCookie('user', value);
                    session.user = value;
                }
            };

            this.roleId = function(value) {
                if(arguments.length == 0)
                    return (session.roleId);
                else {
                    setCookie('roleId', value);
                    session.roleId = value;
                }
            };

            this.config = function(){
                return session.config;
            };

            this.token = function (value) {
                if (arguments.length == 0) {
                    return session.token;
                }
                else {
                    setCookie('token', value);
                    session.token = value;
                }
            };

            this.$get = function () {
                var self = this;
                return {
                    config: self.config,
                    token: self.token,
                    user: self.user,
                    languageId: self.languageId,
                    roleId:self.roleId
                };
            };
        });

    return modules;
});
