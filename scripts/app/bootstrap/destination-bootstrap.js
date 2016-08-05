define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/register-modal-controller',
        'app/controllers/destination-main-controller',
        'app/controllers/destination-detail-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('destination');
        }]);

        // config route
        modules.app.config(['$routeProvider', 'SessionServiceProvider','insightsProvider',function($routeProvider, SessionServiceProvider, insightsProvider){
            $routeProvider
                .when('/:languageId', {
                    templateUrl:'templates/destination-main-view.html',
                    controller:'DestinationMainController',
                    reloadOnSearch:true
                })
                .when('/:destinationId/:languageId',{
                    templateUrl:'templates/destination-detail-view.html',
                    controller:'DestinationDetailController',
                    reloadOnSearch:true
                })
                .otherwise({
                    redirectTo: '/' + $.cookie('languageId')
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });

