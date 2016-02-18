define(['config', 'underscore', 'ui-bootstrap', 'app/i18n/i18n-controller', 'app/navbar/navbar-controller'],
    function (cfg, _, angular, i18n, navbar) {
        'use strict';

        var module = angular.module('chd.common', ['ui.bootstrap', i18n.name, navbar.name ]);

        module.constant('config', cfg);

        module.factory('_', ['$window', function ($window) {
            return $window._;
        }]);

        module.run(['$http', 'config', function($http, config){
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + config.token;
        }]);

        return module;
    });

