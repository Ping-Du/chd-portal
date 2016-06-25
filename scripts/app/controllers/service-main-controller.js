define(['app/services/services-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/services/search-service',
    'app/directives/datepicker-directive', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceMainController', ['_', '$rootScope', '$scope', '$location', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$cookieStore', '$filter', '$timeout', 'SearchService', '$routeParams',
            function (_, $rootScope, $scope, $location, SessionService, ServicesService, LanguageService, $translate, $cookieStore, $filter, $timeout, SearchService, $routeParams) {

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
                //var serviceTypeId = getServiceType(serviceType, true);
                $rootScope.$broadcast('ServiceChanged', serviceType);
                $translate(modules.angular.uppercase(serviceType) + '_TITLE').then(function (data) {
                    $('title').text(data);
                });

                $scope.serviceType = modules.angular.uppercase(serviceType);
                $scope.imageName = getImageByServiceType(serviceType);

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                var criteria = $cookieStore.get('serviceCriteria');
                var servicesDestination = $cookieStore.get('forDestination');
                $cookieStore.remove('forDestination');
                $scope.guests = (criteria ? criteria.guests : {Adults: '2', MinorAges: []});
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests, $scope.languageId);
                $scope.startDate = (criteria ? criteria.startDate : ""); //servicesDestination?"":(criteria?criteria.startDate:"");
                $scope.selectedLocation = servicesDestination ? servicesDestination.ProductId : (criteria ? criteria.locationId : null);
                $scope.selectedLocationName = servicesDestination ? servicesDestination.Name : (criteria ? criteria.locationName : null);
                $scope.selectedSearchLocation = null;

                $scope.searchLocations = [];
                function loadSearchLocations() {
                    $scope.searchLocations = [];
                    var allItems = [];

                    SearchService.getLocations().then(function (data) {
                        //$scope.searchLocations = $filter('orderBy')(data, '+Name', false);
                        ServicesService.getServiceByType(serviceType).then(function (serviceList) {
                            allItems = data.concat(serviceList);
                            $scope.searchLocations = allItems; //$filter('orderBy')(allItems, '+Name', false);
                        });
                    });
                }

                $scope.showServiceDetailPage = function (serviceId) {
                    $location.url("/" + serviceType + '/' + serviceId + '/' + $scope.languageId, true);
                };

                $scope.filterByLocation = function (id) {
                    fillServices();
                };

                $scope.types = [];
                function fillTypes(value) {
                    if (!_.find($scope.types, function (item) {
                            return item.Id == value.Id;
                        })) {
                        _.extend(value, {
                            selected: true
                        });
                        $scope.types.push(value);
                    }
                }

                $scope.selectedType = null;
                $scope.showTypeFilter = true; //(serviceType == 'activities');
                $scope.filterByType = function (typeId) {
                    $scope.selectedType = typeId;
                    fillServices();
                };

                $scope.selectedPrice = null;
                $scope.prices = [];
                function fillPrices(price) {
                    var index = Math.floor(price / 100);
                    if (!_.find($scope.prices, function (item) {
                            return item.Id == index;
                        })) {
                        $scope.prices.push({
                            Id: index,
                            Name: (index == 0 ? '$0-$99' : '$' + index + '00-$' + index + '99')
                        });
                    }
                }

                $scope.filterByPrice = function (id) {
                    $scope.selectedPrice = id;
                    fillServices();
                };

                $scope.onlyAvailable = false;
                $scope.filterByAvailable = function () {
                    fillServices();
                };

                $scope.featuredServices = [];
                $scope.showServices = [];
                $scope.allServices = [];
                function fillServices() {
                    $scope.featuredServices = [];
                    $scope.showServices = [];
                    _.each($scope.allServices, function (item, key) {
                        // because location is not as same as the parameter sent: 'Los Angeles' got 'Long Beach'
                        var locationed = true; //(item.Location.Id == $scope.selectedLocation || $scope.selectedLocation == null);
                        var priced = ($scope.selectedPrice == null);
                        var available = ($scope.onlyAvailable == false);
                        var typed = (item.ServiceType.Id == $scope.selectedType || $scope.selectedType == null);
                        typed = _.find($scope.types, function (tp) {
                            return (tp.Id == item.ServiceType.Id && tp.selected);
                        });
                        if (!priced || !available) {
                            if (_.find(item.AvailabilityCategories, function (category) {
                                    if (!priced && !available)
                                        return ((Math.floor(category.Price / 100) == $scope.selectedPrice) && (category.AvailabilityLevel == "Available" || (category.AvailabilityLevel == "Requestable" && servicesDestination)));
                                    else if (!priced && available)
                                        return (Math.floor(category.Price / 100) == $scope.selectedPrice);
                                    else if (priced && !available) {
                                        return (category.AvailabilityLevel == "Available" || (category.AvailabilityLevel == "Requestable" && servicesDestination));
                                    } else
                                        return true;
                                })) {
                                priced = true;
                                available = true;
                            }
                        }
                        if (locationed && priced && available && typed) {
                            if (item.Featured)
                                $scope.featuredServices.push(item);
                            else
                                $scope.showServices.push(item);
                        }
                    });

                    $scope.sort();
                }

                function fillAllServices(data) {
                    $scope.allServices = [];
                    $scope.prices = [];
                    $scope.types = [];
                    _.each(data, function (item, index) {
                        if (getServiceType(item.ServiceType.Id) == serviceType) {
                            item.DetailsURI = 'services.html#/' + serviceType + '/' + item.ProductId + '/' + $scope.languageId;
                            //fillLocations(item.Location);
                            fillTypes(item.ServiceType);
                            $scope.allServices.push(item);
                        }

                        if (item.AvailabilityCategories) {
                            var minPrice = 0;
                            var maxPrice = 0;
                            _.each(item.AvailabilityCategories, function (category, index) {
                                fillPrices(category.Price);
                                if (category.Price < minPrice || minPrice == 0)
                                    minPrice = category.Price;
                                if (category.Price > maxPrice) {
                                    maxPrice = category.Price;
                                }
                            });
                            item.MinPrice = minPrice;
                            item.MaxPrice = maxPrice;
                            item.price = makePriceString(minPrice, maxPrice);
                        }
                    });
                }

                $scope.showTooltip = false;
                $scope.tooltips = "";

                function showError(message) {
                    $scope.tooltips = message;
                    $scope.showTooltip = true;
                    $timeout(function () {
                        $scope.tooltips = "";
                        $scope.showTooltip = false;
                    }, 5000);
                }

                $scope.showGuests = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-service-popover.html";//"GuestsTemplate.html";

                $scope.regexOption = {
                    regex: "[0-9]{1,2}"
                };

                $scope.addMinor = function () {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    if ($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0) {
                        $scope.guests.Adults = '1';
                    }
                    $scope.guests.MinorAges.push('0');
                };

                $scope.deleteMinor = function (index) {
                    $scope.guests.MinorAges.splice(index, 1);
                };

                $scope.$watch('guests.Adults', function (newValue, oldValue, scope) {
                    if (newValue.Trim() == '' || parseInt(newValue) == 0) {
                        $scope.guests.MinorAges = [];
                        $scope.guestsInfo = GetServiceGuestsInfo($scope.guests, $scope.languageId);
                    }
                });


                $scope.$watch('selectedSearchLocation', function (newVal, oldVal) {
                    if (newVal == oldVal)
                        return;

                    if (newVal) {

                        if (newVal.originalObject.ProductType == 'OPT')
                            $scope.showServiceDetailPage(newVal.originalObject.ProductId, newVal.originalObject.ServiceType.Id);
                        else {
                            $scope.selectedLocation = newVal.originalObject.ProductId;
                            $scope.selectedLocationName = newVal.originalObject.Name;
                            load(false);
                        }
                    }

                });

                $scope.closeGuests = function () {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    $scope.showGuests = false;
                    $scope.guestsInfo = GetServiceGuestsInfo($scope.guests, $scope.languageId);
                };

                function getParam(showTips) {
                    if ($scope.selectedSearchLocation === undefined) { // user delete location
                        $scope.selectedLocation = null;
                        $scope.selectedLocationName = '';
                    } else {
                        $scope.selectedLocation = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.ProductId : $scope.selectedLocation;
                        $scope.selectedLocationName = $scope.selectedSearchLocation ? $scope.selectedSearchLocation.originalObject.Name : $scope.selectedLocationName;
                    }

                    $scope.selectedPrice = null;

                    //check availability
                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    //if($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0 || $scope.startDate == '' ||  $scope.selectedLocation == null) {
                    //    loadAllServices();
                    //    fillServices();
                    //} else {

                    if ($scope.selectedLocation == null) {
                        if (showTips)
                            showError('SELECT_LOCATION');
                        return;
                    }

                    if ($scope.startDate == "") {
                        if (showTips)
                            showError("START_DATE_REQUIRED");
                        return;
                    }

                    var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                    var now = new Date();
                    if (startDate < now.getTime()) {
                        if (showTips)
                            showError("Start date must be later than now!");
                        return;
                    }

                    var param = {
                        ProductId: null,
                        ServiceTime: null,
                        DestinationId: $scope.selectedLocation,
                        LanguageId: $scope.languageId,
                        CategoryId: null,
                        ServiceType: getServiceId(serviceType),
                        StartDate: $scope.startDate + 'T00:00:00.000Z',
                        Guests: GuestsToServiceCriteria($scope.guests)
                    };

                    return param;
                }

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function () {
                    if (searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.searchServices();
                    }
                });

                function getAvailability(param) {
                    $scope.allServices = [];
                    $scope.showServices = [];
                    $scope.featuredServices = [];
                    //$loading.start('main');
                    ServicesService.getAvailability(param).then(function (data) {
                        fillAllServices(data);
                        fillServices();
                    }, function () {
                    });
                }

                $scope.searchServices = function () {
                    if (SessionService.user() == null) {
                        searchAfterLogin = true;
                        $rootScope.$broadcast("OpenLoginModal");
                        return;
                    }
                    var param = getParam(true);
                    if (param) {
                       getAvailability(param);
                    }
                };

                function loadAllServices(destinationId) {
                    if (destinationId) {
                        ServicesService.getServiceByTypeAndDestination(serviceType, destinationId).then(function (data) {
                            fillAllServices(data);
                            fillServices();
                        }, function () {
                            $scope.allServices = [];
                        });
                    } else {
                        ServicesService.getServiceByType(serviceType).then(function (data) {
                            fillAllServices(data);
                            fillServices();
                        }, function () {
                            $scope.allServices = [];
                        });
                    }
                }

                var services1, services2;

                function populate() {
                    $scope.selectedStar = null;
                    $scope.selectedType = null;
                    var all = null;
                    if (services1 && services2) {
                        all = [];
                        _.each(services1, function (item1, index) {
                            var find = _.find(services2, function (item2) {
                                return item2.ProductId == item1.ProductId;
                            });
                            if (find) {
                                all.push(find);
                            } else {
                                all.push(item1);
                            }
                        });
                        //all = services1.concat(services2);
                    } else if (services1) {
                        all = services1;
                    } else if (services2) {
                        all = services2;
                    }
                    services1 = null;
                    services2 = null;
                    fillAllServices(all);
                    fillServices();
                }

                $scope.sortReverse = false;
                $scope.sortBy = "Name";
                $scope.sort = function(sortBy) {
                    if(sortBy != undefined) {
                        if ($scope.sortBy == sortBy) {
                            $scope.sortReverse = !$scope.sortReverse;
                        } else {
                            $scope.sortBy = sortBy;
                            $scope.sortReverse = false;
                        }
                    }

                    $scope.featuredServices = $filter('orderBy')($scope.featuredServices, $scope.sortBy, $scope.sortReverse);
                    $scope.showServices = $filter('orderBy')($scope.showServices, $scope.sortBy, $scope.sortReverse);
                };

                function loadAll(location) {
                    ServicesService.getServiceByTypeAndDestination(serviceType, location).then(function (data1) {
                        services1 = data1;
                        var param = getParam(false);
                        if (param) {
                            ServicesService.getAvailability(param).then(function (data2) {
                                services2 = data2;
                                populate();
                            }, function () {
                                populate();
                            });
                        } else {
                            populate();
                        }
                    }, function () {
                        populate();
                    });
                }

                function load(loadLocations) {
                    if (loadLocations)
                        loadSearchLocations();

                    if (servicesDestination) {
                        loadAll(servicesDestination.ProductId);
                        servicesDestination = null;
                    } else {
                        if ($scope.guests.Adults != '0' && $scope.guests.Adults != '' && $scope.startDate != '' && $scope.selectedLocation != null)
                            //$scope.searchServices();
                            loadAll($scope.selectedLocation);
                        else
                            loadAllServices($scope.selectedLocation);
                    }
                }

                load(true);

            }]);
});
