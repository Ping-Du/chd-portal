define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/register-modal-controller',
        'app/controllers/service-main-controller',
        'app/controllers/service-detail-controller'],
    function (modules) {
        'use strict';

        function parseService(hash) {
            var temp = hash.split('/');
            if (temp.length >= 2 && temp[0] == '#')
                return temp[1];
            else
                return null;
        }

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            var serviceType = parseService($(window).attr('location').hash);
            NavbarServiceProvider.setActiveItem(serviceType);
            //$('title').attr('translate', '{{"' + modules.angular.uppercase(serviceType) + '_TITLE"}}');
        }]);

        // config route
        modules.app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/shows/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                    //,reloadOnSearch: true
                })
                .when('/shows/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                    //,reloadOnSearch: true
                })
                .when('/activities/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                    //,reloadOnSearch: true
                })
                .when('/activities/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                    //,reloadOnSearch: true
                })
                .when('/tours/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController',
                    reloadOnSearch: true
                })
                .when('/tours/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                    //,reloadOnSearch: true
                })
                .when('/transportation/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                    //,reloadOnSearch: true
                })
                .when('/transportation/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                    //,reloadOnSearch: true
                })
                .when('/dining/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                    //,reloadOnSearch: true
                })
                .when('/dining/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                    //,reloadOnSearch: true
                })
                .otherwise({
                    redirectTo: '/shows/' + $.cookie('languageId')
                });
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
