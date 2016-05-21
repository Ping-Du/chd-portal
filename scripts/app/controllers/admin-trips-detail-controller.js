define(['app/services/account-service',
    'app/services/trip-service',
    'sweetalert',
    'app/services/document-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminTripsDetailController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location', 'LanguageService', '$window', '$routeParams', 'TripService', 'DocumentService',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window, $routeParams, TripService, DocumentService) {

                console.info('path:' + $location.path());
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
                    current: 'Current Trips',
                    past: 'Past Trips',
                    quote: 'Quotes'
                };

                $scope.title = title[$routeParams.tripType] + ' - ' + $routeParams.tripId;
                $scope.trip = null;
                $scope.showCancelBtn = false;

                $scope.cancelTrip = function () {
                    swal({
                        title: "Are you sure?",
                        text: "Are you sure you want to cancel this trip?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, cancel it!",
                        cancelButtonText:'No',
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
                            swal("Cancelled!", "This trip has been cancelled.", "success");
                        }, function (data) {
                            swal("Error!", "There is a error when cancelling the trip!", "error");
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
                $scope.showDocument = function (docItem) {
                    //var url = SessionService.config().apiRoot + docItem.RetrieveUri.substring(1).replace(/%7BformatId%7D/,docItem.type);
                    //url = url.replace(/\/\//, '/');
                    var url = docItem.RetrieveUri.replace(/%7BformatId%7D/, 'html');
                    DocumentService.getDocByUrl(url).then(function (data) {
                        $scope.docContent = data;
                    });
                };

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
                        swal("Success!", "Request for sending document to your email address has been submitted!", "success")
                    }, function () {
                        //$window.alert('There is an error when sending request!');
                        swal("Failed!", "There is an error while sending request!", "error");
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

