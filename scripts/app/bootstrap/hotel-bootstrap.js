define(['app/interceptors/security-interceptor',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/hotel-controller',
        'app/controllers/hotel-detail-controller',
        'app/controllers/hotel-list-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['SessionServiceProvider', function(SessionServiceProvider){
            SessionServiceProvider.setReloadOnChangeLanguage(true);
        }]);
        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('hotel');
        }]);

        // config route
        modules.app.config(['$routeProvider', function($routeProvider){
            $routeProvider
                .when('/:languageId', {
                    templateUrl:'templates/hotel-view.html',
                    controller:'HotelController',
                    reloadOnSearch: true
                })
                .when('/:hotelId/:languageId',{
                    templateUrl:'templates/hotel-detail-view.html',
                    controller:'HotelDetailController',
                    reloadOnSearch: true
                })
                //.when('/destination/:destinationId/:languageId',{
                //    templateUrl:'templates/hotel-list-view.html',
                //    controller:'HotelListController',
                //    reloadOnSearch: false
                //})
                //.when('/destination/:destinationId/star/:star/:languageId',{
                //    templateUrl:'templates/hotel-list-view.html',
                //    controller:'HotelListController',
                //    reloadOnSearch: false
                //})
                .otherwise({
                    redirectTo: '/' + $.cookie('languageId')
                });
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
