define(['app/services/message-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('MessageController', ['$scope', 'MessageService', 'SessionService', function ($scope, MessageService, SessionService) {

            $scope.show = false;
            $scope.message = null;
            function loadMessage() {
                var promise = MessageService.getMessage();
                promise.then(function (data) {
                    if(modules.angular.isObject(data))
                        $scope.message = data.Title;
                    //else
                    //    $scope.message = "Hello!";
                    if($scope.message)
                        $scope.show = true;
                }, function (/*data*/) {
                });
            }

            $scope.languageId = SessionService.languageId();
            function load(){
                loadMessage();
            }
            $scope.$on('LanguageChanged', function (event, data) {
                if($scope.languageId != data) {
                    $scope.languageId = data;
                    load();
                }
            });

            $scope.close = function() {
                $scope.show = false;
            };

            load();
        }]);

    return modules;
});
