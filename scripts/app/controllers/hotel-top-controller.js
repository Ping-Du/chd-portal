define(['app/services/hotel-service',
    'app/services/language-service',
    'app/services/destination-service',
    'app/services/navbar-service'
], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelTopController', ['_','$rootScope', '$scope', '$location', '$routeParams', '$cookieStore', 'SessionService',
            'HotelService', 'LanguageService', 'DestinationService',
            function (_, $rootScope, $scope, $location, $routeParams, $cookieStore, SessionService, HotelService, LanguageService, DestinationService){
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

                $scope.destinations = null;
                $scope.currentDestination = null;
                function loadDestinations() {
                    $scope.destinations = [];
                    $scope.currentDestination = null;
                    DestinationService.getTopDestinations().then(function(data){
                        if(data.length > 0) {
                            //$scope.currentDestination = data[0];
                            $scope.loadHotels(data[0]);
                        }
                        _.each(data, function(item){
                            $scope.destinations.push(item);
                        });
                    });
                }

                $scope.showHotelMainPage = function(){
                    $cookieStore.put('forDestination', {
                        ProductId:$scope.currentDestination.ProductId,
                        Name:$scope.currentDestination.Name
                    });
                    $location.url("/"+$scope.languageId, true);
                };

                $scope.hotels = null;
                $scope.loadHotels = function(destination) {
                    if(destination == $scope.currentDestination)
                        return;

                    $scope.hotels = [];
                    $scope.currentDestination = destination;
                    HotelService.getTopHotelsByDestinationId(destination.ProductId).then(function(data){
                        $scope.hotels = data; //_.first(data, 3);

                        _.each($scope.hotels, function(item){
                            item.DetailsURI = 'hotels.html#/'+item.ProductId+'/'+$scope.languageId;
                            item.starClass = "icon-star-" + (item.StarRating * 10);
                        });
                    });
                };

                function load(){
                    loadDestinations();
                }

               load();

            }]);
});
