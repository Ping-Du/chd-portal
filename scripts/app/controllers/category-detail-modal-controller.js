define(['app/services/session-service', 'app/utils'], function (modules) {
    'use strict';
    modules.controllers
        .controller('CategoryDetailModalController', ['$scope', '$uibModal', 'PackageService',
            function ($scope, $uibModal, PackageService) {

                $scope.open = function (category) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'CategoryDetailModal.html',
                        controller: 'CategoryDetailModalInstanceController',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            category: function () {
                                return category;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });
                };

                $scope.$on('CategoryDetail:Open', function (event, category) {
                    $scope.open(category);
                });
            }])
        .controller('CategoryDetailModalInstanceController', ['_', '$rootScope', '$scope', '$uibModalInstance', '$translate', '$window', 'SessionService', 'category',
            function (_, $rootScope, $scope, $uibModalInstance, $translate, $window, SessionService, category) {

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.category = category;
                var webRoot = SessionService.config().webRoot;
                var languageId = SessionService.languageId();

                $scope.showHotelDetail = function(id) {
                    $window.open(webRoot+'hotels.html#/'+id+"/"+languageId+"?noAvailability=true", "_blank");
                };

                $scope.showServiceDetail = function(id, type) {
                    var serviceType = getServiceType(type, false);
                    $window.open(webRoot+'services.html#/'+serviceType+"/"+id+"/"+languageId+"?noAvailability=true",  "_blank");
                }

            }]);

    return modules;
});
