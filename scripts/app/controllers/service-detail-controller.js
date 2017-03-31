define(['app/services/services-service',
    'app/services/destination-service',
    'app/services/language-service',
    'app/services/navbar-service',
    'app/directives/datepicker-directive',
    'app/controllers/consent-required-modal-controller',
    'app/controllers/warnings-modal-controller',
    'app/services/shopping-service',
    'jssor.slider',
    'stickup', 'app/utils'], function (modules) {
    'use strict';

    modules.controllers
        .controller('ServiceDetailController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'ServicesService', 'LanguageService', '$translate', '$window', '$cookieStore','$timeout','ShoppingService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, ServicesService, LanguageService, $translate, $window, $cookieStore, $timeout, ShoppingService) {

                console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.hideSearchBar = ($location.absUrl().indexOf("serviceinfo.html") >= 0);

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

                $scope.webRoot = SessionService.config().webRoot;
                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        $scope.load(true);
                    }
                });

                $scope.searchLocations = [];

                var criteria = $cookieStore.get('serviceCriteria');
                $scope.guests = criteria?criteria.guests:{Adults:'1', MinorAges:[]};
                $scope.guestsInfo = GetServiceGuestsInfo($scope.guests,$scope.languageId);
                $scope.startDate = criteria ? criteria.startDate : "";
                $scope.selectedLocation = criteria ? criteria.locationId : null;
                $scope.selectedLocationName = criteria ? criteria.locationName : '';
                $scope.selectedSearchLocation = null;

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

                $scope.availabilityFilter = '0';
                $scope.myFilter = function(v1, v2) {
                    if(v2 === '1')
                        return v1 === 'Available';
                    else if(v2 === '2')
                        return v1 === 'Requestable';
                    else if(v2 === '3')
                        return v1 !== 'NotAvailable';
                    else
                        return true;
                };

                $scope.myComparator = function(v1, v2) {
                    if(v1.AvailabilityLevel === v2.AvailabilityLevel) {
                        if(v1.Price === v2.Price)
                            return 0;
                        else if(v1.Price < v2.Price)
                            return -1;
                        else
                            return 1;
                    } else {
                        if(v1.AvailabilityLevel === 'Available')
                            return -1;
                        else if(v1.AvailabilityLevel === 'Requestable') {
                            if(v2.AvailabilityLevel === 'Available')
                                return 1;
                            else
                                return -1;
                        } else {
                            return 1;
                        }
                    }
                };

                $scope.showGuests = false;
                $scope.showGuests1 = false;
                $scope.guestsTemplateUrl = "templates/partials/guests-service-popover.html";//"GuestsTemplate.html";

                $scope.closeGuests = function () {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    $scope.showGuests = false;
                    $scope.showGuests1 = false;
                    $scope.guestsInfo = GetServiceGuestsInfo($scope.guests,$scope.languageId);
                };

                $scope.regexOption = {
                    regex: "[0-9]{1,2}"
                };

                $scope.addMinor = function() {
                    $scope.guests.Adults = modules.angular.element('#AdultQty').val();
                    if($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0) {
                        $scope.guests.Adults = '1';
                    }
                    $scope.guests.MinorAges.push('0');
                };

                $scope.deleteMinor = function(index) {
                    $scope.guests.MinorAges.splice(index, 1);
                };

                $scope.$watch('guests.Adults', function(newValue,oldValue, scope){
                    if(newValue.Trim() == ''|| parseInt(newValue) == 0) {
                        $scope.guests.MinorAges = [];
                    }
                });

                function doAdditionalProcess(serviceItem) {
                    var sliderImageData = [];
                    modules.angular.forEach(serviceItem.SliderImages, function (item, index) {
                        sliderImageData.push({
                            image: item.ImagePath,
                            thumb: item.ImagePath
                        });
                    });
                    if (sliderImageData.length > 0) {
                        initSlider(sliderImageData);
                    }
                    if (serviceItem.Latitude != 0 && serviceItem.Longitude != 0) {
                        $scope.showMap = false;
                        //$scope.showMap = true;
                        //initMap(serviceItem.Latitude, serviceItem.Longitude, serviceItem.Name);
                    }
                }

                $scope.detailTitle = (SessionService.languageId() == 'ENG'?'Details':'详细介绍');
                function setDetailTitle(data) {
                    _.each(data.AdditionalInformation, function(item, index){
                        if(item.Section == 'HDFULLDESC') {
                            $scope.detailTitle = item.Title;
                        }
                    });
                }

                $scope.serviceItem = null;
                $scope.showMap = false;

                $scope.scrollToControl = function(controlId) {
                    scrollToControl(''+controlId);
                };

                function prepareInformation() {
                    var i, j;
                    var parts = {};

                    parts['0'] = 'top';
                    parts["1"] = 'category';

                    // remove main info
                    for(i = 0; i < $scope.serviceItem.AdditionalInformation.length; i++) {
                        if($scope.serviceItem.AdditionalInformation[i].InformationId == $scope.serviceItem.MainInformation.InformationId) {
                            $scope.serviceItem.AdditionalInformation.splice(i, 1);
                        }
                    }

                    // remove duplicated info
                    if($scope.serviceItem.Warnings) {
                        for (i = 0; i < $scope.serviceItem.Warnings.length; i++) {
                            for (j = 0; j < $scope.serviceItem.AdditionalInformation.length; j++) {
                                if ($scope.serviceItem.Warnings[i].InformationId == $scope.serviceItem.AdditionalInformation[j].InformationId) {
                                    $scope.serviceItem.AdditionalInformation.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }

                    for(i = 0; i < $scope.serviceItem.AdditionalInformation.length; i++) {
                        parts[""+(i+2)] = "" + $scope.serviceItem.AdditionalInformation[i].InformationId;
                    }

                    parts[""+(2+$scope.serviceItem.AdditionalInformation.length)] = "term";
                    parts[""+(2+$scope.serviceItem.AdditionalInformation.length+1)] = "map";

                    $timeout(function() {
                        $('.detail-nav-wrap').stickUp({
                            parts: parts,
                            itemClass: 'menu-item',
                            itemHover: 'active'
                        });
                    }, 1000);
                }

                function loadService(reload) {
                    $scope.showNotAvailable = false;
                    ServicesService.getServiceDetail($routeParams.serviceId).then(function (data) {
                        $scope.serviceItem = data;
                        setDetailTitle(data);
                        $scope.selectedLocation = data.Location.Id;
                        $scope.selectedLocationName = data.Location.Name;
                        prepareInformation();
                        clearEmptyAddress(data.Address);
                        if (!reload)
                            doAdditionalProcess(data);
                    });
                }

                $scope.currentIndex = -1;
                $scope.closePrice = function() {
                    if($scope.currentIndex >= 0) {
                        $scope.showHidePrice($scope.currentIndex);
                    }
                };

                $scope.currentCategory = null;
                $scope.showHidePrice = function(index) {
                    $scope.currentCategory = null;
                    $scope.currentIndex = index;
                    for (var i = 0; i < $scope.serviceItem.AvailabilityCategories.length; i++) {
                        if (i == index)
                            continue;
                        else
                            $scope.serviceItem.AvailabilityCategories[i].showPrice = false;
                    }
                    $scope.serviceItem.AvailabilityCategories[index].showPrice = !$scope.serviceItem.AvailabilityCategories[index].showPrice;
                    $scope.currentCategory = $scope.serviceItem.AvailabilityCategories[index];
                };

                var searchAfterLogin = false;
                $scope.$on('LOGIN', function() {
                    if(searchAfterLogin) {
                        searchAfterLogin = false;
                        $scope.checkAvailability(true);
                    }
                });

                $scope.showNotAvailable = false;
                $scope.checkAvailability = function (reload) {
                    if (SessionService.user() == null) {
                        searchAfterLogin = true;
                        $rootScope.$broadcast("OpenLoginModal");
                        return;
                    }
                    if ($scope.guests.Adults.Trim() == '' || parseInt($scope.guests.Adults) == 0 ){
                        showError('GUESTS_REQUIRED');
                        return;
                    }

                    if ($scope.startDate == "") {
                        showError("START_DATE_REQUIRED");
                        return;
                    }

                    var startDate = Date.parse($scope.startDate.replace(/-/g, "/"));
                    var now = new Date();
                    if (startDate < now.getTime()) {
                        showError("Start date must be later than now!");
                        return;
                    }

                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    var param = {
                        ProductId: $routeParams.serviceId,
                        ServiceTime: null,
                        DestinationId: null,//$scope.selectedLocation,
                        LanguageId: $scope.languageId,
                        CategoryId: null,
                        ServiceType: null,
                        StartDate: $scope.startDate + 'T00:00:00.000Z',
                        Guests: GuestsToServiceCriteria($scope.guests)
                    };

                    function modifyAvailability(data) {
                        if(data.HasTransport) {
                            _.each(data.PickupPoints, function (pp) {
                                pp.ShowName = pp.Name;
                                if(pp.StartTime != '') {
                                    pp.ShowName = pp.Name + ' - ' + pp.StartTime;
                                    if(pp.EndTime != '') {
                                        pp.ShowName = pp.ShowName + ' to ' + pp.EndTime;
                                    }
                                }
                            });

                            _.each(data.DropoffPoints, function (pp) {
                                pp.ShowName = pp.Name;
                                if(pp.StartTime != '') {
                                    pp.ShowName = pp.Name + ' - ' + pp.StartTime;
                                    if(pp.EndTime != '') {
                                        pp.ShowName = pp.ShowName + ' to ' + pp.EndTime;
                                    }
                                }
                            });
                        }
                    }

                    $scope.showNotAvailable = false;
                    ServicesService.getAvailability(param).then(function (data) {
                        if (data.length > 0) {
                            $scope.serviceItem = data[0];
                            setDetailTitle(data[0]);
                            modifyAvailability(data[0]);
                            if($scope.serviceItem.AvailabilityCategories == null)
                                $scope.serviceItem.AvailabilityCategories = [];
                            if(data[0].AvailabilityCategories.length == 0) {
                                $scope.showNotAvailable = true;
                            }

                            prepareInformation();

                            clearEmptyAddress(data[0].Address);
                            if (!reload)
                                doAdditionalProcess(data[0]);

                            //angular.forEach($scope.serviceItem.AvailabilityCategories, function(item, index){
                            //    item.CancelInfo = null;
                            //});
                        }
                        if(reload) {
                            scrollToControl('category');
                        }
                    }, function () {
                        $scope.serviceItem.AvailabilityCategories = [];
                        $scope.showNotAvailable = true;
                    });

                };

                $scope.checkCancelInfo = function(index) {
                    var item = $scope.serviceItem.AvailabilityCategories[index];
                    ServicesService.getCancellationPolicies($scope.serviceItem.ProductId, item.Id,
                        $scope.serviceItem.StartDate).then(function(data){
                            $scope.serviceItem.AvailabilityCategories[index].CancelInfo = data;
                        });
                };

                $scope.load = function(reload) {

                    $cookieStore.put('serviceCriteria', {
                        locationId: $scope.selectedLocation,
                        locationName: $scope.selectedLocationName,
                        startDate: $scope.startDate,
                        guests: $scope.guests
                    });

                    if($scope.guests.Adults != '0' && $scope.guests.Adults != '' && $scope.startDate != '' && $scope.selectedLocation != null)
                        $scope.checkAvailability(reload);
                    else
                        loadService(reload);
                };

                function add(product, index) {
                    ShoppingService.addItem(product, index);
                    scrollToControl('header');
                    $rootScope.$broadcast('ShoppingCart:Animate');
                }

                $scope.addToShoppingCart = function (categoryIndex) {
                    if (SessionService.user() == null) {
                        $rootScope.$broadcast("OpenLoginModal");
                    } else {

                        if( $scope.serviceItem.Warnings.length > 0 || $scope.serviceItem.AvailabilityCategories[categoryIndex].Warnings.length > 0 ) {
                            $rootScope.$broadcast('Warnings:Open', $scope.serviceItem, categoryIndex);
                        } else if($scope.serviceItem.HasTransport || $scope.serviceItem.AvailabilityCategories[categoryIndex].AvailabilityLevel == "Requestable") {
                            $rootScope.$broadcast('ConsentRequired:Open', $scope.serviceItem, categoryIndex);
                        } else {
                            add($scope.serviceItem, categoryIndex);
                        }
                    }
                };

                $scope.$on('ConsentRequired:Confirmed', function(event, product, index){
                    add(product, index);
                });

                $scope.$on('Warnings:Confirmed', function(event, product, index){
                    if(product.HasTransport || product.AvailabilityCategories[index].AvailabilityLevel == "Requestable") {
                        $rootScope.$broadcast('ConsentRequired:Open', product, index);
                    } else {
                        add(product, index);
                    }
                });

                $scope.load(false);

                $window.scrollTo(0, 0);

            }]);

    return modules;
});
