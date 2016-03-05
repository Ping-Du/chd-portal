define(['app/services/message-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('MessageController', ['$scope', 'MessageService', function ($scope, MessageService) {
            var emptyMessage = {
                Id: 0,
                Section: '',
                Title: '',
                Subtitle: '',
                FormattedText: '',
                PlainText: '',
                LargeImageURI: '',
                MediumImageURI: '',
                SmallImageURI: '',
                ThumbnailImageURI: '',
                ImageCaption: '',
                ConsentRequired: true,
                Severity: 0
            };

            $scope.message = emptyMessage;

            $scope.getMessage = function () {
                var promise = MessageService.getMessage();
                promise.then(function (data) {
                    $scope.message = data;
                }, function (/*data*/) {
                    $scope.message = emptyMessage;
                });
            };

            $scope.$on('LanguageChanged', function(event, data){
                $scope.getMessage();
            });

            //$scope.getMessage();
        }]);

    return modules;
});
