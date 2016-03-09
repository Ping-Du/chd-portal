define(['app/interceptors/security-interceptor',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/message-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/home-controller'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('home');
        }]);

        // config route
        modules.app.config(['$routeProvider', 'SessionServiceProvider', function($routeProvider, SessionServiceProvider){
            $routeProvider
                .when('/:languageId', {
                    templateUrl:'templates/home-view.html',
                    controller:'HomeController'
                })
                //.when('/ENG',{
                //    templateUrl:'templates/home.html'
                //})
                .otherwise({
                    redirectTo: '/' + SessionServiceProvider.languageId() //$.cookie('languageId')
                });
        }]);

        // boot app
        modules.angular.bootstrap(document, [modules.app.name]);

    });
