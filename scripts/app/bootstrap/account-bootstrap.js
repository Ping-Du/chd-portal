define(['app/interceptors/security-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/account-main-controller',
        'app/controllers/account-confirm-email-controller',
        'app/controllers/account-reset-password-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('');
        }]);

        modules.app.config(['HeaderServiceProvider', function (HeaderServiceProvider) {
            HeaderServiceProvider.showLanguage(false);
            HeaderServiceProvider.showSearchBox(false);
            HeaderServiceProvider.showAccount(false);
        }]);

        // config route
        modules.app.config(['$routeProvider', 'SessionServiceProvider', function($routeProvider, SessionServiceProvider){
            console.log('user:' + SessionServiceProvider.user() + ' languageId:'+ SessionServiceProvider.languageId());
            $routeProvider
                .when('/:languageId', {
                    templateUrl:'templates/account-main-view.html',
                    controller:'AccountMainController'
                })
                .when('/reset-password/:languageId', {
                    templateUrl:'templates/account-reset_pwd-view.html',
                    controller:'AccountResetPasswordController'
                })
                .when('/confirm-email/:languageId',{
                    templateUrl:'templates/account-confirm_email-view.html',
                    controller:'AccountConfirmEmailController'
                })
                .otherwise({
                    redirectTo: '/' + SessionServiceProvider.languageId() //$.cookie('languageId')
                });
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });

