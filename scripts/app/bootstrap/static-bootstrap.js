define(['app/interceptors/http-interceptor',
        'app/controllers/header-controller',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/register-modal-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider',  'SessionServiceProvider', 'insightsProvider',function (NavbarServiceProvider, SessionServiceProvider, insightsProvider) {
            NavbarServiceProvider.setActiveItem('');

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });

