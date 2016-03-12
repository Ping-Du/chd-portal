define(['app/services/hotel-service',
    'app/services/destination-service',
    'app/services/services-service',
    'app/directives/datepicker-directive'], function (modules) {
    'use strict';

    modules.controllers
        .controller('HotelMainController', ['$rootScope', '$scope', '$location', '$routeParams', '$log', 'SessionService',
            'HotelService', 'ServicesService','DestinationService',
            function ($rootScope, $scope, $location, $routeParams, $log, SessionService, HotelService, ServicesService, DestinationService) {

                $scope.webRoot = SessionService.config().webRoot;

                $scope.dest = null;
                $scope.startDate = null;
                $scope.endDate = null;
                $scope.rooms = null;


                // Disable weekend selection
                function disabled(data) {
                    var date = data.date,
                        mode = data.mode;
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                }
                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yyyy',
                    maxDate: new Date(2099, 12, 31),
                    minDate: new Date(),
                    startingDay: 1,
                    showWeeks:true
                };

                $scope.openStartDate = function(){
                    $scope.startDateOpened = true;
                };

                $scope.openEndDate = function() {
                    $scope.endDateOpend = true;
                };


                var jssorObject = null;
                var slides = 3;
                function ScaleSlider() {
                    var refSize = jssorObject.$Elmt.parentNode.clientWidth;
                    if (refSize) {
                        refSize = Math.min(refSize, 400 * slides + 30 * (slides - 1));
                        jssorObject.$ScaleWidth(refSize);
                    }
                    else {
                        window.setTimeout(ScaleSlider, 30);
                    }
                }
                $scope.jssorOptions = {
                    $AutoPlay: true,
                    $AutoPlaySteps: 3,
                    $SlideDuration: 160,
                    $SlideWidth: 400,
                    $SlideSpacing: 0,
                    $Cols: 3,
                    $ArrowNavigatorOptions: {
                        $Class: $JssorArrowNavigator$,
                        $Steps: 3
                    },
                    $BulletNavigatorOptions: {
                        $Class: $JssorBulletNavigator$,
                        $SpacingX: 1,
                        $SpacingY: 1
                    },
                    onReady:function(){
                        jssorObject = this.handle.slider;
                        ScaleSlider();
                        $(window).bind("load", ScaleSlider);
                        $(window).bind("resize", ScaleSlider);
                        $(window).bind("orientationchange", ScaleSlider);
                    }
                };
                $scope.destinations = [];
                function loadDestinations() {
                    //DestinationService.getFeaturedDestinations().then(function (data) {
                    //    $scope.destinations = data;
                    //});
                    $scope.destinations.push({
                        Id: "1",
                        Name: 'City 1',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img1.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "2",
                        Name: 'City 2',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img2.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "3",
                        Name: 'City 3',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img3.jpg'
                        }
                    });
                    $scope.destinations.push({
                        Id: "4",
                        Name: 'City 4',
                        MainInformation: {
                            MediumImageURI: 'images/temp/city-img1.jpg'
                        }
                    });
                }

                $scope.hotels = [];
                function loadHotels() {
                    //HotelService.getFeaturedHotels().then(function(data){
                    //    $scope.hotels = data;
                    //});
                    $scope.hotels.push({
                        Id: 1, Name: 'Hotel 1', StarRating: 4, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img1.jpg'
                        },StarClass:('icon-star-4'),Location:{Name:'Los Angeles'}
                    });
                    $scope.hotels.push({
                        Id: 2, Name: 'Hotel 2', StarRating: 3, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img2.jpg'
                        },StarClass:('icon-star-3'),Location:{Name:'Las Vegas'}
                    });
                    $scope.hotels.push({
                        Id: 3, Name: 'Hotel 3', StarRating: 2, MainInformation: {
                            MediumImageURI: 'images/temp/hotel-img3.jpg'
                        },StarClass:('icon-star-2'),Location:{Name:'New York'}
                    });
                }

                $scope.languageId = SessionService.languageId();
                function load(){
                    loadDestinations();
                    loadHotels();
                }

                $scope.search = function(){
                    //$log.debug('dest:'+$scope.dest + ' startDate:'+$scope.startDate + ' endDate:'+$scope.endDate);
                    //var start = $('#startDate').datepicker('getDate');
                    //var end = $('#endDate').datepicker('getDate');
                    var dest = ($scope.dest && $scope.dest != '')?$scope.dest:'all';
                    var path = '/destination/'+dest+'/'+SessionService.languageId();
                    var param = '';
                    if($scope.startDate != '') {
                        param += 'startDate='+$scope.startDate+'&endDate='+$scope.endDate;
                    }
                    if($scope.rooms != null){
                        if(param != null)
                            param += "&";
                        param += 'rooms='+$scope.rooms;
                    }
                    //if(param != '')
                    //    path += '?'+param;
                    $location.search(param);
                    $location.path(path);

                };

                $scope.$on('LanguageChanged', function (event, data) {
                    if($scope.languageId != data) {
                        $scope.languageId = data;
                        load();
                    }
                });

                load();


            }]);
});
