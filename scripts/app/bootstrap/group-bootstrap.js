define(['app/interceptors/http-interceptor',
        'app/controllers/header-controller',
        'app/controllers/language-controller',
        'app/controllers/navbar-controller',
        'app/controllers/message-controller',
        'app/controllers/account-controller',
        'app/controllers/login-modal-controller',
        'app/controllers/change-password-modal-controller',
        'app/controllers/register-modal-controller',
        'app/controllers/group-controller', 'jquery.spinner', 'jquery.raty'],
    function (modules) {
        'use strict';

        modules.app.config(['NavbarServiceProvider', function (NavbarServiceProvider) {
            NavbarServiceProvider.setActiveItem('group');
        }]);

        // config route
        modules.app.config(['$routeProvider', 'SessionServiceProvider', function($routeProvider, SessionServiceProvider){
            console.log('user:' + SessionServiceProvider.user() + ' languageId:'+ SessionServiceProvider.languageId());
            $routeProvider
                .when('/:languageId', {
                    templateUrl:'templates/group-view.html',
                    controller:'GroupController'
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
