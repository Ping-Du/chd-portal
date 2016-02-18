define([ 'app/message/message-service'], function (module) {
    'use strict';

    module.controller('messageController', ['$scope','messageService', function($scope, messageService){
        var emptyMessage = {
            Id:0,
            Section:'',
            Title:'',
            Subtitle:'',
            FormattedText:'',
            PlainText:'',
            LargeImageURI:'',
            MediumImageURI:'',
            SmallImageURI:'',
            ThumbnailImageURI:'',
            ImageCaption:''
        };

        $scope.message = emptyMessage;

        var promise = messageService.getMessage();
        promise.then(function(data){
            $scope.message = data;
        }, function(/*data*/){
            $scope.message = emptyMessage;
        });

    }]);

    return module;
});
