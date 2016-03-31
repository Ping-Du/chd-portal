define(['app/services/header-service', 'app/services/search-service', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HeaderController', ['_', '$scope', 'HeaderService', '$location', 'SessionService', '$window', '$http', '$q', 'SearchService',
            function (_, $scope, HeaderService, $location, SessionService, $window, $http, $q, SearchService) {
                $scope.showLanguage = HeaderService.showLanguage;
                $scope.showAccount = HeaderService.showAccount;
                $scope.showSearchBox = HeaderService.showSearchBox;

                $scope.keyword = ($location.search().keyword ? $location.search().keyword : '');
                $scope.results = null;
                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                var isSearchPage;

                if($location.search().keyword)
                    isSearchPage = true;
                else
                    isSearchPage = false;

                $scope.search = function () {
                    var word = $scope.keyword.Trim();
                    if (word != '') {
                        $window.location.href = $scope.webRoot + 'search.html#/' + $scope.languageId + '?keyword=' + word;
                    }
                };

                $scope.onKeyPressed = function (e) {
                    var keyCode = window.event ? e.keyCode : e.which;
                    if (keyCode == 13) {
                        $scope.search();
                    }
                };


                function load() {
                    $scope.results = [];
                    if ($scope.keyword) {
                        SearchService.getSearchResultByKeyword($routeParams.keyword).then(function (data) {
                            modules.angular.forEach(data, function (item, index) {
                                if (item.ProductType == 'HTL') {
                                    item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                    _.extend(item, {starClass: "icon-star-lg-" + item.StarRating * 10});
                                } else if (item.ProductType == 'OPT') {
                                    item.DetailsURI = 'services.html#/' + getServiceType(item.ServiceType.Id) + '/' + item.ProductId + '/' + $scope.languageId;
                                }
                                $scope.results.push(item);
                            });
                        });
                    }
                }

                var httpCanceller;
                $scope.showSearchResult = false;
                $scope.searchResultTemplateUrl = "templates/partials/search-result-popover.html";//"GuestsTemplate.html";

                $scope.onBlur = function (e) {
                    $scope.showSearchResult = false;
                };

                $scope.onClick = function (e) {
                    if(isSearchPage)
                        return;

                    if ($scope.keyword.length >= 2) {
                        $scope.showSearchResult = true;
                    }
                };

                function cancelHttpRequest() {
                    if (httpCanceller) {
                        console.log('cancelled');
                        httpCanceller.resolve();
                    }
                }

                $scope.$watch('keyword', function (newValue, oldValue, scope) {
                    if(isSearchPage)
                        return;

                    if (newValue.length < 2) {
                        $scope.showSearchResult = false;
                        return;
                    }

                    $scope.showSearchResult = true;
                    cancelHttpRequest();
                    httpCanceller = SearchService.searchForKeyword(newValue);
                    httpCanceller.promise.then(function (data) {
                        $scope.results = [];
                        _.each(data, function (item, index) {
                            if (item.ProductType == 'HTL') {
                                item.DetailsURI = 'hotels.html#/' + item.ProductId + '/' + $scope.languageId;
                                _.extend(item, {starClass: "icon-star-" + item.StarRating * 10, showName: 'Hotel'});
                            } else if (item.ProductType == 'OPT') {
                                item.DetailsURI = 'services.html#/' + getServiceType(item.ServiceType.Id) + '/' + item.ProductId + '/' + $scope.languageId;
                                _.extend(item, {showName: item.ServiceType.Name});
                            } else if (item.ProductType == 'CTY') {
                                item.DetailsURI = 'destinations.html#/' + item.ProductId + '/' + $scope.languageId;
                                _.extend(item, {showName: 'City'});
                            }
                            $scope.results.push(item);
                        });
                    }, function (data) {
                    });

                });
            }]);
});
