define(['app/services/trip-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('HotelBookingModalController', ['$scope', '$uibModal', 'TripService',
            function ($scope, $uibModal, TripService) {
                $scope.open = function (product, index) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'HotelBookingModal.html',
                        controller: 'HotelBookingModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            product: function () {
                                return product;
                            },
                            categoryIndex:function(){
                                return index;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });
                };

                $scope.$on('OpenHotelBookingModal', function (event, hotel, index) {
                    $scope.open(hotel, index);
                });
            }])
        .controller('HotelBookingModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'TripService', 'product','categoryIndex',
            function ($rootScope, $scope, $uibModalInstance, $translate, TripService, product, categoryIndex) {

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.product = product;
                $scope.categoryIndex = categoryIndex;
                $scope.showWarning = false;
                $scope.showOnRequest = false;
                $scope.agreed = true;

                 $scope.tabs = [
                    { index:1, title:'Dynamic Title 1', content:'<h1>h1</h1>', disabled:false, active:true},
                    { index:2, title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true, active:false }
                ];

                $scope.ok = function () {
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

            }]);
});

