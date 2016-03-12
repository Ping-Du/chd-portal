define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('ChangePasswordModalController', ['$scope', '$uibModal', 'AccountService',
            function ($scope, $uibModal, AccountService) {
                $scope.open = function(size){
                    var modalInstance = $uibModal.open({
                        templateUrl:'changePasswordModal.html',
                        controller:'ChangePasswordModalInstanceController',
                        size:size
                    });

                    modalInstance.result.then(function(){
                    }, function(){
                    });
                };

                $scope.$on('OpenChangePasswordModal', function(event, size){
                    $scope.open(size);
                });
            }])
        .controller('ChangePasswordModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'SessionService', 'AccountService', function($rootScope, $scope, $uibModalInstance, $translate, SessionService, AccountService){
            //$scope.oldPassword = "";
            $scope.newPassword = "";
            $scope.confirmPassword = "";
            $scope.user = SessionService.user();

            function translate(key) {
                $translate(key).then(function(translation){
                    $scope.message = translation;
                });
            }

            $scope.ok = function(){
                //if($scope.oldPassword != SessionService.password()) {
                //    translate("OLD_PASSWORD_WRONG");
                //    return;
                //}
                if($scope.newPassword == '' || $scope.newPassword != $scope.confirmPassword){
                    translate('PASSWORD_NOT_MATCH');
                    return;
                }
                var promise = AccountService.setPassword($scope.newPassword, $scope.confirmPassword);
                promise.then(function(data) {
                    $uibModalInstance.close('ok');
                }, function(status){
                    translate('API_FAILED');
                });
            };

            $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
            };

        }]);
});

