define(['app/services/account-service', 'app/services/shopping-service', 'app/utils'], function (modules) {
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
        .controller('ShoppingCartModalInstanceController', ['_', '$rootScope', '$scope', '$uibModalInstance', '$translate', 'ShoppingService', '$window', 'AccountService',
            function (_, $rootScope, $scope, $uibModalInstance, $translate, ShoppingService, $window, AccountService) {

                //function translate(key) {
                //    $translate(key).then(function (translation) {
                //        $scope.message = translation;
                //    });
                //}

                $scope.shoppingItems = ShoppingService.getItems();

                $scope.bookingInfo = {
                    TripId: 0,
                    Reference: '',
                    PrimaryGuestName: '',
                    Guests: [],
                    PaymentInfo: {
                        ProfileId: null,
                        PaymentMethod: 'CreditCard',
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
                    Packages:[],
                    Adults: 0,
                    Minors: 0,
                    HotelPrice: 0,
                    ServicePrice: 0,
                    PackagePrice:0
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
                        deletable: false
                    });
                }

                function calculateInfo() {
                    $scope.bookingInfo.Guests = [];
                    $scope.bookingInfo.Hotels = [];
                    $scope.bookingInfo.Services = [];
                    $scope.bookingInfo.Packages = [];
                    var i, j, k;

                    for (i = 0; i < $scope.shoppingItems.hotels.length; i++) {
                        var hotel = $scope.shoppingItems.hotels[i].product;
                        var index = $scope.shoppingItems.hotels[i].index;
                        var category = hotel.AvailabilityCategories[index];
                        var guestId = 1;
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
                            Rooms: []
                        });
                        for (j = 0; j < category.Rooms.length; j++) {
                            var room = category.Rooms[j];
                            $scope.bookingInfo.Hotels[i].Nights = room.Nights.length;
                            $scope.bookingInfo.HotelPrice += room.Price;
                            $scope.bookingInfo.Hotels[i].Rooms.push({
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: 0
                                },
                                Price: room.Price
                            });
                            var adults = 0, minors = 0;
                            for (k = 0; k < room.Guests.length; k++) {
                                if (room.Guests[k].Type == 'ADULT' && (room.Guests[k].Age >= 18 || room.Guests[k].Age == 0)) {
                                    adults++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, (k + 1) == room.PrimaryGuestId, room.Guests[k].Age, true);
                                    }
                                        $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                        if (k == 0)
                                            $scope.bookingInfo.Hotels[i].Rooms[j].Guests.PrimaryGuestId = guestId;
                                        guestId++;

                                }
                                else {
                                    minors++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, false, room.Guests[k].Age, false);
                                    }
                                        $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                        guestId++;
                                    //}
                                }
                            }
                            room.guestsInfo = adults + " adult(s) " + minors + ' minor(s)';
                        }
                    }

                    for (i = 0; i < $scope.shoppingItems.services.length; i++) {
                        var service = $scope.shoppingItems.services[i].product;
                        var serviceIndex = $scope.shoppingItems.services[i].index;
                        var serviceCategory = service.AvailabilityCategories[serviceIndex];
                        var serviceGuestId = $scope.bookingInfo.Guests.length + 1;
                        $scope.bookingInfo.ServicePrice += serviceCategory.Price;

                        var pickUpPoint = null;
                        var dropOffPoint = null;

                        for(k = 0; k < service.PickupPoints.length; k++) {
                            if(service.PickupPoints[k].LocationId == service.PickupPoint) {
                                pickUpPoint = {
                                    LocationType:service.PickupPoints[k].LocationType,
                                    LocationId:service.PickupPoint,
                                    Time:''
                                };
                                break;
                            }
                        }

                        for(k = 0; k < service.DropoffPoints.length; k++) {
                            if(service.DropoffPoints[k].LocationId == service.DropoffPoint) {
                                dropOffPoint = {
                                        LocationType:service.DropoffPoints[k].LocationType,
                                        LocationId:service.DropoffPoint,
                                        Time:''
                                };
                                break;
                            }
                        }

                        $scope.bookingInfo.Services.push({
                            ServiceTime: serviceCategory.ServiceTime,
                            PickupPoint: pickUpPoint, //service.PickupPoint,
                            DropoffPoint: dropOffPoint, //service.DropoffPoint,
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
                            Guests: {
                                GuestIds: [],
                                PrimaryGuestId: serviceGuestId
                            }
                        });
                        var serviceAdults = 0, serviceMinors = 0;
                        for (j = 0; j < serviceCategory.Guests.length; j++) {
                            var guest = serviceCategory.Guests[j];
                            //$scope.bookingInfo.Services[i].Guests.GuestIds.push(j+1);
                            if (guest.Type == 'ADULT' && (guest.Age >= 18 || guest.Age == 0)) {
                                serviceAdults++;
                                if (i == 0) {
                                    addEmptyGuest(serviceGuestId, j == 0, guest.Age, true);
                                    $scope.bookingInfo.Services[i].Guests.GuestIds.push(serviceGuestId);
                                    if (j == 0)
                                        $scope.bookingInfo.Services[i].Guests.PrimaryGuestId = serviceGuestId;
                                    serviceGuestId++;
                                }
                            }
                            else {
                                serviceMinors++;
                                if (i == 0) {
                                    addEmptyGuest(serviceGuestId, false, guest.Age, false);
                                    $scope.bookingInfo.Services[i].Guests.GuestIds.push(serviceGuestId);
                                    serviceGuestId++;
                                }
                            }
                            serviceCategory.guestsInfo = serviceAdults + " adult(s) " + serviceMinors + ' minor(s)';
                        }
                    }

                    for(i = 0; i < $scope.shoppingItems.packages.length; i++) {
                        var pkg = $scope.shoppingItems.packages[i].product;
                        var index = $scope.shoppingItems.packages[i].index;
                        var category = pkg.AvailabilityCategories[index];
                        var guestId = 1;
                        $scope.bookingInfo.PackagePrice += category.Price;
                        $scope.bookingInfo.Packages.push({
                            TripItemId: 0,
                            ProductType: pkg.ProductType,
                            ProductId: pkg.ProductId,
                            Name:pkg.Name,
                            CategoryId: category.Id,
                            CategoryName: category.Name,
                            EndDate:category.EndDate,
                            StartDate: category.StartDate,
                            Note: '',
                            AvailabilityLevel: category.AvailabilityLevel,
                            Price: category.Price,
                            Rooms: [],
                            TransportationServices:[],
                            Nights:category.Nights
                        });
                        for(j = 0; j < category.Services.length; j++) {
                            $scope.bookingInfo.Packages[i].TransportationServices.push({
                                //Sequence:(j+1),
                                //ServiceTime:null,
                                //TripItemId:null,
                                Note:'',
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: 1
                                },
                                ProductType:category.Services[j].ProductType,
                                ProductId:category.Services[j].ProductId,
                                CategoryId:category.Services[j].Category.Id,
                                PickupPoint:category.Services[j].PickupPoint,
                                DropoffPoint:category.Services[j].DropoffPoint,
                                AvailabilityLevel:category.Services[j].AvailabilityLevel,
                                StartDate:category.Services[j].StartDate
                            });
                        }
                        for (j = 0; j < category.Rooms.length; j++) {
                            var room = category.Rooms[j];
                            $scope.bookingInfo.Packages[i].Rooms.push({
                                Guests: {
                                    GuestIds: [],
                                    PrimaryGuestId: 0
                                },
                                Price: room.Price
                            });
                            var adults = 0, minors = 0;
                            for (k = 0; k < room.Guests.length; k++) {
                                if (room.Guests[k].Type == 'ADULT' && (room.Guests[k].Age >= 18 || room.Guests[k].Age == 0)) {
                                    adults++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, (k + 1) == room.PrimaryGuestId, room.Guests[k].Age, true);
                                    }
                                    $scope.bookingInfo.Packages[i].Rooms[j].Guests.GuestIds.push(guestId);
                                    if (k == 0)
                                        $scope.bookingInfo.Packages[i].Rooms[j].Guests.PrimaryGuestId = guestId;
                                    guestId++;

                                }
                                else {
                                    minors++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, false, room.Guests[k].Age, false);
                                    }
                                    $scope.bookingInfo.Packages[i].Rooms[j].Guests.GuestIds.push(guestId);
                                    guestId++;
                                    //}
                                }
                            }
                            category.guestsInfo = adults + " adult(s) " + minors + ' minor(s)';
                        }
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
                    $scope.showNextBtn = ($scope.activeTabIndex < 4 && ($scope.bookingInfo.Hotels.length > 0 || $scope.bookingInfo.Services.length > 0  || $scope.bookingInfo.Packages.length > 0));
                    _.each($scope.tabs, function(item, index){
                    });
                }

                calculateInfo();
                setButtons();

                $scope.tabs = [
                    {active: true, disabled: false},
                    {active: false, disabled: true},
                    {active: false, disabled: true},
                    {active: false, disabled: true},
                    {active: false, disabled: true}
                ];

                function calShowName() {
                    var validateResult = true;
                    var firstGuest = true;

                    $scope.bookingInfo.Adults = 0;
                    $scope.bookingInfo.Minors = 0;
                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        if (g.PrimaryGuest) {
                            if(firstGuest) {
                                firstGuest = false;
                                $scope.bookingInfo.PrimaryGuestName = g.LastName + ' ' + g.FirstName;
                            }
                            g.ShowName = '* ' + g.LastName + ' ' + g.FirstName;
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

                    return validateResult;
                }

                function reCalculateGuestId() {
                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        $scope.bookingInfo.Guests[i].GuestId = i + 1;
                    }
                }

                $scope.addGuest = function (adult) {
                    addEmptyGuest($scope.bookingInfo.Guests.length + 1, false, 0, adult);
                };

                $scope.removeGuest = function (index) {
                    $scope.bookingInfo.Guests.splice(index, 1);
                    reCalculateGuestId();
                };

                $scope.previous = function () {
                    if ($scope.activeTabIndex == 1) {
                        calShowName();
                    }
                    $scope.message = '';
                    $scope.tabs[$scope.activeTabIndex].disabled = true;
                    $scope.tabs[$scope.activeTabIndex].active = false;
                    $scope.activeTabIndex = $scope.activeTabIndex - 1;
                    $scope.tabs[$scope.activeTabIndex].disabled = false;
                    $scope.tabs[$scope.activeTabIndex].active = true;
                    setButtons();
                };

                $scope.message = '';

                function checkGuestAssignment() {
                    var i, j, k;

                    var total = $scope.bookingInfo.Guests.length;
                    var primaryOk = false;
                    for (i = 0; i < $scope.bookingInfo.Hotels.length; i++) {
                        var hotel = $scope.bookingInfo.Hotels[i];
                        for (j = 0; j < hotel.Rooms.length; j++) {
                            primaryOk = false;
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

                    return true;
                }

                $scope.next = function () {
                    if ($scope.activeTabIndex == 1) {
                        if (!calShowName()) {
                            $scope.message = "Please fill out all lead names";
                            return;
                        }
                    }
                    if ($scope.activeTabIndex == 2) {
                        if (!checkGuestAssignment()) {
                            $scope.message = "Please assign all guests!";
                            return;
                        }
                    }


                    $scope.message = '';
                    $scope.tabs[$scope.activeTabIndex].disabled = true;
                    $scope.tabs[$scope.activeTabIndex].active = false;
                    $scope.activeTabIndex = $scope.activeTabIndex + 1;
                    $scope.tabs[$scope.activeTabIndex].disabled = false;
                    $scope.tabs[$scope.activeTabIndex].active = true;
                    setButtons();
                };

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
                        Packages:[]
                    };
                    var i, j;
                    var hasPrimaryGuest = false;
                    for(i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        param.Guests.push({
                            GuestId: g.GuestId,
                            FirstName: g.FirstName,
                            LastName: g.LastName,
                            Title: g.Title,
                            Phone: g.Phone,
                            Age: (g.Adult?null:parseInt(g.Age)),
                            PrimaryGuest: (g.PrimaryGuest && !hasPrimaryGuest)
                        });
                        if(g.PrimaryGuest && !hasPrimaryGuest) {
                            hasPrimaryGuest = true;
                        }
                    }
                    for(i = 0; i < $scope.bookingInfo.Hotels.length; i++) {
                        var h = $scope.bookingInfo.Hotels[i];
                        param.Hotels.push({
                            RatePlanId: h.RatePlanId,
                            Nights: h.Nights,
                           // TripItemId: (h.TripItemId==0?null: h.TripItemId),
                            ProductType: h.ProductType,
                            ProductId: h.ProductId,
                            CategoryId:h.CategoryId,
                            StartDate: h.StartDate,
                            Note: h.Note,
                            AvailabilityLevel: h.AvailabilityLevel,
                            Price: h.Price,
                            Rooms: h.Rooms
                        });
                    }
                    for(i = 0; i < $scope.bookingInfo.Services.length; i++) {
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
                            Guests: s.Guests
                        });
                    }
                    for(i = 0; i < $scope.bookingInfo.Packages.length; i++) {
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
                            TransportationServices:pkg.TransportationServices
                        });
                        //for(j = 0; j < param.Packages[i].Rooms.length; j++) {
                        //    param.Packages[i].Rooms[j].
                        //}
                        for(j = 0; j < param.Packages[i].TransportationServices.length; j++) {
                            for(var k = 1; k <= param.Guests.length; k++) {
                                param.Packages[i].TransportationServices[j].Guests.GuestIds.push(k);
                            }
                        }
                    }
                    if(paymentIncluded) {
                        var p = $scope.bookingInfo.PaymentInfo;
                            var profile = getProfile(p.ProfileId);
                            param.PaymentInfo = {
                                ProfileID: (profile ? p.ProfileId : null),
                                PaymentMethod: (profile ? profile.PaymentMethod : p.PaymentMethod),
                                CreditCardInfo: (p.PaymentMethod == 'CreditCard' ? p.CreditCardInfo : null),
                                BankAccountInfo: (p.PaymentMethod == 'ECheck' ? p.BankAccountInfo : null),
                                SaveInProfile: p.SaveInProfile
                            };
                    }
                    return param;
                }

                function getProfile(profileId) {
                    if(profileId == null)
                        return null;

                    for(var i = 0; i < $scope.financeInfo.Profiles.length; i++) {
                        if(profileId == $scope.financeInfo.Profiles[i].ProfileID) {
                            return $scope.financeInfo.Profiles[i];
                        }
                    }
                    return null;
                }

                $scope.$watch('bookingInfo.PaymentInfo.ProfileId', function(newValue, oldValue){
                    if(newValue != null) {
                        var profile = getProfile(newValue);
                        $scope.bookingInfo.PaymentInfo.PaymentMethod = profile.PaymentMethod;
                        if(profile.PaymentMethod == 'CreditCard') {
                            var matches =  profile.Description.match(/\d+/g);
                            if(matches != null && matches.length > 2) {
                                $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationYear = parseInt(matches[2]) + 2000;
                                $scope.bookingInfo.PaymentInfo.CreditCardInfo.ExpirationMonth = parseInt(matches[1]);
                            }
                        }
                    }
                });

                $scope.bookDisabled = false;
                $scope.bookAndPay = function (pay) {
                    $scope.message = '';
                    var msg;
                    if(pay)
                        msg = 'Are you sure that you will book and pay for these products?';
                    else
                        msg = 'Are you going to save it as quote?';
                    if ($window.confirm(msg)) {
                        var p = getBookParam(pay);
                        if(pay) {
                            if(p.PaymentInfo.ProfileID == '' || p.PaymentInfo.ProfileID == null) {
                                if(p.PaymentInfo.PaymentMethod == 'CreditCard') {
                                    if(p.PaymentInfo.CreditCardInfo.CardNumber == '' || p.PaymentInfo.CreditCardInfo.CardCode == '' || p.PaymentInfo.CreditCardInfo.ExpirationYear == 0 || p.PaymentInfo.CreditCardInfo.ExpirationMonth == 0) {
                                        $scope.message = 'Please fill out all information of credit card!';
                                        return;
                                    }

                                    var now = new Date();
                                    if(p.PaymentInfo.CreditCardInfo.ExpirationYear == now.getFullYear() && p.PaymentInfo.CreditCardInfo.ExpirationMonth < now.getMonth()+1) {
                                        $scope.message = 'Please fill valid year and month!';
                                        return;
                                    }
                                }
                                if(p.PaymentInfo.PaymentMethod == 'ECheck') {
                                    if(p.PaymentInfo.BankAccountInfo.BankAccountNumber == '' || p.PaymentInfo.BankAccountInfo.NameOnAccount == '' || p.PaymentInfo.BankAccountInfo.RoutingNumber == '') {
                                        $scope.message = 'Please fill out all information of bank account!';
                                        return;
                                    }
                                }
                            } else {
                                var profile = getProfile(p.PaymentInfo.ProfileID);
                                if(p.PaymentInfo.PaymentMethod == 'CreditCard' && $scope.financeInfo.CardCodeRequired && p.PaymentInfo.CreditCardInfo.CardCode == '') {
                                    $scope.message = "Please fill out card code!";
                                    return;
                                }
                            }
                            $scope.bookDisabled = true;
                        }

                        // test on live
                        if(p.PaymentInfo.PaymentMethod == '')
                            p.PaymentInfo = null;

                        ShoppingService.book(p).then(function(data){
                            ShoppingService.removeAll();
                            $scope.bookDisabled = true;
                            $scope.message = "Book successfully. You can get invoices or receipts on 'My Account'.";
                        }, function(data){
                            $scope.message = data.Message;
                            $scope.bookDisabled = false;
                        });
                    }
                };

                $scope.years = [];
                $scope.months = [];

                $scope.financeInfo = null;
                function loadFinanceInfo() {
                    AccountService.getFinanceInfo().then(function(data){
                        $scope.financeInfo = data;
                        $scope.financeInfo.Profiles.unshift({
                            ProfileID:null,
                            PaymentMethod: '',
                            Description:'Please select'
                        });
                        $scope.selectedProfile = data.Profiles[0];
                    });
                }

                function load() {
                    var year = (new Date()).getFullYear();
                    var i;
                    for(i = 0; i < 10; i++) {
                        $scope.years.push(year+i);
                    }
                    for(i = 0; i < 12; i++) {
                        $scope.months.push(1+i);
                    }
                    loadFinanceInfo();
                }

                load();

            }]);
});
