define(['config', 'underscore', 'app/modules'], function (cfg, _, modules) {
    'use strict';
    modules.services
        .provider('SessionService', function () {
            var token = $.cookie('token');
            var session = {
                config: cfg,
                token: token,
                user: (token ? $.cookie('user') : null),
                //password:(token?$cookies.get('password'):''),
                languageId: (token ? $.cookie('languageId') : null),
                roleId: (token ? $.cookie('roleId') : null),
                agencyNo: (token ? $.cookie('agencyNo') : null),
                displayName:(token? $.cookie('displayName'):null)
            };

            var savedOptions = [];

            //console.log('user:' + session.user + ' languageId:'+session.languageId);

            function setCookie(key, value) {
                if (value != null) {
                    $.cookie(key, value, {expires: 12});
                } else {
                    $.removeCookie(key);
                }
            }

            this.languageId = function (languageId) {
                if (languageId && languageId != session.languageId) {
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

            this.roleId = function (value) {
                if (arguments.length == 0)
                    return (session.roleId);
                else {
                    setCookie('roleId', value);
                    session.roleId = value;
                }
            };

            this.config = function () {
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

            this.agencyNo = function (value) {
                if (arguments.length == 0) {
                    return session.agencyNo;
                }
                else {
                    setCookie('agencyNo', value);
                    session.agencyNo = value;
                }
            };

            this.displayName = function(value) {
                if (arguments.length == 0) {
                    return (session.displayName?session.displayName:session.user);
                }
                else {
                    setCookie('displayName', value);
                    session.displayName = value;
                }
            };

            this.options = function (key, value) {
                var opt = _.find(savedOptions, function (item) {
                    return (item.key === key);
                });
                if (value === undefined) {
                    return (opt === undefined)?null:opt.value;
                } else {
                    if(opt === undefined)
                        savedOptions.push({
                            key:key,
                            value:value
                        });
                    else
                        opt.value = value;
                }
            };

            this.$get = function () {
                var self = this;
                return {
                    config: self.config,
                    token: self.token,
                    user: self.user,
                    languageId: self.languageId,
                    roleId: self.roleId,
                    agencyNo: self.agencyNo,
                    options: self.options,
                    displayName:self.displayName
                };
            };
        });

    return modules;
});
