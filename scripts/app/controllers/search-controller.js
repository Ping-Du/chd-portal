define(['app/services/search-service', 'app/utils', 'app/services/services-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("SearchController", ['$rootScope', '$scope',
            '$location', '$routeParams',  'SessionService', 'LanguageService', 'SearchService','localStorageService','ServicesService',
            function ($rootScope, $scope, $location, $routeParams, SessionService, LanguageService, SearchService, localStorageService, ServicesService) {

                //console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                //var searchResult = localStorageService.get('searchResult');
                $scope.results = localStorageService.get('searchResult');
                localStorageService.remove('searchResult');

                //console.log('keyword:'+$routeParams.keyword);

                $scope.destinations = [];
                $scope.hotels = [];
                $scope.activities = [];
                $scope.packages = [];
                $scope.tours = [];
                $scope.transportation = [];

                function load() {
                    //$scope.results = [];
                    $scope.destinations = [];
                    $scope.hotels = [];
                    $scope.activities = [];
                    $scope.packages = [];
                    if ($routeParams.keyword) {
                        SearchService.getSearchResultByKeyword($routeParams.keyword).then(function (data) {
                            populateData(data);
                        });
                    }
                }

                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                function populateData(data) {
                    //$scope.results = [];
                    $scope.destinations = [];
                    $scope.hotels = [];
                    $scope.activities = [];
                    $scope.packages = [];
                    $scope.tours = [];
                    $scope.transportation = [];

                    modules.angular.forEach(data, function(item, index){
                        if(item.ProductType == 'HTL') {
                            item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                            _.extend(item, {starClass:"icon-star-lg-" + item.StarRating * 10});
                        } else if(item.ProductType == 'OPT') {
                            item.DetailsURI = 'services.html#/' + getServiceType(item.ServiceType.Id) + '/' + item.ProductId + '/' + $scope.languageId;
                        } else if (item.ProductType == 'CTY') {
                            item.DetailsURI = 'destinations.html#/' + item.ProductId + '/' + $scope.languageId;
                            _.extend(item, {showName: 'City'});
                        } else if (item.ProductType == 'PKG') {
                            item.DetailsURI = 'packages.html#/' + item.ProductId + '/' + $scope.languageId;
                            //_.extend(item, {showName: 'Package'});
                        }
                        //$scope.results.push(item);

                        if(item.ProductType == 'CTY') {
                            $scope.destinations.push(item);
                        } else if(item.ProductType == 'HTL') {
                            $scope.hotels.push(item);
                        } else if(item.ProductType == 'OPT') {
                            var type = getServiceType(item.ServiceType.Id);
                            if(type == 'activities')
                                $scope.activities.push(item);
                            else if(type == 'tours') {
                                $scope.tours.push(item);
                            } else if(type == 'transportation') {
                                $scope.transportation.push(item);
                            }
                        } else if(item.ProductType == 'PKG') {
                            $scope.packages.push(item);
                        }
                    });

                }

                $scope.$on('SearchResult:Change', function(event, data){
                    populateData(data);
                });

                if(serviceTypes.length == 0) {
                    ServicesService.getServiceTypes().then(function(data){
                        var arrays = data.Activities.split(",");
                        var i;
                        for(i = 0; i < arrays.length; i++) {
                            serviceTypes.push({
                                id:arrays[i],
                                type:'activities'
                            });
                        }
                        arrays = data.Tours.split(",");
                        for(i = 0; i < arrays.length; i++) {
                            serviceTypes.push({
                                id:arrays[i],
                                type:'tours'
                            });
                        }
                        arrays = data.Transportation.split(",");
                        for(i = 0; i < arrays.length; i++) {
                            serviceTypes.push({
                                id:arrays[i],
                                type:'transportation'
                            });
                        }
                        init();
                    });
                } else {
                    init();
                }

                function init() {
                    if (!$scope.results)
                        load();
                    else
                        populateData($scope.results);
                }
            }]);

    return modules;
});



