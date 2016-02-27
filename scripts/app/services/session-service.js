define(['config', 'app/modules'], function (cfg, modules) {
    'use strict';
    modules.services
        .service('SessionService', ['$cookies', function ($cookies) {
            var token = $cookies.get('token');
            var session = {
                config:cfg,
                token:token,
                user:(token?$cookies.get('user'):''),
                password:(token?$cookies.get('password'):'')
            };

            function setCookie(key, value) {
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 14);
                $cookies.put(key, value, {'expires': expireDate});
            }

            return {
                config:function(){
                    return session.config;
                },
                token:function(value){
                    if(arguments.length == 0) {
                        return session.token;
                    }
                    else {
                        if(value == null) {
                            $cookies.remove('token');
                        } else {
                            setCookie('user', value);
                        }
                        session.token = value;
                    }
                },
                user:function(value){
                    if(arguments.length == 0) {
                        return session.user;
                    }
                    else {
                        if(value == null) {
                            $cookies.remove('user');
                        } else {
                            setCookie('user', value);
                        }
                        session.user = value;
                    }
                },
                password:function(value){
                    if(arguments.length == 0) {
                        return session.password;
                    }
                    else {
                        if(value == null) {
                            $cookies.remove('password');
                        } else {
                            setCookie('password', value);
                        }
                        session.password = value;
                    }
                }
            }
        }]);

    return modules;
});
