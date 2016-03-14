define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/services-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService', 'HotelService', 'ServicesService','DestinationService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, ServicesService, DestinationService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.name = "Hotel Detail Controller:";

            }]);
});