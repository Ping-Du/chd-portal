define(['underscore', 'angular', 'angular-local-storage', "angucomplete-alt", 'inputmask','angular-loading', 'angular-messages', 'ui-grid', 'angular-appinsights','clickoutside'], function (_, angular) {

    var services = angular.module('chd.services', ['ngCookies','LocalStorageModule', /*'ngSanitize',*/ 'pascalprecht.translate', 'angular.css.injector', 'angular-appinsights']);
    var filters = angular.module('chd.filters', []);
    var interceptors = angular.module('chd.interceptors',[services.name]);
    var directives = angular.module('chd.directives', ["angucomplete-alt", "green.inputmask4angular", 'ngMessages', 'angular-click-outside']);
    var controllers = angular.module('chd.controllers', [services.name, 'darthwade.dwLoading']);
    var app = angular.module('chd', ['ui.bootstrap','ngRoute','ui.grid', filters.name, directives.name, services.name, interceptors.name, controllers.name]);

    services.factory('_', ['$window', function ($window) {
        return $window._;
    }]);

    services.config(['$sceProvider', function($sceProvider){
        $sceProvider.enabled(false);
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
