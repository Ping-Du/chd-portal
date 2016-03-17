define(['app/services/search-service', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller("SearchController", ['$rootScope', '$scope',
            '$location', '$routeParams',  'SessionService', 'LanguageService', 'SearchService',
            function ($rootScope, $scope, $location, $routeParams, SessionService, LanguageService, SearchService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                $scope.results = null;

                console.log('keyword:'+$routeParams.keyword);

                function load() {
                    $scope.results = [];
                    if ($routeParams.keyword) {
                        SearchService.getSearchResultByKeyword($routeParams.keyword).then(function (data) {
                            modules.angular.forEach(data, function(item, index){
                                if(item.ProductType == 'HTL') {
                                    item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                } else {
                                    // TODO waiting for service type to be added
                                    item.DetailsURI = 'services.html#/' + getServiceType('') + '/' + item.ProductId + '/' + $scope.languageId;
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

                load();

            }]);

    return modules;
});



