define(['app/services/header-service', 'app/services/search-service', 'app/utils', 'app/services/services-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HeaderController', ['_', '$scope', 'HeaderService', '$location', 'SessionService', '$window', '$http', '$q', 'SearchService','$loading','localStorageService','$rootScope','$timeout','ServicesService',
            function (_, $scope, HeaderService, $location, SessionService, $window, $http, $q, SearchService, $loading, localStorageService, $rootScope, $timeout, ServicesService) {
                $scope.showLanguage = HeaderService.showLanguage;
                $scope.showAccount = HeaderService.showAccount;
                $scope.showSearchBox = HeaderService.showSearchBox;

                $scope.keyword = ($location.search().keyword ? $location.search().keyword : '');
                $scope.results = null;
                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();

                var isSearchPage = (($location.absUrl().indexOf('/search.html') > 0)?true:false);

                $scope.search = function () {
                    var word = $scope.keyword.Trim();
                    if (word != '' && !isSearchPage) {
                        localStorageService.remove('searchResult');
                        localStorageService.set('searchResult', $scope.results);
                        $window.location.href = $scope.webRoot + 'search.html#/' + $scope.languageId + '?keyword=' + word;
                    } else {
                        $rootScope.$broadcast("SearchResult:Change", $scope.results);
                        $scope.showSearchResult = false;
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
                    });
                }

                var httpCanceller;
                $scope.showSearchResult = false;
                //$scope.searchResultTemplateUrl = "templates/partials/search-result-popover.html";//"GuestsTemplate.html";
                $scope.onClick = function (e) {
                    //if(isSearchPage)
                    //    return;
                    $scope.showSearchResult = true;

                };

                function cancelHttpRequest() {
                    if (httpCanceller) {
                        console.log('cancelled');
                        httpCanceller.resolve();
                    }
                }

                function startSearech(keywords) {
                    $scope.searched = true;
                    $scope.showSearchResult = true;
                    cancelHttpRequest();
                    //$loading.start('search-loading');
                    httpCanceller = SearchService.searchForKeyword(keywords);
                    httpCanceller.promise.then(function (data) {
                        $loading.finish('search-loading');
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
                            } else if(item.ProductType == 'PKG') {
                                item.DetailsURI = 'packages.html#/' + item.ProductId + '/' + $scope.languageId;
                            }
                            $scope.results.push(item);

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
                    }, function (data) {
                        //$loading.finish('search-loading');
                    });
                }

                $scope.searched = false;
                $scope.destinations = [];
                $scope.hotels = [];
                $scope.activities = [];
                $scope.packages = [];
                $scope.tours = [];
                $scope.transportation = [];

                var timeoutPromise = null;

                $scope.$watch('keyword', function (newValue, oldValue, scope) {
                    //if(isSearchPage || newValue == oldValue)
                    if(newValue == oldValue)
                        return;

                    $scope.destinations = [];
                    $scope.hotels = [];
                    $scope.activities = [];
                    $scope.packages =[];
                    $scope.tours = [];
                    $scope.transportation = [];

                    if (newValue.length < 3) {
                        $scope.showSearchResult = true;
                        $scope.searched = false;
                        return;
                    }

                    if(timeoutPromise != null) {
                        $timeout.cancel(timeoutPromise);
                        timeoutPromise = null;
                    }
                    timeoutPromise = $timeout(function(){
                        timeoutPromise = null;
                        startSearech(newValue);
                    }, 500);

                });
            }]);
});
