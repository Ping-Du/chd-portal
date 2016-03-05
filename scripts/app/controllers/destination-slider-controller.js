define(['app/services/destination-service'], function (modules) {
    modules.controllers
        .controller("DestinationSliderController", ["$scope","DestinationService", 'SessionService', function($scope, DestinationService, SessionService){

            //[
            //    {
            //        "Id": "string",
            //        "Name": "string",
            //        "ProductType": "string",
            //        "LanguageId": "string",
            //        "MainInformation": {
            //            "Id": 0,
            //            "Section": "string",
            //            "Title": "string",
            //            "SubTitle": "string",
            //            "FormattedText": "string",
            //            "PlainText": "string",
            //            "LargeImageURI": "string",
            //            "MediumImageURI": "string",
            //            "SmallImageURI": "string",
            //            "ThumbnailImageURI": "string",
            //            "ImageCaption": "string",
            //            "ConsentRequired": true,
            //            "Severity": 0
            //        },
            //        "DetailsURI": "string",
            //        "PageLink": "string",
            //        "Featured": true,
            //        "Latitude": 0,
            //        "Longitude": 0,
            //        "Location": {
            //            "Id": "string",
            //            "Name": "string"
            //        }
            //    }
            //]

            var chi = [{
                Id:"1",
                Name:'City 1',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img1.jpg'
                }
            },{
                Id:"2",
                Name:'City 2',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img2.jpg'
                }
            },{
                Id:"3",
                Name:'City 3',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img3.jpg'
                }
            },{
                Id:"4",
                Name:'City 4',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img1.jpg'
                }
            },{
                Id:"5",
                Name:'City 5',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img2.jpg'
                }
            },{
                Id:"6",
                Name:'City 6',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img3.jpg'
                }
            }];
            var eng = [{
                Id:"1",
                Name:'City 1',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img1.jpg'
                }
            },{
                Id:"2",
                Name:'City 2',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img2.jpg'
                }
            },{
                Id:"3",
                Name:'City 3',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img3.jpg'
                }
            },{
                Id:"4",
                Name:'City 4',
                MainInformation:{
                    MediumImageURI:'images/temp/city-img1.jpg'
                }
            }];
            $scope.destinations = null;

            function loadDestinations() {
                DestinationService.getFeaturedDestinations().then(function (data) {
                    $scope.destinations = data;
                    require(['app/slider/home-slider']);
                });
            }

            var load = false;
            $scope.$on('LanguageChanged', function(event, data){
                //loadDestinations();

                if(data == 'CHI')
                    $scope.destinations = chi;
                else
                    $scope.destinations = eng;

                if(!load){
                    load = true;
                    require(['app/slider/home-slider']);
                }

            });

        }]);
});