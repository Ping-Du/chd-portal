define(['app/modules',
        'app/controllers/i18n-controller',
        'app/controllers/navbar-controller',
        'app/controllers/message-controller',
        'app/controllers/advertisement-controller'],
    function (modules) {
        'use strict';

        // config
        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('home');
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
