define(['app/services/search-service', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller("SearchController", ['$rootScope', '$scope',
            '$location', '$routeParams',  'SessionService', 'LanguageService', 'SearchService','localStorageService',
            function ($rootScope, $scope, $location, $routeParams, SessionService, LanguageService, SearchService, localStorageService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                //var searchResult = localStorageService.get('searchResult');
                $scope.results = localStorageService.get('searchResult');
                localStorageService.remove('searchResult');

                console.log('keyword:'+$routeParams.keyword);

                function load() {
                    $scope.results = [];
                    if ($routeParams.keyword) {
                        SearchService.getSearchResultByKeyword($routeParams.keyword).then(function (data) {
                            modules.angular.forEach(data, function(item, index){
                                if(item.ProductType == 'HTL') {
                                    item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                    _.extend(item, {starClass:"icon-star-lg-" + item.StarRating * 10});
                                } else if(item.ProductType == 'OPT') {
                                    item.DetailsURI = 'services.html#/' + getServiceType(item.ServiceType.Id) + '/' + item.ProductId + '/' + $scope.languageId;
                                } else if (item.ProductType == 'CTY') {
                                    item.DetailsURI = 'destinations.html#/' + item.ProductId + '/' + $scope.languageId;
                                    _.extend(item, {showName: 'City'});
                                }
                                $scope.results.push(item);
                            });
                        });
                    }
                }

                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                if(!$scope.results)
                    load();

            }]);

    return modules;
});



