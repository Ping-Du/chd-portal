define(['app/services/shopping-service'], function (modules) {
    'use strict';
    modules.controllers
        .controller('WarningsModalController', ['$rootScope','$scope', '$uibModal', 'ShoppingService',
            function ($rootScope, $scope, $uibModal, ShoppingService) {
                $scope.open = function (product, index) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'WarningsModal.html',
                        controller: 'WarningsModalInstanceController',
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
                        $rootScope.$broadcast('Warnings:Confirmed', product, index);
                    }, function () {
                    });
                };

                $scope.$on('Warnings:Open', function (event, product, index) {
                    $scope.open(product, index);
                });
            }])
        .controller('WarningsModalInstanceController', ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'product','index',
            function ($rootScope, $scope, $uibModalInstance, $translate, product, index) {

                //function translate(key) {
                //    $translate(key).then(function (translation) {
                //        $scope.message = translation;
                //    });
                //}

                $scope.message = '';
                $scope.title = product.Warnings[0].Title;

                var i = 0;
                for(i = 0; i < product.Warnings.length; i++) {
                    //if(product.Warnings[i].ConsentRequired)
                        $scope.message += product.Warnings[i].FormattedText;
                }

                for(i = 0; i < product.AvailabilityCategories[index].Warnings.length; i++) {
                    //if(product.AvailabilityCategories[index].Warnings[i].ConsentRequired)
                        $scope.message += product.AvailabilityCategories[index].Warnings[i].FormattedText;
                }

                $scope.ok = function () {
                    $uibModalInstance.close('ok');
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

            }]);
});

