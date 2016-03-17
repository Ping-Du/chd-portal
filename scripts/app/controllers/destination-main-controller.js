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

                    var featuredItems = [];
                    $scope.allItems = [];
                    function loadAllItems() {
                        $scope.allItems = [];
                        featuredItems = [];
                        DestinationService.getDestinationsByLanguageId().then(function (data) {
                            _.each(data, function (item, index) {
                                item.DetailsURI = 'destinations.html#/'+item.ProductId+'/'+$scope.languageId;
                                $scope.allItems.push(item);
                                if (item.Featured)
                                    featuredItems.push({
                                        url:item.DetailsURI,
                                        caption:item.Name,
                                        image:item.MainInformation.LargeImageURI
                                    });
                            });
                        }, function () {
                        });

                        if(featuredItems.length > 0) {
                            initSlider(featuredItems);
                        }
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

