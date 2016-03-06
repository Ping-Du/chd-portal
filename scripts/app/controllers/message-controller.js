define(['app/services/message-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller('MessageController', ['$scope', 'MessageService', 'SessionService', function ($scope, MessageService, SessionService) {
            //var emptyMessage = {
            //    Id: 0,
            //    Section: '',
            //    Title: '',
            //    Subtitle: '',
            //    FormattedText: '',
            //    PlainText: '',
            //    LargeImageURI: '',
            //    MediumImageURI: '',
            //    SmallImageURI: '',
            //    ThumbnailImageURI: '',
            //    ImageCaption: '',
            //    ConsentRequired: true,
            //    Severity: 0
            //};

            $scope.message = null;

            function loadMessage() {
                //var promise = MessageService.getMessage();
                //promise.then(function (data) {
                //    $scope.message = data;
                //}, function (/*data*/) {
                //    $scope.message = emptyMessage;
                //});
                $scope.message = {
                    Title:'This is hidden if no message got from server!'
                };
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

            load();
        }]);

    return modules;
});
