define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/register-modal-controller',
        'app/controllers/service-top-controller',
        'app/controllers/service-main-controller',
        'app/controllers/service-detail-controller',
        'jquery.spinner'],
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
        modules.app.config(['$routeProvider',  'SessionServiceProvider', 'insightsProvider',function ($routeProvider, SessionServiceProvider,insightsProvider) {
            $routeProvider
                //.when('/shows/:languageId', {
                //    templateUrl: 'templates/service-main-view.html',
                //    controller: 'ServiceMainController'
                //    //,reloadOnSearch: true
                //})
                //.when('/shows/:serviceId/:languageId', {
                //    templateUrl: 'templates/service-detail-view.html',
                //    controller: 'ServiceDetailController'
                //    //,reloadOnSearch: true
                //})
                .when('/activities/top/:languageId', {
                    templateUrl: 'templates/service-top-view.html',
                    controller: 'ServiceTopController'
                })
                .when('/activities/:languageId',{
                    templateUrl:'templates/service-main-view.html',
                    controller:'ServiceMainController'
                })
                .when('/activities/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                })
                .when('/tours/top/:languageId', {
                    templateUrl: 'templates/service-top-view.html',
                    controller: 'ServiceTopController'
                })
                .when('/tours/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                })
                .when('/tours/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                })
                .when('/transportation/top/:languageId', {
                    templateUrl: 'templates/service-top-view.html',
                    controller: 'ServiceTopController'
                })
                .when('/transportation/:languageId', {
                    templateUrl: 'templates/service-main-view.html',
                    controller: 'ServiceMainController'
                })
                .when('/transportation/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                })
                //.when('/dining/:languageId', {
                //    templateUrl: 'templates/service-main-view.html',
                //    controller: 'ServiceMainController'
                //    //,reloadOnSearch: true
                //})
                //.when('/dining/:serviceId/:languageId', {
                //    templateUrl: 'templates/service-detail-view.html',
                //    controller: 'ServiceDetailController'
                //    //,reloadOnSearch: true
                //})
                .otherwise({
                    redirectTo: '/activities/top/' + $.cookie('languageId')
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
