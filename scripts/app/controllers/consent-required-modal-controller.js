define(['app/services/shopping-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('ConsentRequiredModalController', ['$rootScope','$scope', '$uibModal', 'ShoppingService',
            function ($rootScope, $scope, $uibModal, ShoppingService) {
                $scope.open = function (product, index) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'ConsentRequiredModal.html',
                        controller: 'ConsentRequiredModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            product: function () {
                                return product;
                            },
                            index:function(){
                                return index;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        //ShoppingService.addItem(product, index);
                        $rootScope.$broadcast('ConsentRequired:Confirmed', product, index);
                    }, function () {
                    });
                };

                $scope.$on('ConsentRequired:Open', function (event, product, index) {
                    $scope.open(product, index);
                });
            }])
        .controller('ConsentRequiredModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'product','index',
            function ($rootScope, $scope, $uibModalInstance, $translate, product, index) {

                //function translate(key) {
                //    $translate(key).then(function (translation) {
                //        $scope.message = translation;
                //    });
                //}

                $scope.message = '';
                $scope.onRequest = true;
                $scope.agreed = false;

                //var i = 0;
                //for(i = 0; i < product.Warnings.length; i++) {
                //    if(product.Warnings[i].ConsentRequired)
                //        $scope.message += product.Warnings[i].FormattedText;
                //}
                //
                //for(i = 0; i < product.AvailabilityCategories[index].Warnings.length; i++) {
                //    if(product.AvailabilityCategories[index].Warnings[i].ConsentRequired)
                //        $scope.message += product.AvailabilityCategories[index].Warnings[i].FormattedText;
                //}

                $scope.onRequest = (product.AvailabilityCategories[index].AvailabilityLevel == "Requestable");
                $scope.required = ($scope.message != '' || $scope.onRequest);

                $scope.isService = (product.ProductType == 'OPT');
                $scope.isPackage = (product.ProductType == 'PKG');
                //$scope.serviceTime = '';
                $scope.pickupPoint = '';
                $scope.dropoffPoint = '';
                $scope.product = product;
                $scope.hasTransport = product.HasTransport;

                if($scope.isService) {
                    if(product.PickupPoints.length > 0) {
                        $scope.pickupPoint = product.PickupPoints[0].LocationId;
                    }
                    if(product.DropoffPoints.length > 0) {
                        $scope.dropoffPoint = product.DropoffPoints[0].LocationId;
                    }
                }

                $scope.ok = function () {
                    if($scope.isService) {
                        product.PickupPoint = $scope.pickupPoint;
                        product.dropoffPoint = $scope.dropoffPoint;
                        //product.AvailabilityCategories[index].ServiceTime = $scope.serviceTime;
                    }
                    $uibModalInstance.close('ok');
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

            }]);
});

