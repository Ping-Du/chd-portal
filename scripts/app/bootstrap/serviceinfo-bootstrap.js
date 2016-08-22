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

        // config route
        modules.app.config(['$routeProvider',  'SessionServiceProvider', 'insightsProvider',function ($routeProvider, SessionServiceProvider,insightsProvider) {
            $routeProvider
                .when('/:serviceId/:languageId', {
                    templateUrl: 'templates/service-detail-view.html',
                    controller: 'ServiceDetailController'
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
