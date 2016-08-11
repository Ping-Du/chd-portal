define(['app/services/account-service'], function (modules) {
    'use strict';

    modules.controllers
        .controller("AdminMenuController", ['$rootScope', '$scope', 'SessionService',
            '$log', '$location', 'LanguageService', '$window',
            function ($rootScope, $scope, SessionService, $log, $location, LanguageService, $window) {

                var languageId = LanguageService.determineLanguageIdFromPath($location.path());
                if (languageId && languageId != SessionService.languageId()) {
                    $rootScope.$broadcast('RequireChangeLanguage', languageId);
                }

                $scope.webRoot = SessionService.config().webRoot;
                //$scope.showRegister = (SessionService.roleId() == "Manager");

                $scope.languageId = SessionService.languageId();
                $scope.$on('LanguageChanged', function (event, data) {
                    if ($scope.languageId != data) {
                        $scope.languageId = data;
                    }
                });

                $scope.menuItems = [{
                    id: 1,
                    title: 'MY_TRIPS',
                    active: false,
                    show:true,
                    items: [{
                        id: 101,
                        title: 'CURRENT_TRIPS',
                        show:true,
                        canSelect: true,
                        path: '/trips/current/' + languageId,
                        click: function (context) {
                            $location.url(context.path, true);
                        },
                        active: false
                    }, {
                        id: 102,
                        title: 'PAST_TRIPS',
                        show:true,
                        canSelect: true,
                        path: '/trips/past/' + languageId,
                        click: function (context) {
                            $location.url(context.path, true);
                        },
                        active: false
                    }, {
                        id: 103,
                        title: 'QUOTES',
                        show:true,
                        canSelect: true,
                        path: '/trips/quote/' + languageId,
                        click: function (context) {
                            $location.url(context.path, true);
                        },
                        active: false
                    }]
                }, {
                    id: 2,
                    title: 'MY_ACCOUNT',
                    show:true,
                    active: false,
                    items: [{
                        id: 201,
                        title: 'FINANCE_INFO',
                        show:true,
                        canSelect: true,
                        path: '/finance/' + languageId,
                        click: function (context) {
                            $location.url(context.path, true);
                        },
                        active: false
                    }, {
                        id: 202,
                        title: 'CHANGE_PASSWORD',
                        show:true,
                        canSelect: false,
                        message: 'OpenChangePasswordModal',
                        click: function (context) {
                            $rootScope.$broadcast(context.message);
                        },
                        active: false
                    }, {
                        id: 203,
                        title: 'REGISTER',
                        show:(SessionService.roleId() == "Manager"),
                        canSelect: false,
                        message: 'OpenRegisterModal',
                        click: function (context) {
                            $rootScope.$broadcast(context.message);
                        },
                        active: false
                    }]
                }];

                function findItem(id) {
                    var selectedItem;
                    modules.angular.forEach($scope.menuItems, function (group, groupIndex) {
                        modules.angular.forEach(group.items, function (item, itemIndex) {
                            if (modules.angular.isString(id)) {
                                if (item.path && item.path.indexOf(id) == 0) {
                                    selectedItem = item;
                                }
                            } else {
                                if (item.id == id) {
                                    selectedItem = item;
                                }
                            }
                        });
                    });
                    return selectedItem;
                }

                $scope.clickMenuItem = function (id) {
                    var selectedItem = findItem(id);
                    if (selectedItem.canSelect) {
                        setMenuItemClass(selectedItem);
                    }
                    if (selectedItem != null) {
                        selectedItem.click(selectedItem);
                    }
                };

                function setMenuItemClass(selectedItem) {
                    modules.angular.forEach($scope.menuItems, function (group, groupIndex) {
                        modules.angular.forEach(group.items, function (item, itemIndex) {
                            item.active = (item == selectedItem);
                            group.active = item.active;
                        });
                    });
                }

                $scope.$on('LOGOUT', function (event, data) {
                    $window.location.href = SessionService.config().webRoot + 'home.html#/' + languageId;
                });

                function load() {
                    if (SessionService.user() == null) {
                        $window.location.href = SessionService.config().webRoot + 'home.html#/' + languageId;
                    }

                    var selectedItem = findItem($location.path());
                    if(selectedItem && selectedItem.canSelect) {
                        setMenuItemClass(selectedItem);
                    }
                }

                load();

            }]);

    return modules;
});

