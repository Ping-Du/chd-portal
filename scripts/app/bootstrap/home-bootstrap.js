define(['app/interceptors/security-interceptor',
        'app/controllers/session-controller',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/message-controller',
        'app/controllers/banner-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/destination-slider-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('home');
        }]);

        // config route
        //modules.app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
        //    $urlRouterProvider.otherwise("/CHI");
        //    $stateProvider
        //        .state('CHI', {
        //            url:'CHI',
        //            templateUrl:'templates/home1.html'
        //        })
        //        .state('ENG', {
        //            url:'ENG',
        //            templateUrl:'templates/home2.html'
        //        });
        //}]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
