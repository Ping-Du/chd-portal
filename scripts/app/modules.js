define(['underscore', 'ui-bootstrap', 'angular-translate-storage-local'], function (_, angular) {

    var services = angular.module('chd.services', ['ngCookies', 'ngSanitize', 'pascalprecht.translate', 'angular.css.injector']);
    var filters = angular.module('chd.filters', []);
    var interceptors = angular.module('chd.interceptors',[services.name]);
    var directives = angular.module('chd.directives', []);
    var controllers = angular.module('chd.controllers', ['ui.bootstrap', services.name]);
    var app = angular.module('chd', [filters.name, directives.name, services.name, interceptors.name, controllers.name]);

    services.factory('_', ['$window', function ($window) {
        return $window._;
    }]);

    //app.run(['$http', 'Config', function ($http, Config) {
    //    $http.defaults.headers.common['Authorization'] = 'Bearer ' + Config.token;
    //    $http.defaults.headers.post[]
    //}]);

    return {
        angular: angular,
        app: app,
        filters: filters,
        directives: directives,
        services: services,
        controllers: controllers,
        interceptors:interceptors
    };
});
