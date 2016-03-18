define(['app/services/session-service', 'bootstrap-datepicker.zh-CN'], function (modules) {
    modules.directives.directive('datePicker', ['SessionService', function(SessionServiceProvider){
        return {
            restrict:'A',
            scope:{
                initDate:'=',
                startDate:'@'
            },
            link:function($scope, element, attrs) {
                var languageId = 'en';
                if(SessionServiceProvider.languageId() == 'CHI'){
                    languageId = 'zh-CN';
                }
                $('#'+attrs.id).datepicker({
                    format:"yyyy-mm-dd",
                    language:languageId,
                    startDate:$scope.startDate,
                    autoclose:true,
                    todayBtn:false
                });

                if($scope.initDate)
                    $('#'+attrs.id).datepicker('update', $scope.initDate);

            }
        };
    }]);
});