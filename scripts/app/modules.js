define(['config', 'underscore', 'ui-bootstrap', 'angular-translate-storage-local'], function (cfg, _, angular) {

    var services = angular.module('chd.services', ['ngCookies', 'ngSanitize', 'pascalprecht.translate', 'angular.css.injector']);
    var filters = angular.module('chd.filters', []);
    var directives = angular.module('chd.directives', []);
    var controllers = angular.module('chd.controllers', [services.name]);
    var app = angular.module('chd', ['ui.bootstrap', directives.name, services.name, controllers.name]);

    services.constant('Config', cfg);

    services.factory('_', ['$window', function ($window) {
        return $window._;
    }]);

    app.run(['$http', 'Config', function ($http, config) {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + config.token;
    }]);

    return {
        angular: angular,
        app: app,
        filters: filters,
        directives: directives,
        services: services,
        controllers: controllers
    };
});
