define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('LoginModalController', ['$scope', '$rootScope', '$uibModal', 'AccountService',
            function ($scope, $rootScope, $uibModal, AccountService) {
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
                    AccountService.getUserProperties().then(function(up){
                        AccountService.getAgency().then(function(agency) {
                            $uibModalInstance.close('ok');
                            $rootScope.$broadcast('LOGIN',$scope.userName);
                        }, function(){
                            translate('API_FAILED')
                        });
                    }, function(){
                        translate('API_FAILED')
                    });

                }, function(data){
                    if(data && data.ModelState && data.ModelState.Login && data.ModelState.Login.length > 0) {
                        //translate('LOGIN_WRONG');

                        $scope.message = modules.angular.fromJson(data.ModelState.Login[0]).error_description;
                    }
                    else
                        translate('API_FAILED');
                });
            };

            $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
            };

            $scope.forgotPassword = function() {
                if($scope.userName == "") {
                    translate('INPUT_USER_NAME');
                    return;
                }

                AccountService.forgotPassword($scope.userName).then(function(){
                   translate('PASSWORD_RESET_OK');
                }, function(){
                    translate('API_FAILED');
                });
            };

        }]);
});
