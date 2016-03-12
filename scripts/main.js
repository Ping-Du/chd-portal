/**
 * Config application's dependencies and load expected application
 */
define(['config'], function (cfg) {
    'use strict';

    var libs = {
        baseUrl: cfg.webRoot + 'scripts/',
        //urlArgs: '_ts=' + (new Date()).getTime(),
        paths: {
            'jquery':'libs/jquery.min',
            'jquery.cookie':'libs/jquery.cookie',
            'jquery.storageapi':'libs/jquery.storageapi.min',
            'jssor.slider':'libs/jssor.slider.mini',
            'bootstrap':'libs/bootstrap.min',
            'underscore': 'libs/underscore-min',
            'angular': 'libs/angular',
            'angular-cookies': 'libs/angular-cookies.min',
            'angular-sanitize': 'libs/angular-sanitize.min',
            'angular-local-storage': 'libs/angular-local-storage.min',
            'angular-resource': 'libs/angular-resource.min',
            'angular-route': 'libs/angular-route.min',
            'angular-translate': 'libs/angular-translate.min',
            'angular-translate-loader-static-files': 'libs/angular-translate-loader-static-files.min',
            'angular-translate-storage-cookie': 'libs/angular-translate-storage-cookie.min',
            'angular-translate-storage-local': 'libs/angular-translate-storage-local.min',
            'angular-messages':'libs/angular-messages.min',
            'ui-bootstrap':'libs/ui-bootstrap-tpls.min',
            'angular-css-injector':'libs/angular-css-injector.min',
            'angular-ui-router':'libs/angular-ui-router.min',
            'dang-jssor':'libs/dang-jssor.min',
            'bootstrap-datepicker':'libs/bootstrap-datepicker.min',
            'bootstrap-datepicker.zh-CN':'libs/bootstrap-datepicker.zh-CN.min'
        },
        shim: {
            'jquery':{
                exports:'$'
            },
            'jquery.cookie': {
                deps:['jquery']
            },
            'jquery.storageapi':{
                deps:['jquery.cookie']
            },
            'jssor.slider':{
                deps:['jquery']
            },
            'bootstrap':{
                deps:['jquery'],
                exports:'$'
            },
            'underscore':{
                exports:'_'
            },
            'angular':{
                deps:['bootstrap'],
                exports:'angular'
            },
            'angular-cookies': {
                deps: ['angular'],
                exports:'angular'
            },
            'angular-sanitize': {
                deps: ['angular'],
                exports:'angular'
            },
            'angular-local-storage': {
                deps: ['angular-cookies'],
                exports:'angular'
            },
            'angular-resource': {
                deps: ['angular'],
                exports:'angular'
            },
            'angular-route': {
                deps: ['angular'],
                exports:'angular'
            },
            'angular-messages':{
                deps: ['angular'],
                exports:'angular'
            },
            'ui-bootstrap':{
                deps:['angular'],
                exports:'angular'
            },
            'angular-css-injector':{
                deps:['angular']
            },
            'angular-translate':{
                deps: ['angular-sanitize', 'angular-css-injector']
            },
            'angular-translate-loader-static-files':{
                deps: ['angular-translate']
            },
            //'angular-translate-storage-cookie':{
            //    deps: ['angular-cookies', 'angular-translate-loader-static-files']
            //},
            //'angular-translate-storage-local':{
            //    deps: ['angular-local-storage', 'angular-translate-storage-cookie']
            //},
            'angular-ui-router':{
                deps:['angular']
            },
            'dang-jssor':{
                deps:['jquery', 'angular', 'jssor.slider']
            },
            'bootstrap-datepicker':{
                deps:['bootstrap']
            },
            'bootstrap-datepicker.zh-CN':{
                deps:['bootstrap-datepicker']
            }
        }
    };

    require.config(libs);

    require(['jquery', 'ui-bootstrap', 'jquery.storageapi', 'angular-route', 'angular-translate-loader-static-files', 'angular-cookies'], function($){
        // enable cors
        $.support.cors = true;

        function bootstrap(apiToken) {
            cfg.apiToken = apiToken;

            // bootstrap page
            var bootstrapName = $('script[data-bootstrap]').attr('data-bootstrap');
            require([bootstrapName + '-bootstrap']);
        }

        // get token
        var storage = $.sessionStorage;
        var token = storage.get('apiToken');
        if(token == null) {
            $.ajax({
                url: cfg.apiRoot + 'account/Login',
                type: 'POST',
                //async: false,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "Username": cfg.apiUser,
                    "Password": cfg.apiPassword
                }),
                success: function (data/*, status*/) {
                    //{"access_token": "string","token_type": "bearer","expires_in": 0,"userName": "string","issued": "2016-02-17T11:39:45.637Z","expires": "2016-02-17T11:39:45.639Z"}
                    storage.set('apiToken', data.access_token);
                    token = data.access_token;
                    bootstrap(token);
                },
                error: function (request/*, status, error*/) {
                    console.error('readyState:' + request.readyState + ' statusText:' + request.statusText);
                    //document.location.href = cfg.webRoot + 'info.html#/api';
                }
            });
        } else {
            bootstrap(token);
        }
    });
});