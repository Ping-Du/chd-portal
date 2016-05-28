define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('LoginModalController', ['$scope', '$uibModal', 'AccountService',
            function ($scope, $uibModal, AccountService) {
            $scope.open = function(size){
                var modalInstance = $uibModal.open({
                    templateUrl:'loginModal.html',
                    controller:'LoginModalInstanceController',
                    size:size
                });

                modalInstance.result.then(function(){
                    }, function(){
                    });
            };

            $scope.$on('OpenLoginModal', function(event, size){
                $scope.open(size);
            });
        }])
        .controller('LoginModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'AccountService', function($rootScope, $scope, $uibModalInstance, $translate, AccountService){
            $scope.userName = ""; //"testuser";
            $scope.password = ""; //"iQPP6ntalT&f";
            $scope.message = "";

            function translate(key) {
                $translate(key).then(function(translation){
                    $scope.message = translation;
                });
            }

            $scope.ok = function(){
                if($scope.userName == '' || $scope.password == ''){
                    translate('FIELDS_REQUIRED');
                }
                var promise = AccountService.login($scope.userName, $scope.password);
                promise.then(function(data) {
                    $uibModalInstance.close('ok');
                    $rootScope.$broadcast('LOGIN',$scope.userName);
                }, function(status){
                    if(status == '400')
                        translate('LOGIN_WRONG');
                    else
                        translate('API_FAILED');
                });
            };

            $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
            };

            $scope.forgotPassword = function() {
                if($scope.userName == "") {
                    $scope.message = "Please input your user name!";
                    return;
                }

                AccountService.forgotPassword($scope.userName).then(function(){
                    $scope.message = "The reset password email will be sent to you."
                }, function(){
                    translate('API_FAILED');
                });
            };

        }]);
});
