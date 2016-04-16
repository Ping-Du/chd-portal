define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/admin-menu-controller',
        'app/controllers/admin-main-controller',
        'app/controllers/admin-finance-controller'],
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
        modules.app.config(['$routeProvider', 'SessionServiceProvider', function($routeProvider, SessionServiceProvider){
            console.log('user:' + SessionServiceProvider.user() + ' languageId:'+ SessionServiceProvider.languageId());
            $routeProvider
                .when('/trips/:languageId', {
                    templateUrl:'templates/admin-main-view.html',
                    controller:'AdminMainController'
                })
                .when('/finance/:languageId',{
                    templateUrl:'templates/admin-finance-view.html',
                    controller:'AdminFinanceController'
                })
                .otherwise({
                    redirectTo: '/trips/' + SessionServiceProvider.languageId() //$.cookie('languageId')
                });
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });

