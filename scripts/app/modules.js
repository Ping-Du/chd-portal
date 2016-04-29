define(['underscore', 'angular', 'angular-local-storage', "angucomplete-alt", 'inputmask','angular-loading', 'angular-messages'], function (_, angular) {

    var services = angular.module('chd.services', ['ngCookies','LocalStorageModule', 'ngSanitize', 'pascalprecht.translate', 'angular.css.injector']);
    var filters = angular.module('chd.filters', []);
    var interceptors = angular.module('chd.interceptors',[services.name]);
    var directives = angular.module('chd.directives', ["angucomplete-alt", "green.inputmask4angular", 'ngMessages']);
    var controllers = angular.module('chd.controllers', [services.name, 'darthwade.dwLoading']);
    var app = angular.module('chd', ['ui.bootstrap','ngRoute', filters.name, directives.name, services.name, interceptors.name, controllers.name]);

    services.factory('_', ['$window', function ($window) {
        return $window._;
    }]);

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
