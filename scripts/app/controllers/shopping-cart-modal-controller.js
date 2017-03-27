define(['app/services/account-service', 'app/services/message-service', 'app/services/shopping-service', 'sweetalert', 'app/utils'], function (modules) {
    'use strict';
    modules.controllers
        .controller('ShoppingCartModalController', ['$scope', '$uibModal', 'ShoppingService',
            function ($scope, $uibModal, ShoppingService) {

                $scope.$on('ShoppingCart:Add', function (event, product, index) {
                    ShoppingService.addItem(product, index);
                });

                $scope.open = function (products) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'ShoppingCartModal.html',
                        controller: 'ShoppingCartModalInstanceController',
                        backdrop: 'static',
                        size: 'lg'
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });
                };

                $scope.$on('ShoppingCart:Open', function (event) {
                    $scope.open();
                });
            }])
        .controller('ShoppingCartModalInstanceController', ['_', '$rootScope', '$scope', '$uibModalInstance', '$translate', 'ShoppingService', '$window', 'AccountService', 'SessionService', '$timeout', 'MessageService',
            function (_, $rootScope, $scope, $uibModalInstance, $translate, ShoppingService, $window, AccountService, SessionService, $timeout, MessageService) {

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.shoppingItems = ShoppingService.getItems();

                $scope.getNumber = function (num) {
                    return new Array(num);
                };

                $scope.bookingInfo = {
                    TripId: 0,
                    Reference: '',
                    PrimaryGuestName: '',
                    Guests: [],
                    PaymentInfo: {
                        ProfileId: null,
                        PaymentRequired: false,
                        PaymentMethod: '',
                        CreditCardInfo: {
                            CardNumber: '',
                            ExpirationMonth: 0,
                            ExpirationYear: 0,
                            CardCode: ''
                        },
                        BankAccountInfo: {
                            BankAccountNumber: '',
                            NameOnAccount: '',
                            RoutingNumber: ''
                        },
                        SaveInProfile: false
                    },
                    Hotels: [],
                    Services: [],
                    Packages: [],
                    Adults: 0,
                    Minors: 0,
                    HotelPrice: 0,
                    ServicePrice: 0,
                    PackagePrice: 0,
                    SaveType: 'Reservation',
                    paymentProfile: 'new'
                };

                function addEmptyGuest(guestId, primaryGuest, age, adult) {
                    $scope.bookingInfo.Guests.push({
                        GuestId: guestId,
                        FirstName: '',
                        LastName: '',
                        Title: '',
                        Phone: '',
                        Age: '' + age,
                        PrimaryGuest: primaryGuest,
                        Adult: adult,
                        ShowName: '',
                        deletable: true
                    });
                }

                var maxGuests = 0;
                var maxStartPos = 0;

                function setMinimumGuest(qty, startPos) {
                    if (qty < maxGuests)
                        return;

                    maxGuests = qty;
                    maxStartPos = startPos;

                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        if (i >= startPos && i < startPos + qty)
                            $scope.bookingInfo.Guests[i].deletable = false;
                        else
                            $scope.bookingInfo.Guests[i].deletable = true;
                    }
                }

                var adultStr = (SessionService.languageId() == "CHI") ? ' 成人 ' : ' adult(s) ';
                var childStr = (SessionService.languageId() == "CHI") ? ' 儿童 ' : ' minor(s) ';

                function calculateInfo() {
                    $scope.bookingInfo.Guests = [];
                    $scope.bookingInfo.Hotels = [];
                    $scope.bookingInfo.Services = [];
                    $scope.bookingInfo.Packages = [];
                    var i, j, k;

                    var productGuests = 0;
                    var startPos = 0;
                    for (i = 0; i < $scope.shoppingItems.hotels.length; i++) {
                        var hotel = $scope.shoppingItems.hotels[i].product;
                        var index = $scope.shoppingItems.hotels[i].index;
                        var category = hotel.AvailabilityCategories[index];
                        var guestId = $scope.bookingInfo.Guests.length + 1;
                        if (category.PaymentRequired) {
                            $scope.bookingInfo.PaymentInfo.PaymentMethod = 'CreditCard';
                            $scope.bookingInfo.PaymentInfo.PaymentRequired = true;
                        }

                        $scope.bookingInfo.Hotels.push({
                            RatePlanId: category.RatePlan.Id,
                            Nights: 0,
                            TripItemId: 0,
                            ProductType: hotel.ProductType,
                            ProductId: hotel.ProductId,
                            HotelName: hotel.Name,
                            CategoryId: category.Id,
                            CategoryName: category.Name,
                            StartDate: hotel.StartDate,
                            Note: '',
                            AvailabilityLevel: category.AvailabilityLevel,
                            Price: category.Price,
                            Rooms: [],
                            Supplements:[],
                            ConnectionId:category.ConnectionId,
                            ProductMappingId:category.ProductMappingId
                        });
                        productGuests = 0;
                        startPos = $scope.bookingInfo.Guests.length;
                        for (j = 0; j < category.Rooms.length; j++) {
                            var room = category.Rooms[j];
                            productGuests += room.Guests.length;
                            $scope.bookingInfo.Hotels[i].Nights = room.Nights.length;
                            $scope.bookingInfo.HotelPrice += room.Price;
                            $scope.bookingInfo.Hotels[i].Rooms.push({
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: 0
                                },
                                Price: room.Price,
                                Supplements:room.Supplements,
                                SupplierData:room.SupplierData,
                                Beds:room.Beds
                            });

                            $scope.bookingInfo.Hotels[i].Supplements = $scope.bookingInfo.Hotels[i].Supplements.concat(room.Supplements);
                            angular.forEach(room.Nights, function(val, key){
                                $scope.bookingInfo.Hotels[i].Supplements = $scope.bookingInfo.Hotels[i].Supplements.concat(val.Supplements);
                            });

                            var adults = 0, minors = 0;
                            for (k = 0; k < room.Guests.length; k++) {
                                $scope.bookingInfo.Hotels[i].Supplements = $scope.bookingInfo.Hotels[i].Supplements.concat(room.Guests[k].Supplements);
                                if (room.Guests[k].Type == 'ADULT' && room.Guests[k].Age == null) {
                                    adults++;
                                    //if (i == 0) {
                                    addEmptyGuest(guestId, (k + 1) == room.PrimaryGuestId, room.Guests[k].Age, true);
                                    //}
                                    $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                    if (k == 0)
                                        $scope.bookingInfo.Hotels[i].Rooms[j].Guests.PrimaryGuestId = guestId;
                                    guestId++;

                                }
                                else {
                                    minors++;
                                    //if (i == 0) {
                                    addEmptyGuest(guestId, false, room.Guests[k].Age, false);
                                    //}
                                    $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                    guestId++;
                                    //}
                                }
                            }
                            room.guestsInfo = adults + adultStr + (minors > 0 ? minors + childStr : '');
                        }
                        setMinimumGuest(productGuests, startPos);
                    }

                    for (i = 0; i < $scope.shoppingItems.services.length; i++) {
                        var service = $scope.shoppingItems.services[i].product;
                        var serviceIndex = $scope.shoppingItems.services[i].index;
                        var serviceCategory = service.AvailabilityCategories[serviceIndex];
                        var serviceGuestId = $scope.bookingInfo.Guests.length + 1;
                        $scope.bookingInfo.ServicePrice += serviceCategory.Price;

                        var pickUpPoint = null;
                        var dropOffPoint = null;

                        if (serviceCategory.PaymentRequired) {
                            $scope.bookingInfo.PaymentInfo.PaymentMethod = 'CreditCard';
                            $scope.bookingInfo.PaymentInfo.PaymentRequired = true;
                        }

                        var pickUpShowName = '';
                        for (k = 0; k < service.PickupPoints.length; k++) {
                            if (service.PickupPoints[k].LocationId == service.PickupPoint) {
                                pickUpPoint = {
                                    LocationType: service.PickupPoints[k].LocationType,
                                    LocationId: service.PickupPoint,
                                    Time: ''
                                };
                                pickUpShowName = service.PickupPoints[k].ShowName;
                                break;
                            }
                        }

                        var dropOffShowName = '';
                        for (k = 0; k < service.DropoffPoints.length; k++) {
                            if (service.DropoffPoints[k].LocationId == service.DropoffPoint) {
                                dropOffPoint = {
                                    LocationType: service.DropoffPoints[k].LocationType,
                                    LocationId: service.DropoffPoint,
                                    Time: ''
                                };
                                dropOffShowName = service.DropoffPoints[k].ShowName;
                                break;
                            }
                        }

                        $scope.bookingInfo.Services.push({
                            ServiceTime: serviceCategory.ServiceTime,
                            PickupPoint: pickUpPoint, //service.PickupPoint,
                            PickupShowName: pickUpShowName,
                            DropoffPoint: dropOffPoint, //service.DropoffPoint,
                            DropoffShowName: dropOffShowName,
                            TripItemId: 0,
                            ProductType: service.ProductType,
                            ProductId: service.ProductId,
                            ServiceName: service.Name,
                            CategoryId: serviceCategory.Id,
                            CategoryName: serviceCategory.Name,
                            StartDate: service.StartDate,
                            Note: '',
                            AvailabilityLevel: serviceCategory.AvailabilityLevel,
                            Price: serviceCategory.Price,
                            ConnectionId:serviceCategory.ConnectionId,
                            ProductMappingId:serviceCategory.ProductMappingId,
                            Guests: {
                                GuestIds: [],
                                PrimaryGuestId: serviceGuestId
                            }
                        });
                        var serviceAdults = 0, serviceMinors = 0;

                        productGuests = serviceCategory.Guests.length;
                        startPos = $scope.bookingInfo.Guests.length;
                        for (j = 0; j < serviceCategory.Guests.length; j++) {
                            var guest = serviceCategory.Guests[j];
                            //$scope.bookingInfo.Services[i].Guests.GuestIds.push(j+1);
                            if (guest.Type == 'ADULT' && guest.Age == null) {
                                serviceAdults++;
                                //if (i == 0) {
                                addEmptyGuest(serviceGuestId, j == 0, guest.Age, true);
                                $scope.bookingInfo.Services[i].Guests.GuestIds.push(serviceGuestId);
                                if (j == 0)
                                    $scope.bookingInfo.Services[i].Guests.PrimaryGuestId = serviceGuestId;
                                serviceGuestId++;
                                //}
                            }
                            else {
                                serviceMinors++;
                                //if (i == 0) {
                                addEmptyGuest(serviceGuestId, false, guest.Age, false);
                                $scope.bookingInfo.Services[i].Guests.GuestIds.push(serviceGuestId);
                                serviceGuestId++;
                                //}
                            }
                            serviceCategory.guestsInfo = serviceAdults + adultStr + (serviceMinors > 0 ? serviceMinors + childStr : '');
                        }
                        setMinimumGuest(productGuests, startPos);
                    }

                    for (i = 0; i < $scope.shoppingItems.packages.length; i++) {
                        var pkg = $scope.shoppingItems.packages[i].product;
                        var index = $scope.shoppingItems.packages[i].index;
                        var category = pkg.AvailabilityCategories[index];
                        var packageGuestId = $scope.bookingInfo.Guests.length + 1;
                        $scope.bookingInfo.PackagePrice += category.Price;
                        if (category.PaymentRequired) {
                            $scope.bookingInfo.PaymentInfo.PaymentMethod = 'CreditCard';
                            $scope.bookingInfo.PaymentInfo.PaymentRequired = true;
                        }

                        $scope.bookingInfo.Packages.push({
                            TripItemId: 0,
                            ProductType: pkg.ProductType,
                            ProductId: pkg.ProductId,
                            Name: pkg.Name,
                            CategoryId: category.Id,
                            CategoryName: category.Name,
                            EndDate: category.EndDate,
                            StartDate: category.StartDate,
                            Note: '',
                            AvailabilityLevel: category.AvailabilityLevel,
                            Price: category.Price,
                            Rooms: [],
                            TransportationServices: [],
                            Nights: category.Nights,
                            ConnectionId:category.ConnectionId,
                            ProductMappingId:category.ProductMappingId
                        });
                        for (j = 0; j < category.Services.length; j++) {
                            $scope.bookingInfo.Packages[i].TransportationServices.push({
                                //Sequence:(j+1),
                                //ServiceTime:null,
                                //TripItemId:null,
                                Note: '',
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: packageGuestId
                                },
                                ProductType: category.Services[j].ProductType,
                                ProductId: category.Services[j].ProductId,
                                CategoryId: category.Services[j].Category.Id,
                                PickupPoint: category.Services[j].PickupPoint,
                                DropoffPoint: category.Services[j].DropoffPoint,
                                AvailabilityLevel: category.Services[j].AvailabilityLevel,
                                StartDate: category.Services[j].StartDate
                            });
                        }
                        productGuests = 0;
                        startPos = $scope.bookingInfo.Guests.length;
                        for (j = 0; j < category.Rooms.length; j++) {
                            var room = category.Rooms[j];
                            productGuests += room.Guests.length;
                            $scope.bookingInfo.Packages[i].Rooms.push({
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: packageGuestId
                                },
                                Price: room.Price
                            });
                            var adults = 0, minors = 0;
                            for (k = 0; k < room.Guests.length; k++) {
                                if (room.Guests[k].Type == 'ADULT' && room.Guests[k].Age == null) {
                                    adults++;
                                    //if (i == 0) {
                                    addEmptyGuest(packageGuestId, (k + 1) == room.PrimaryGuestId, room.Guests[k].Age, true);
                                    //}
                                    $scope.bookingInfo.Packages[i].Rooms[j].Guests.GuestIds.push(packageGuestId);
                                    if (k == 0)
                                        $scope.bookingInfo.Packages[i].Rooms[j].Guests.PrimaryGuestId = packageGuestId;
                                    packageGuestId++;

                                }
                                else {
                                    minors++;
                                    //if (i == 0) {
                                    addEmptyGuest(packageGuestId, false, room.Guests[k].Age, false);
                                    //}
                                    $scope.bookingInfo.Packages[i].Rooms[j].Guests.GuestIds.push(packageGuestId);
                                    packageGuestId++;
                                    //}
                                }
                            }
                            category.guestsInfo = adults + adultStr + (minors > 0 ? minors + childStr : '');

                        }
                        setMinimumGuest(productGuests, startPos);
                    }
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.removeHotel = function (index) {
                    ShoppingService.removeItem('HTL', index);
                    calculateInfo();
                    setButtons();
                };

                $scope.removeService = function (index) {
                    ShoppingService.removeItem('OPT', index);
                    calculateInfo();
                    setButtons();
                };

                $scope.removePackage = function (index) {
                    ShoppingService.removeItem('PKG', index);
                    calculateInfo();
                    setButtons();
                };

                $scope.activeTabIndex = 0;
                $scope.showPreviousBtn = false;
                $scope.showNextBtn = false;

                function setButtons() {
                    $scope.showPreviousBtn = ($scope.activeTabIndex > 0);
                    $scope.showNextBtn = ($scope.activeTabIndex < 4 && ($scope.bookingInfo.Hotels.length > 0 || $scope.bookingInfo.Services.length > 0 || $scope.bookingInfo.Packages.length > 0));
                    _.each($scope.tabs, function (item, index) {
                    });
                }

                calculateInfo();
                setButtons();

                $scope.tabs = [
                    {active: true, disabled: false},
                    {active: false, disabled: false},
                    {active: false, disabled: false},
                    {active: false, disabled: false},
                    {active: false, disabled: false}
                ];

                function calShowName() {
                    var maxGuestsAllowed = 99;
                    var validateResult = true;
                    var firstGuest = true;

                    $scope.bookingInfo.Adults = 0;
                    $scope.bookingInfo.Minors = 0;
                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        if (g.PrimaryGuest) {
                            if (firstGuest) {
                                firstGuest = false;
                                $scope.bookingInfo.PrimaryGuestName = g.LastName + ' ' + g.FirstName;
                            }
                            g.ShowName = '#' + g.GuestId + ' * ' + g.LastName + ' ' + g.FirstName;
                            if (g.LastName == '' || g.FirstName == '')
                                validateResult = false;
                        }
                        else
                            g.ShowName = g.LastName + ' ' + g.FirstName;
                        if (g.ShowName.Trim() == '') {
                            if (g.Adult) {
                                g.ShowName = '#' + g.GuestId + ' Adult';
                            } else {
                                g.ShowName = '#' + g.GuestId + ' Minor Age ' + g.Age;
                            }
                        }
                        if (g.Adult)
                            $scope.bookingInfo.Adults++;
                        else
                            $scope.bookingInfo.Minors++;
                    }

                    if($scope.bookingInfo.Guests.length > maxGuestsAllowed)
                        return false;
                    else
                        return validateResult;
                }

                function reCalculateGuestId(index) {
                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        $scope.bookingInfo.Guests[i].GuestId = i + 1;
                    }
                }

                $scope.addGuest = function (adult) {
                    addEmptyGuest($scope.bookingInfo.Guests.length + 1, false, 0, adult);
                };

                $scope.removeGuest = function (index) {
                    $scope.bookingInfo.Guests.splice(index, 1);
                    reCalculateGuestId(index);
                };

                $scope.changePrimaryGuest = function (guests) {
                    guests.GuestIds[0] = guests.PrimaryGuestId;
                };

                $scope.selectTab = function (tabIndex) {
                    var i = 0;
                    var count;
                    if (tabIndex > $scope.activeTabIndex) {
                        count = tabIndex - $scope.activeTabIndex;
                        for (i = 0; i < count; i++) {
                            if (!$scope.next()) {
                                //$scope.tabs[$scope.activeTabIndex].active = true;
                                //$scope.tabs[tabIndex].active = false;
                                $timeout(function () {
                                    $scope.tabs[$scope.activeTabIndex].active = true;
                                    $scope.tabs[tabIndex].active = false;
                                }, 500);
                                return;
                            }
                        }
                    } else if (tabIndex < $scope.activeTabIndex) {
                        count = $scope.activeTabIndex - tabIndex;
                        for (i = 0; i < count; i++) {
                            $scope.previous();
                        }
                    }
                };

                $scope.previous = function () {
                    if ($scope.activeTabIndex == 1) {
                        calShowName();
                    }
                    $scope.message = '';
                    //$scope.tabs[$scope.activeTabIndex].disabled = true;
                    $scope.tabs[$scope.activeTabIndex].active = false;
                    $scope.activeTabIndex = $scope.activeTabIndex - 1;
                    //$scope.tabs[$scope.activeTabIndex].disabled = false;
                    $scope.tabs[$scope.activeTabIndex].active = true;
                    setButtons();
                };

                $scope.next = function () {
                    if ($scope.activeTabIndex == 1) {
                        if (!calShowName()) {
                            translate('FILL_LEADS');
                            return false;
                        }
                    }
                    if ($scope.activeTabIndex == 2) {
                        if (!checkGuestAssignment()) {
                            translate('ASSIGN_GUESTS');
                            return false;
                        }
                    }


                    $scope.message = '';
                    //$scope.tabs[$scope.activeTabIndex].disabled = true;
                    $scope.tabs[$scope.activeTabIndex].active = false;
                    $scope.activeTabIndex = $scope.activeTabIndex + 1;
                    //$scope.tabs[$scope.activeTabIndex].disabled = false;
                    $scope.tabs[$scope.activeTabIndex].active = true;
                    //if($scope.tabs.length > $scope.activeTabIndex + 1) {
                    //    $scope.tabs[$scope.activeTabIndex+1].disabled = false;
                    //}
                    setButtons();
                    return true;
                };

                $scope.message = '';
                $scope.bookDisabled = false;

                function checkGuestsForOneProduct(guests) {
                    var g = _.uniq(guests);
                    if(g.length != guests.length)
                        return false;
                    else
                        return true;
                }

                var assignedGuests = [];
                function checkGuestAssignment() {
                    var i, j, k;

                    assignedGuests = [];
                    var total = $scope.bookingInfo.Guests.length;
                    var primaryOk = false;
                    for (i = 0; i < $scope.bookingInfo.Hotels.length; i++) {
                        var hotel = $scope.bookingInfo.Hotels[i];
                        for (j = 0; j < hotel.Rooms.length; j++) {
                            primaryOk = false;
                            if(!checkGuestsForOneProduct(hotel.Rooms[j].Guests.GuestIds))
                                return false;
                            assignedGuests = _.union(assignedGuests, hotel.Rooms[j].Guests.GuestIds);
                            for (k = 0; k < hotel.Rooms[j].Guests.GuestIds.length; k++) {
                                if (hotel.Rooms[j].Guests.GuestIds[k] == 0 || hotel.Rooms[j].Guests.GuestIds[k] > total) {
                                    return false;
                                }
                                if (hotel.Rooms[j].Guests.GuestIds[k] == hotel.Rooms[j].Guests.PrimaryGuestId) {
                                    if ($scope.bookingInfo.Guests[hotel.Rooms[j].Guests.PrimaryGuestId - 1].FirstName != '' && $scope.bookingInfo.Guests[hotel.Rooms[j].Guests.PrimaryGuestId - 1].LastName != '')
                                        primaryOk = true;
                                }
                            }
                            if (!primaryOk) {
                                return false;
                            }
                        }
                    }


                    for (i = 0; i < $scope.bookingInfo.Services.length; i++) {
                        var service = $scope.bookingInfo.Services[i];
                        primaryOk = false;
                        if(!checkGuestsForOneProduct(service.Guests.GuestIds))
                            return false;
                        assignedGuests = _.union(assignedGuests, service.Guests.GuestIds);
                        for (j = 0; j < service.Guests.GuestIds.length; j++) {
                            if (service.Guests.GuestIds[j] == 0 || service.Guests.GuestIds[j] > total)
                                return false;
                            if (service.Guests.PrimaryGuestId == service.Guests.GuestIds[j]) {
                                if ($scope.bookingInfo.Guests[service.Guests.PrimaryGuestId - 1].FirstName != '' && $scope.bookingInfo.Guests[service.Guests.PrimaryGuestId - 1].LastName != '')
                                    primaryOk = true;
                            }
                        }
                        if (!primaryOk)
                            return false;
                    }

                    for (i = 0; i < $scope.bookingInfo.Packages.length; i++) {
                        var pkg = $scope.bookingInfo.Packages[i];
                        for (j = 0; j < pkg.Rooms.length; j++) {
                            primaryOk = false;
                            if(!checkGuestsForOneProduct(pkg.Rooms[j].Guests.GuestIds))
                                return false;
                            assignedGuests = _.union(assignedGuests, pkg.Rooms[j].Guests.GuestIds);
                            for (k = 0; k < pkg.Rooms[j].Guests.GuestIds.length; k++) {
                                if (pkg.Rooms[j].Guests.GuestIds[k] == 0 || pkg.Rooms[j].Guests.GuestIds[k] > total) {
                                    return false;
                                }
                                if (pkg.Rooms[j].Guests.GuestIds[k] == pkg.Rooms[j].Guests.PrimaryGuestId) {
                                    if ($scope.bookingInfo.Guests[pkg.Rooms[j].Guests.PrimaryGuestId - 1].FirstName != '' && $scope.bookingInfo.Guests[pkg.Rooms[j].Guests.PrimaryGuestId - 1].LastName != '')
                                        primaryOk = true;
                                }
                            }
                            if (!primaryOk) {
                                return false;
                            }
                        }
                    }

                    if(assignedGuests.length != $scope.bookingInfo.Guests.length)
                        return false;

                    return true;
                }


                //$scope.selectedProfile = null;
                function getBookParam(paymentIncluded) {
                    var param = {
                        TripId: $scope.bookingInfo.TripId,
                        Reference: $scope.bookingInfo.Reference,
                        PrimaryGuestName: $scope.bookingInfo.PrimaryGuestName,
                        Guests: [],
                        PaymentInfo: null,
                        Hotels: [],
                        Services: [],
                        Packages: []
                    };
                    var i, j;
                    var hasPrimaryGuest = false;
                    for (i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        param.Guests.push({
                            GuestId: g.GuestId,
                            FirstName: g.FirstName,
                            LastName: g.LastName,
                            Title: g.Title,
                            Phone: g.Phone,
                            Age: (g.Adult ? null : parseInt(g.Age)),
                            PrimaryGuest: (g.PrimaryGuest && !hasPrimaryGuest)
                        });
                        if (g.PrimaryGuest && !hasPrimaryGuest) {
                            hasPrimaryGuest = true;
                        }
                    }
                    for (i = 0; i < $scope.bookingInfo.Hotels.length; i++) {
                        var h = $scope.bookingInfo.Hotels[i];
                        param.Hotels.push({
                            RatePlanId: h.RatePlanId,
                            Nights: h.Nights,
                            // TripItemId: (h.TripItemId==0?null: h.TripItemId),
                            ProductType: h.ProductType,
                            ProductId: h.ProductId,
                            CategoryId: h.CategoryId,
                            StartDate: h.StartDate,
                            Note: h.Note,
                            AvailabilityLevel: h.AvailabilityLevel,
                            Price: h.Price,
                            Rooms: h.Rooms,
                            Supplements: h.Supplements,
                            ConnectionId:h.ConnectionId,
                            ProductMappingId:h.ProductMappingId
                        });

                    }
                    for (i = 0; i < $scope.bookingInfo.Services.length; i++) {
                        var s = $scope.bookingInfo.Services[i];
                        var pick = null, drop = null;
                        param.Services.push({
                            ServiceTime: s.ServiceTime,
                            PickupPoint: s.PickupPoint,
                            DropoffPoint: s.DropoffPoint,
                            // TripItemId: (s.TripItemId==0?null: s.TripItemId),
                            ProductType: s.ProductType,
                            ProductId: s.ProductId,
                            CategoryId: s.CategoryId,
                            StartDate: s.StartDate,
                            Note: s.Note,
                            AvailabilityLevel: s.AvailabilityLevel,
                            Price: s.Price,
                            Guests: s.Guests,
                            ConnectionId:s.ConnectionId,
                            ProductMappingId:s.ProductMappingId
                        });
                    }
                    for (i = 0; i < $scope.bookingInfo.Packages.length; i++) {
                        var pkg = $scope.bookingInfo.Packages[i];
                        param.Packages.push({
                            ProductType: pkg.ProductType,
                            ProductId: pkg.ProductId,
                            CategoryId: pkg.CategoryId,
                            StartDate: pkg.StartDate,
                            Note: pkg.Note,
                            AvailabilityLevel: pkg.AvailabilityLevel,
                            Price: pkg.Price,
                            Rooms: pkg.Rooms,
                            TransportationServices: pkg.TransportationServices,
                            ConnectionId:pkg.ConnectionId,
                            ProductMappingId:pkg.ProductMappingId
                        });
                        //for(j = 0; j < param.Packages[i].Rooms.length; j++) {
                        //    param.Packages[i].Rooms[j].
                        //}
                        for (j = 0; j < param.Packages[i].TransportationServices.length; j++) {
                            for (var k = 1; k <= param.Guests.length; k++) {
                                param.Packages[i].TransportationServices[j].Guests.GuestIds.push(k);
                            }
                        }
                    }
                    if (paymentIncluded) {
                        var p = $scope.bookingInfo.PaymentInfo;
                        var profile = getProfile(p.ProfileId);
                        param.PaymentInfo = {
                            ProfileID: (profile ? p.ProfileId : null),
                            PaymentMethod: (profile ? profile.PaymentMethod : p.PaymentMethod),
                            CreditCardInfo: (p.PaymentMethod == 'CreditCard' ? p.CreditCardInfo : null),
                            BankAccountInfo: (p.PaymentMethod == 'ECheck' ? p.BankAccountInfo : null),
                            SaveInProfile: p.SaveInProfile
                        };

                        if(p.SaveInProfile && profile && p.PaymentMethod == 'CreditCard' && $scope.bookingInfo.paymentProfile == 'existing') {
                            param.PaymentInfo.CreditCardInfo.CardNumber = profile.LastDigits;
                        }
                    }
                    return param;
                }

                function getProfile(profileId) {
                    if (profileId == null)
                        return null;

                    for (var i = 0; i < $scope.financeInfo.Profiles.length; i++) {
                        if (profileId == $scope.financeInfo.Profiles[i].ProfileID) {
                            return $scope.financeInfo.Profiles[i];
                        }
                    }
                    return null;
                }

                function hasProfileByMethod(type) {
                    if (type == '')
                        return false;

                    for (var i = 0; i < $scope.financeInfo.Profiles.length; i++) {
                        if (type == $scope.financeInfo.Profiles[i].PaymentMethod) {
                            return true;
                        }
                    }

                    return false;
                }

                $scope.$watch('bookingInfo.PaymentInfo.ProfileId', function (newValue, oldValue) {
                    if (newValue == oldValue)
                        return;

                    $scope.message = "";

                    if (newValue != null) {
                        var profile = getProfile(newValue);
                        $scope.bookingInfo.PaymentInfo.PaymentMethod = profile.PaymentMethod;
                        if (profile.PaymentMethod == 'CreditCard') {
                            var matches = profile.Description.match(/\d+/g);
                            if (matches != null && matches.length > 2) {
                                $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear = parseInt(matches[2]) + 2000;
                                $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth = parseInt(matches[1]);
                                checkExpiredYearMonth();
                            }
                        }
                    } else {
                        $scope.creditCardError = false;
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear = 0;
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth = 0;
                    }
                });

                $scope.creditCardError = false;
                function checkExpiredYearMonth() {
                    if ($scope.bookingInfo.PaymentInfo.PaymentMethod != "CreditCard") {
                        $scope.creditCardError = false;
                        return;
                    }

                    var yearMonth = $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear * 100 + $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth;
                    var date = new Date();
                    var now = date.getFullYear() * 100 + date.getMonth() + 1;
                    $scope.creditCardError = !(yearMonth >= now);
                    return $scope.creditCardError;
                }

                $scope.$watch('bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear', function (newValue, oldValue) {
                    checkExpiredYearMonth();
                });
                $scope.$watch('bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth', function (newValue, oldValue) {
                    checkExpiredYearMonth();
                });

                $scope.$watch('bookingInfo.PaymentInfo.PaymentMethod', function (newValue, oldValue) {
                    if (newValue == oldValue)
                        return;

                    $scope.message = "";
                    var profile = getProfile($scope.bookingInfo.PaymentInfo.ProfileId);
                    if (profile != null) {
                        if (newValue != profile.PaymentMethod) {
                            $scope.bookingInfo.PaymentInfo.ProfileId = null;
                        }
                    } else {
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear = 0;
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth = 0;
                        $scope.creditCardError = false;
                    }

                    $scope.bookingInfo.paymentProfile = hasProfileByMethod(newValue) ? 'existing' : 'new';

                });

                var confirmTitle = '';
                var yesBtn = '';
                var noBtn = '';
                var newTripBtn = '';
                var payMsg = '';
                var bookMsg = '';
                var quoteMsg = '';
                var success = "";
                var successInfo = "";
                var failed = "";
                var docBtn = "";
                var pleaseSelect = "";
                var notify = "";
                $translate('CONFIRM').then(function (translation) {
                    confirmTitle = translation;
                });
                $translate('YES').then(function (translation) {
                    yesBtn = translation;
                });
                $translate('NO').then(function (translation) {
                    noBtn = translation;
                });
                $translate('START_NEW_TRIP').then(function (translation) {
                    newTripBtn = translation;
                });
                $translate('PAY_MSG').then(function (translation) {
                    payMsg = translation;
                });
                $translate('BOOK_MSG').then(function (translation) {
                    bookMsg = translation;
                });
                $translate('QUOTE_MSG').then(function (translation) {
                    quoteMsg = translation;
                });
                $translate("SUCCESS").then(function (translation) {
                    success = translation + "!";
                });
                $translate("TRIP_BOOKED").then(function (translation) {
                    successInfo = translation;
                });
                $translate("FAILED").then(function (translation) {
                    failed = translation + "!";
                });
                $translate("DOCUMENTS").then(function (translation) {
                    docBtn = translation;
                });
                $translate("PLEASE_SELECT").then(function (translation) {
                    pleaseSelect = translation;
                });
                $translate("NOTIFY_SUPPORT").then(function (translation) {
                    notify = translation;
                });

                $scope.bookAndPay = function (pay) {
                    $scope.message = '';
                    var msg;
                    //var pay = ($scope.saveType == 'Reservation');
                    if (pay)
                        msg = payMsg;
                    else
                        msg = quoteMsg;


                    var p = getBookParam(pay);
                    if (pay) {
                        if (p.PaymentInfo.ProfileID == '' || p.PaymentInfo.ProfileID == null) {
                            if (p.PaymentInfo.PaymentMethod == 'CreditCard') {
                                if (p.PaymentInfo.CreditCardInfo.CardNumber == '' || p.PaymentInfo.CreditCardInfo.CardCode == '' || p.PaymentInfo.CreditCardInfo.ExpirationYear == 0 || p.PaymentInfo.CreditCardInfo.ExpirationMonth == 0) {
                                    translate('FILL_CREDIT_CARD');
                                    return;
                                }

                                //var now = new Date();
                                //if (p.PaymentInfo.CreditCardInfo.ExpirationYear == now.getFullYear() && p.PaymentInfo.CreditCardInfo.ExpirationMonth < now.getMonth() + 1) {
                                if ($scope.creditCardError) {
                                    translate('FILL_YEAR_MONTH');
                                    return;
                                }
                                //}
                            }
                            if (p.PaymentInfo.PaymentMethod == 'ECheck') {
                                if (p.PaymentInfo.BankAccountInfo.BankAccountNumber == '' || p.PaymentInfo.BankAccountInfo.NameOnAccount == '' || p.PaymentInfo.BankAccountInfo.RoutingNumber == '') {
                                    translate("FILL_ECHECK");
                                    return;
                                }
                            }
                        } else {
                            var profile = getProfile(p.PaymentInfo.ProfileID);
                            if (p.PaymentInfo.PaymentMethod == 'CreditCard' && (($scope.financeInfo.CardCodeRequired && p.PaymentInfo.CreditCardInfo.CardCode == '') || $scope.creditCardError)) {
                                translate('FILL_CREDIT_CARD');
                                return;
                            }
                        }
                    }

                    // test on live
                    if (pay && p.PaymentInfo.PaymentMethod == '') {
                        p.PaymentInfo = null;
                        msg = bookMsg;
                    }

                    swal({
                        title: confirmTitle,
                        text: msg,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: yesBtn,
                        cancelButtonText: noBtn,
                        closeOnConfirm: false,
                        showLoaderOnConfirm: true
                    }, function () {
                        ShoppingService.book(p).then(
                            function (data) {
                                ShoppingService.removeAll();
                                $scope.bookDisabled = true;
                                swal({
                                    title: success,
                                    text: successInfo,
                                    type: "success",
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: docBtn,
                                    cancelButtonText: newTripBtn,
                                    closeOnConfirm: true
                                }, function (isConfirm) {
                                    $scope.cancel();
                                    if (isConfirm) {
                                        $window.location.href = SessionService.config().webRoot + 'admin.html#/trips/current/' + data.TripId + '/' + SessionService.languageId() + "?newTrip=true";
                                    } else {
                                        $window.location.href = SessionService.config().webRoot + 'home.html#/' + SessionService.languageId();
                                    }
                                });
                            },
                            function (data) {
                                //$scope.message = data.Message;
                                //swal(failed, data.Message, "error");
                                var showToUser;
                                if(data.ModelState && data.ModelState.key.ShowToUser)
                                    showToUser = data.ModelState.key.Message;
                                else
                                    showToUser = data.Message;
                                swal({
                                    title: failed,
                                    text: showToUser,
                                    type: "error",
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: notify,
                                    cancelButtonText: noBtn,
                                    closeOnConfirm: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        var sendData = {
                                            Request: (JSON.stringify(p)),
                                            Response: (JSON.stringify(data))
                                        };
                                        MessageService.sendForSupport(sendData).then(function (data) {
                                            swal(success);
                                        }, function (data) {
                                            swal(failed, data.Message, "error");
                                        });
                                    }
                                });
                                $scope.bookDisabled = false;
                            });
                    });
                };

                $scope.years = [];
                $scope.months = [];

                $scope.financeInfo = null;
                function loadFinanceInfo() {
                    AccountService.getFinanceInfo().then(function (data) {
                        $scope.financeInfo = data;
                        $scope.financeInfo.Profiles.unshift({
                            ProfileID: null,
                            PaymentMethod: '',
                            Description: pleaseSelect
                        });
                        $scope.selectedProfile = data.Profiles[0];
                        $scope.bookingInfo.paymentProfile = (data.Profiles.length > 0 ? 'existing' : 'new');
                    });
                }

                $scope.checkKeydown = function(event) {
                    if(!((event.key >= '0' && event.key <= '9') || event.key === 'Backspace' || event.key === 'Delete' ||
                        event.key === 'ArrowLeft' || event.key === 'ArrowRight' ) ) {
                        event.preventDefault();
                    }
                };

                $scope.$watch('bookingInfo.paymentProfile', function (newVal, oldVal) {
                    if (newVal == 'new') {
                        $scope.bookingInfo.PaymentInfo.ProfileId = null;
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear = 0;
                        $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth = 0;
                        $scope.creditCardError = false;
                    }
                });

                function load() {
                    var year = (new Date()).getFullYear();
                    var i;
                    for (i = 0; i < 10; i++) {
                        $scope.years.push(year + i);
                    }
                    for (i = 0; i < 12; i++) {
                        $scope.months.push(1 + i);
                    }
                    loadFinanceInfo();
                }

                load();

            }]);
});
