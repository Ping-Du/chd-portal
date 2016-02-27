define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('AccountService', ['$http', '$q', 'SessionService', function ($http, $q, SessionService) {

            return {
                isAuthorized: function () {
                    return ( SessionService.token() != null);
                },
                getUserName: function () {
                    var deferred = $q.defer();
                    $http({
                        method: 'GET',
                        url:  SessionService.config().apiRoot + 'account/UserName'
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.user(data)
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                register: function (userName, email, firstName, lastName, password, confirmPassword, secretCode, role, agency) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "Email": email,
                        "FirstName": firstName,
                        "LastName": lastName,
                        "Password": password,
                        "ConfirmPassword": confirmPassword,
                        "SecretCode": secretCode,
                        "Role": role,
                        "Agency": agency,
                        "UrlToConfirmationPage": SessionService.config().webRoot + 'account/confirm-email.html'
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/Register',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.user(userName);
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                login: function (userName, password) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "Password": password
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/Login',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.user(data.userName);
                        SessionService.password(password);
                        SessionService.userToken(data.access_token);
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                logout: function () {
                    var deferred = $q.defer();
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/Logout'
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.user(null);
                        SessionService.password(null);
                        SessionService.userToken(null);
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                setPassword: function (newPassword, confirmPassword) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "NewPassword": newPassword,
                        "ConfirmPassword": confirmPassword
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/SetPassword',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.password(newPassword);
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                forgotPassword: function (userName) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "SecretCode": SessionService.config().secretCode,
                        "UrlToResetPage": SessionService.config().webRoot + 'account/reset-password.html'
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/ForgotPassword',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        SessionService.user(null);
                        SessionService.password(null);
                        SessionService.userToken(null);
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                confirmEmail: function (userId, code) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "UserID": userId,
                        "Code": code
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/ConfirmEmail',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                resetPassword: function (userName, newPassowrd, confirmPassword, code, redirectUrl) {
                    var deferred = $q.defer();
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "Password": newPassowrd,
                        "ConfirmPassword": confirmPassword,
                        "Code": code,
                        "RedirectToUrl": redirectUrl
                    });
                    $http({
                        method: 'POST',
                        url: SessionService.config().apiRoot + 'account/ConfirmEmail',
                        data: requestData
                    }).success(function (data/*, status, headers, cfg*/) {
                        deferred.resolve(data);
                    }).error(function (data/*, status, headers, cfg*/) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                }


            };
        }]);

    return modules;
});
