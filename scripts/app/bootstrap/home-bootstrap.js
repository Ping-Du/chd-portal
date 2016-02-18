define(['angular', 'app/common/common-controller',
        'app/message/message-controller',
        'app/advertisement/advertisement-controller'],
    function (angular,
              common,
              message,
              advertisement) {
        'use strict';

        var app = angular.module('chdApp', [common.name, message.name, advertisement.name]);

        // config
        app.config(['navbarServiceProvider', function (navbarServiceProvider) {
            navbarServiceProvider.setActiveItem('home');
        }]);

        // boot app
        angular.bootstrap(document, [app.name]);

    });
