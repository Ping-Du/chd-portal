define(['app/services/trip-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('TripDetailModalController', ['$scope', '$uibModal', 'TripService',
            function ($scope, $uibModal, TripService) {
                $scope.open = function (tripId, size) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'TripDetailModal.html',
                        controller: 'TripDetailModalInstanceController',
                        backdrop: 'static',
                        size: size,
                        resolve:{
                            tripId:tripId
                        }
                    });

                    modalInstance.result.then(function (result) {
                        if(result == 'cancelTrip') {
                            trip.Status = 'Cancelled';
                            trip.AvailabilityLevel =  'Cancelled';
                        }
                    }, function () {
                    });
                };

                var trip;
                $scope.$on('Trip:ViewDetail', function (event, tripItem) {
                    trip = tripItem;
                    $scope.open(tripItem.TripId, 'lg');
                });
            }])
        .controller('TripDetailModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'TripService','tripId','$window',
            function ($rootScope, $scope, $uibModalInstance, $translate, TripService, tripId, $window) {

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.cancelTrip = function() {
                    if($window.confirm('Are you going to cacel this trip?')){
                        var param = {
                                TripId:$scope.trip.TripId,
                                PrimaryGuestName:$scope.trip.PrimaryGuestName
                            };
                        TripService.cancelBooking(param).then(function(data){
                            $uibModalInstance.close('cancelTrip');
                        }, function(data){
                            $scope.message = 'There is a error when canceling the trip!';
                        })
                    }
                };

                $scope.saveTrip = function () {
                    //$uibModalInstance.close('save');
                };

                $scope.message = '';
                $scope.trip = null;
                function load() {
                    TripService.getTripDetail(tripId, true).then(function(data){
                        $scope.trip = data;
                    }, function(){
                        $scope.trip = null;
                    });
                }

                load();

            }]);
});


