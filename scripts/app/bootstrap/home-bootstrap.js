define(['app/interceptors/security-interceptor',
        'app/controllers/session-controller',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/message-controller',
        'app/controllers/banner-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('home');
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
