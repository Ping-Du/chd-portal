define(['app/services/services-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$cookieStore',
            function (_, $rootScope, $scope, $location, SessionService, ServicesService, LanguageService, $translate, $cookieStore) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                function parseService(hash) {
                    var temp = hash.split('/');
                    if (temp.length >= 2 && temp[0] == '')
                        return temp[1];
                    else
                        return null;
                }

                var serviceType = parseService($location.path());
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.webRoot = SessionService.config().webRoot;

                var filter = $cookieStore.get(serviceType + 'Filter');

                function saveFilters() {
                    $cookieStore.put(serviceType + 'Filter', {
                        location: $scope.selectedLocation
                    });
                }

                $scope.selectedLocation = (filter?filter.location:null);
                $scope.locations = [];
                function fillLocations(value) {
                    if (!_.find($scope.locations, function (item) {
                            return item.Id == value.Id;
                        })) {
                        $scope.locations.push(value);
                    }
                }

                $scope.filterByLocation = function (id) {
                    $scope.selectedLocation = id;
                    saveFilters();
                    fillServices();
                };

                $scope.featuredServices = [];
                $scope.showServices = [];
                $scope.allServices = [];
                function fillServices() {
                    $scope.featuredServices = [];
                    $scope.showServices = [];
                    _.each($scope.allServices, function (item, key) {
                        var locationed = (item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        if(locationed) {
                            if(item.Featured)
                                $scope.featuredServices.push(item);
                            else
                                $scope.showServices.push(item);
                        }
                    });
                }

                function loadAllServices() {
                    ServicesService.getServiceByType(serviceType).then(function (data) {
                        $scope.allServices = data;
                        _.each($scope.allServices, function (item, index) {
                            //if(index % 2 == 0)
                            //    item.Featured = true;
                            item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                            fillLocations(item.Location);
                        });
                        fillServices();
                    }, function () {
                        $scope.allServices = [];
                    });
                }

                function load() {
                    loadAllServices();
                }

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();

            }]);
});
