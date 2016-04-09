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
        .controller('ShoppingCartModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'ShoppingService', '$window', 'AccountService',
            function ($rootScope, $scope, $uibModalInstance, $translate, ShoppingService, $window, AccountService) {

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
                        ProfileId: '',
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
                    Adults: 0,
                    Minors: 0,
                    HotelPrice: 0,
                    ServicePrice: 0
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
                                if (room.Guests[k].Type == 'ADULT') {
                                    adults++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, (k + 1) == room.PrimaryGuestId, room.Guests[k].Age, true);
                                        $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                        if (k == 0)
                                            $scope.bookingInfo.Hotels[i].Rooms[j].Guests.PrimaryGuestId = guestId;
                                        guestId++;
                                    }
                                }
                                else {
                                    minors++;
                                    if (i == 0) {
                                        addEmptyGuest(guestId, false, room.Guests[k].Age, false);
                                        $scope.bookingInfo.Hotels[i].Rooms[j].Guests.GuestIds.push(guestId);
                                        guestId++;
                                    }
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
                        $scope.bookingInfo.Services.push({
                            ServiceTime: serviceCategory.ServiceTime,
                            PickupPoint: service.PickupPoint,
                            DropoffPoint: service.DropoffPoint,
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
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.removeHotel = function (index) {
                    ShoppingService.removeItem('HTL', index);
                    calculateInfo();
                };

                $scope.removeService = function (index) {
                    ShoppingService.removeItem('OPT', index);
                    calculateInfo();
                };

                $scope.activeTabIndex = 0;
                $scope.showPreviousBtn = false;
                $scope.showNextBtn = false;

                function setButtons() {
                    $scope.showPreviousBtn = ($scope.activeTabIndex > 0);
                    $scope.showNextBtn = ($scope.activeTabIndex < 4);
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

                    $scope.bookingInfo.Adults = 0;
                    $scope.bookingInfo.Minors = 0;
                    for (var i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        if (g.PrimaryGuest) {
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

                function getBookParam(paymentIncluded) {
                    var param = {
                        TripId: $scope.bookingInfo.TripId,
                        Reference: $scope.bookingInfo.Reference,
                        PrimaryGuestName: $scope.bookingInfo.PrimaryGuestName,
                        Guests: [],
                        PaymentInfo: null,
                        Hotels: [],
                        Services: []
                    };
                    var i, j;
                    for(i = 0; i < $scope.bookingInfo.Guests.length; i++) {
                        var g = $scope.bookingInfo.Guests[i];
                        param.Guests.push({
                            GuestId: g.GuestId,
                            FirstName: g.FirstName,
                            LastName: g.LastName,
                            Title: g.Title,
                            Phone: g.Phone,
                            Age: parseInt(g.Age),
                            PrimaryGuest: g.PrimaryGuest
                        });
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
                    if(paymentIncluded) {
                        var p = $scope.bookingInfo.PaymentInfo;
                        param.PaymentInfo = {
                            ProfileId: ((p.ProfileId == '')?null: p.ProfileId),
                            PaymentMethod: (p.ProfileId == ''?p.PaymentMethod:null),
                            CreditCardInfo: (p.ProfileId == '' && p.PaymentMethod == 'CreditCard'? p.CreditCardInfo:null),
                            BankAccountInfo: (p.ProfileId == '' && p.PaymentMethod == 'ECheck'? p.BankAccountInfo:null),
                            SaveInProfile: (p.ProfileId == ''? p.SaveInProfile: null)
                        };
                    }
                    return param;
                }

                $scope.bookDisabled = false;
                $scope.bookAndPay = function (pay) {
                    var msg;
                    if(pay)
                        msg = 'Are you sure that you will book and pay for these products?';
                    else
                        msg = 'Are you going to save it as quote?';
                    if ($window.confirm(msg)) {
                        var p = getBookParam(pay);
                        if(pay) {
                            if(p.PaymentInfo.ProfileId == '' || p.PaymentInfo.ProfileId == null) {
                                if(p.PaymentInfo.PaymentMethod == 'CreditCard') {
                                    if(p.PaymentInfo.CreditCardInfo.CardNumber == '' || p.PaymentInfo.CreditCardInfo.CardCode == '' || p.PaymentInfo.CreditCardInfo.ExpirationYear == 0 || p.PaymentInfo.CreditCardInfo.ExpirationMonth == 0) {
                                        $scope.message = 'Please fill out all information of credit card!';
                                        return;
                                    }
                                }
                                if(p.PaymentInfo.PaymentMethod == 'ECheck') {
                                    if(p.PaymentInfo.BankAccountInfo.BankAccountNumber == '' || p.PaymentInfo.BankAccountInfo.NameOnAccount == '' || p.PaymentInfo.BankAccountInfo.RoutingNumber == '') {
                                        $scope.message = 'Please fill out all information of bank account!';
                                        return;
                                    }
                                }
                            }
                            $scope.bookDisabled = true;
                        }
                        ShoppingService.book(p).then(function(data){
                            ShoppingService.removeAll();
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
