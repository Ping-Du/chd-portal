define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('HotelBookingModalController', ['$scope', '$uibModal', 'AccountService',
            function ($scope, $uibModal, AccountService) {
                $scope.open = function(size){
                    var modalInstance = $uibModal.open({
                        templateUrl:'HotelBookingModal.html',
                        controller:'HotelBookingModalInstanceController',
                        size:size
                    });

                    modalInstance.result.then(function(){
                    }, function(){
                    });
                };

                $scope.$on('OpenHotelBookingModal', function(event, size){
                    $scope.open(size);
                });
            }])
        .controller('HotelBookingModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'AccountService',
            function($rootScope, $scope, $uibModalInstance, $translate, AccountService){

            function translate(key) {
                $translate(key).then(function(translation){
                    $scope.message = translation;
                });
            }

            $scope.ok = function(){
            };

            $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
            };

        }]);
});

