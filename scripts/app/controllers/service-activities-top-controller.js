define(['app/services/services-service',
    'app/services/language-service',
    'app/services/destination-service',
    'app/services/navbar-service'
], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceActivitiesTopController', ['_','$rootScope', '$scope', '$location', '$routeParams', '$cookieStore', 'SessionService',
            'ServicesService', 'LanguageService', 'DestinationService', '$translate',
            function (_, $rootScope, $scope, $location, $routeParams, $cookieStore, SessionService, ServicesService, LanguageService, DestinationService, $translate){
                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                function parseService(hash) {
                    var temp = hash.split('/');
                    if (temp.length >= 2 && temp[0] == '')
                        return temp[1];
                    else
                        return null;
                }

                var serviceType = parseService($location.path());
                var serviceTypeId = getServiceType(serviceType, true);
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.destinations = null;
                $scope.currentDestination = null;
                function loadDestinations() {
                    $scope.destinations = [];
                    $scope.currentDestination = null;
                    DestinationService.getTopDestinations().then(function(data){
                        if(data.length > 0) {
                            //$scope.currentDestination = data[0];
                            $scope.loadActivities(data[0]);
                        }
                        _.each(data, function(item){
                            $scope.destinations.push(item);
                        });
                    });
                }

                $scope.showActivitiesMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentDestination.ProductId,
                        Name:$scope.currentDestination.Name
                    });
                    $location.url("/activities/"+$scope.languageId, true);
                };

                $scope.activities = null;
                $scope.loadActivities = function(destination) {
                    if(destination == $scope.currentDestination)
                        return;

                    $scope.hotels = [];
                    $scope.currentDestination = destination;
                    ServicesService.getTopActivitiesByDestinationId(destination.ProductId).then(function(data){
                        $scope.activities = _.first(data, 3);

                        _.each($scope.activities, function(item){
                            item.DetailsURI = 'services.html#/activities/'+item.ProductId+'/'+$scope.languageId;
                            //item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                function load(){
                    loadDestinations();
                }

                load();

            }]);
});
