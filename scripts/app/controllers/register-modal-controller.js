define(['app/services/account-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('RegisterModalController', ['$scope', '$uibModal', 'AccountService',
            function ($scope, $uibModal, AccountService) {
                $scope.open = function (size) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'RegisterModal.html',
                        controller: 'RegisterModalInstanceController',
                        size: size
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });
                };

                $scope.$on('OpenRegisterModal', function (event, size) {
                    $scope.open(size);
                });
            }])
        .controller('RegisterModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'AccountService', 'SessionService',
            function ($rootScope, $scope, $uibModalInstance, $translate, AccountService, SessionService) {
                $scope.userName = "";
                $scope.email = "";
                $scope.firstName = "";
                $scope.lastName = "";
                //$scope.role = "";
                //$scope.agency = "";
                //$scope.secretCode = "";
                //$scope.urlToConfirmationPage = "";
                $scope.newPassword = "";
                $scope.confirmPassword = "";
                $scope.message = "";

                function translate(key) {
                    $translate(key).then(function (translation) {
                        $scope.message = translation;
                    });
                }

                $scope.ok = function () {
                    if ($scope.userName == '' || $scope.firstName == '' || $scope.lastName == '' || $scope.email == '' || $scope.newPassword == '' || $scope.newPassword == '') {
                        translate('FIELDS_REQUIRED');
                        return;
                    }

                    if($scope.newPassword.length < 6) {
                        translate('PASSWORD_LENGTH');
                        return;
                    }

                    if ($scope.newPassword != $scope.confirmPassword) {
                        translate('PASSWORD_NOT_MATCH');
                        return;
                    }

                    var promise = AccountService.register($scope.userName, $scope.email, $scope.firstName, $scope.lastName,
                        $scope.newPassword, $scope.confirmPassword);
                    promise.then(function (data) {
                        $scope.message = '';
                        translate('CONFIRM_EMAIL');
                    }, function (status) {
                        translate('API_FAILED');
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                //$scope.forgotPassword()
            }]);
});

