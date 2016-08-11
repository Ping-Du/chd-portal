define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/register-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/admin-menu-controller',
        'app/controllers/admin-trips-controller',
        'app/controllers/admin-finance-controller',
        'app/controllers/admin-trips-detail-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('');
        }]);

        //modules.app.config(['HeaderServiceProvider', function (HeaderServiceProvider) {
        //    HeaderServiceProvider.showLanguage(false);
        //    HeaderServiceProvider.showSearchBox(false);
        //    HeaderServiceProvider.showAccount(false);
        //}]);

        // config route
        modules.app.config(['$routeProvider', 'SessionServiceProvider', 'insightsProvider', function($routeProvider, SessionServiceProvider, insightsProvider){
            console.log('user:' + SessionServiceProvider.user() + ' languageId:'+ SessionServiceProvider.languageId());
            $routeProvider
                .when('/trips/:tripType/:languageId', {
                    templateUrl:'templates/admin-trips-view.html',
                    controller:'AdminTripsController'
                })
                .when('/trips/:tripType/:tripId/:languageId',{
                    templateUrl:'templates/admin-trips-detail-view.html',
                    controller:'AdminTripsDetailController'
                })
                .when('/finance/:languageId',{
                    templateUrl:'templates/admin-finance-view.html',
                    controller:'AdminFinanceController'
                })
                .otherwise({
                    redirectTo: '/trips/current/' + SessionServiceProvider.languageId() //$.cookie('languageId')
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });

