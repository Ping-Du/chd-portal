define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/package-main-controller',
        'app/controllers/package-top-controller',
        'app/controllers/package-detail-controller',
        'app/controllers/register-modal-controller','jquery.raty'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('package');
        }]);

        // config route
        modules.app.config(['$routeProvider',  'SessionServiceProvider','insightsProvider', function($routeProvider, SessionServiceProvider, insightsProvider){
            $routeProvider
                .when('/top/:languageId', {
                    templateUrl:'templates/package-top-view.html',
                    controller:'PackageTopController',
                    reloadOnSearch:true
                })
                .when('/:languageId', {
                    templateUrl:'templates/package-main-view.html',
                    controller:'PackageMainController',
                    reloadOnSearch:true
                })
                .when('/:packageId/:languageId',{
                    templateUrl:'templates/package-detail-view.html',
                    controller:'PackageDetailController',
                    reloadOnSearch:true
                })
                .otherwise({
                    redirectTo: '/top/' + $.cookie('languageId')
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
