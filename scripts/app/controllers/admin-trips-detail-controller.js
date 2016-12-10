define(['app/services/account-service',
    'app/services/trip-service',
    'sweetalert',
    'app/services/document-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminTripsDetailController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location', 'LanguageService', '$window', '$routeParams', 'TripService', 'DocumentService', '$translate',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window, $routeParams, TripService, DocumentService, $translate) {

                //console.info('path:' + $location.path());
                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                        //load();
                    }
                });

                var title = {
                    current: 'CURRENT_TRIP',
                    past: 'PAST_TRIP',
                    quote: 'QUOTE'
                };

                $scope.tripId = $routeParams.tripId;
                $scope.title = title[$routeParams.tripType];
                $scope.trip = null;
                $scope.showCancelBtn = false;

                var title1;
                var text1;
                var confirmBtn1;
                var cancelBtn1;

                $translate("CONFIRM").then(function (translation) {
                    title1 = translation;
                });
                $translate("CONFIRM_CANCEL_TRIP").then(function (translation) {
                    text1 = translation;
                });
                $translate("CONFIRM_CANCEL").then(function (translation) {
                    confirmBtn1 = translation;
                });
                $translate("NO").then(function (translation) {
                    cancelBtn1 = translation;
                });

                var success;
                var failed;
                var successInfo;
                var failedInfo;
                var docSentInfo;

                $translate("SUCCESS").then(function (translation) {
                    success = translation + "!";
                });
                $translate("TRIP_CANCELLED").then(function (translation) {
                    successInfo = translation;
                });
                $translate("FAILED").then(function (translation) {
                    failed = translation + "!";
                });
                $translate("FAILED_INFO").then(function (translation) {
                    failedInfo = translation;
                });
                $translate("DOC_SENT").then(function (translation) {
                    docSentInfo = translation;
                });


                $scope.cancelTrip = function () {
                    swal({
                        title: title1,//"Are you sure?",
                        text: text1,//"Are you sure you want to cancel this trip?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: confirmBtn1,//"Yes, cancel it!",
                        cancelButtonText: cancelBtn1,//'No',
                        closeOnConfirm: false,
                        showLoaderOnConfirm: true
                    }, function () {
                        var param = {
                            TripId: $scope.trip.TripId,
                            PrimaryGuestName: $scope.trip.PrimaryGuestName
                        };
                        TripService.cancelBooking(param).then(function (data) {
                            $scope.showCancelBtn = false;
                            $scope.trip.AvailabilityLevel = 'Cancelled';
                            $scope.trip.Status = 'Cancelled';
                            swal(success, successInfo, "success");
                        }, function (data) {
                            swal(failed, failedInfo, "error");
                        });

                    });
                    //if ($window.confirm('Are you sure you want to cancel this trip?')) {
                    //    var param = {
                    //        TripId: $scope.trip.TripId,
                    //        PrimaryGuestName: $scope.trip.PrimaryGuestName
                    //    };
                    //    TripService.cancelBooking(param).then(function (data) {
                    //        $scope.showCancelBtn = false;
                    //        $window.alert('Trip has been cancelled successfully!');
                    //    }, function (data) {
                    //        $window.alert('There is a error when cancelling the trip!');
                    //    })
                    //}
                };

                $scope.checkHotelCancelInfo = function(index) {
                    var item = $scope.trip.Hotels[index];
                    TripService.getCancellationPolicies($scope.trip.TripId, item.TripItemId, $scope.trip.PrimaryGuestName).then(function(data){
                            $scope.trip.Hotels[index].CancelInfo = data;
                        });
                };

                $scope.checkServiceCancelInfo = function(index) {
                    var item = $scope.trip.Services[index];
                    TripService.getCancellationPolicies($scope.trip.TripId, item.TripItemId, $scope.trip.PrimaryGuestName).then(function(data){
                        $scope.trip.Services[index].CancelInfo = data;
                    });
                };

                $scope.getGuest = function (guestId) {
                    for (var i = 0; i < $scope.trip.Passengers.length; i++) {
                        if ($scope.trip.Passengers[i].GuestId == guestId)
                            return $scope.trip.Passengers[i];
                    }
                    return null;
                };

                $scope.docFormats = null;
                $scope.docTypes = null;
                $scope.docContent = null;
                $scope.docName = '';
                $scope.showDocument = function (docItem) {
                    //var url = SessionService.config().apiRoot + docItem.RetrieveUri.substring(1).replace(/%7BformatId%7D/,docItem.type);
                    //url = url.replace(/\/\//, '/');
                    $scope.docName = docItem.Name;
                    $("#docContent").html("");
                    var url = docItem.RetrieveUri.replace(/%7BformatId%7D/, 'html');
                    DocumentService.getDocByUrl(url).then(function (data) {
                        //$scope.docContent = data;
                        $scope.docName = docItem.Name;
                        $("#docContent").html(data);
                        //createImage(url);
                    });
                };

                function createImage(url) {
                    var fullUrl = SessionService.config().apiRoot + url;
                    $("#docContent").html('<img src="' + fullUrl + '">');
                }

                $scope.sendDocument = function (docItem) {

                    if (docItem.selectedAddress == null && docItem.otherAddress == '') {
                        return;
                    }
                    var list = [];
                    if (docItem.selectedAddress) {
                        list.push(docItem.selectedAddress.EmailAddress);
                    }
                    if (docItem.otherAddress != '') {
                        list.push(docItem.otherAddress);
                    }
                    DocumentService.sendDocByUrl(docItem.SendUri, list).then(function (data) {
                        //$window.alert('Request for sending document to your email address has been submitted!');
                        swal(success, docSentInfo, "success")
                    }, function () {
                        //$window.alert('There is an error when sending request!');
                        swal(failed, failedInfo, "error");
                    });
                };

                function load() {
                    TripService.getTripDetail($routeParams.tripId, true).then(function (data) {
                        $scope.trip = data;
                        modules.angular.forEach($scope.trip.DocTypes, function (item) {
                            item.otherAddress = '';
                            item.addresses = null;
                            item.selectedAddress = null;
                            var type = null;
                            if (item.SendUri.indexOf('voucher') >= 0)
                                type = 'voucher';
                            else if (item.SendUri.indexOf('receipt') >= 0)
                                type = 'receipt';
                            else if (item.SendUri.indexOf('invoice') >= 0)
                                type = 'invoice';

                            if (type != null) {
                                DocumentService.getEmailAddress($routeParams.tripId, type).then(function (data) {
                                    item.addresses = data;
                                });
                            }
                        });
                        if ($scope.trip.Status == 'Booked') {
                            $scope.showCancelBtn = true;
                        }
                        modules.angular.forEach($scope.trip.Services, function(item){
                            if(item.HasTransport) {
                                item.PickupPoint.ShowName = item.PickupPoint.Name;
                                if(item.PickupPoint.StartTime != '') {
                                    item.PickupPoint.ShowName = item.PickupPoint.Name + ' - ' + item.PickupPoint.StartTime;
                                    if(item.PickupPoint.EndTime != '') {
                                        item.PickupPoint.ShowName = item.PickupPoint.ShowName + ' to ' + item.PickupPoint.EndTime;
                                    }
                                }

                                item.DropoffPoint.ShowName = item.DropoffPoint.Name;
                                if(item.DropoffPoint.StartTime != '') {
                                    item.DropoffPoint.ShowName = item.DropoffPoint.Name + ' - ' + item.DropoffPoint.StartTime;
                                    if(item.DropoffPoint.EndTime != '') {
                                        item.DropoffPoint.ShowName = item.DropoffPoint.ShowName + ' to ' + item.DropoffPoint.EndTime;
                                    }
                                }
                            }
                        });
                    });

                    DocumentService.getFormats().then(function (data) {
                        $scope.docFormats = data;
                    });


                }

                $scope.newTrip = $routeParams.newTrip;

                load();

            }]);

    return modules;
});

