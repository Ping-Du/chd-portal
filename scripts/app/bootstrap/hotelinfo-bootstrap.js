define(['app/interceptors/http-interceptor',
        'app/controllers/language-controller',
        'app/controllers/header-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/hotel-main-controller',
        'app/controllers/hotel-top-controller',
        'app/controllers/hotel-detail-controller',
        'app/controllers/register-modal-controller','jquery.raty'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('hotel');
        }]);

        // config route
        modules.app.config(['$routeProvider',  'SessionServiceProvider', 'insightsProvider',function($routeProvider, SessionServiceProvider, insightsProvider){
            $routeProvider
                .when('/:hotelId/:languageId',{
                    templateUrl:'templates/hotel-detail-view.html',
                    controller:'HotelDetailController',
                    reloadOnSearch:true
                });

            insightsProvider.start(SessionServiceProvider.config().appInsightsKey);
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
