define(['app/services/language-service',
        'app/services/navbar-service',
        'jssor.slider',
        'app/services/destination-service'],
    function (modules) {
        'use strict';

        modules.controllers
            .controller('DestinationMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
                'LanguageService', '$translate', '$cookieStore', 'DestinationService',
                function (_, $rootScope, $scope, $location, SessionService, LanguageService, $translate, $cookieStore, DestinationService) {

                    console.info('path:' + $location.path());
                    var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                    if (languageId && languageId != SessionService.languageId()) {
                        $rootScope.$broadcast('RequireChangeLanguage', languageId);
                    }

                    $scope.webRoot = SessionService.config().webRoot;
                    $scope.languageId = SessionService.languageId();

                    $scope.showFeaturedDestinations = true;
                    var featuredItems = [];
                    $scope.allItems = [];
                    function loadAllItems() {
                        $scope.allItems = [];
                        featuredItems = [];
                        DestinationService.getDestinationsByLanguageId().then(function (data) {
                            _.each(data, function (item, index) {
                                item.DetailsURI = 'destinations.html#/'+item.ProductId+'/'+$scope.languageId;
                                if (item.Featured) {
                                    featuredItems.push({
                                        url: item.DetailsURI,
                                        caption: item.Name,
                                        image: item.MainInformation.LargeImageURI
                                    });
                                }// else {
                                    $scope.allItems.push(item);
                                //}
                            });

                            if(featuredItems.length > 0) {
                                $scope.showFeaturedDestinations = true;
                                initSlider(featuredItems);
                            } else {
                                $scope.showFeaturedDestinations = false;
                            }
                        }, function () {
                        });
                    }

                    function load() {
                        loadAllItems();
                    }

                    $scope.$on('LanguageChanged', function (event, data) {
                        if ($scope.languageId != data) {
                            $scope.languageId = data;
                            load();
                        }
                    });

                    load();

                }]);
    });

