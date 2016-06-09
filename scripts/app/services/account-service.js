define(['app/services/session-service'], function (modules) {
    'use strict';
    modules.services
        .service('AccountService', ['$http', '$q', 'SessionService', function ($http, $q, SessionService) {

            function invoke(url, method, requestData, type, userName, password) {
                var deferred = $q.defer();
                $http({
                    method: method,
                    url: SessionService.config().apiRoot + 'account' + url,
                    data: requestData
                }).success(function (data/*, status, headers, cfg, statuesText*/) {
                    switch(type){
                        case 1:// getUserName
                            SessionService.user(data);
                            break;
                        case 2:// Register
                            SessionService.user(userName);
                            break;
                        case 3:// Login
                            SessionService.user(userName);
                            SessionService.token(data.access_token);
                            //invoke('/UserProperties','GET',null, 10);
                            break;
                        case 4://logout
                        case 6://reset password
                            SessionService.user(null);
                            SessionService.token(null);
                            break;
                        case 5://set password
                            SessionService.password(newPassword);
                            break;
                        case 10://
                            SessionService.roleId(data.AspNetRoles_Id);
                            SessionService.agencyNo(data.Agy_No);
                            break;
                    }
                    deferred.resolve(data);
                }).error(function (data, status/*, headers, cfg, statusText*/) {
                    switch(type) {
                        case 3: // login
                            SessionService.user(null);
                            SessionService.token(null);
                    }
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            return {
                isAuthorized: function () {
                    return ( SessionService.token() != null);
                },
                getUserName: function () {
                    return invoke('/UserName', 'GET', null, 1);
                },
                register: function (userName, email, firstName, lastName, password, confirmPassword) {
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "Email": email,
                        "FirstName": firstName,
                        "LastName": lastName,
                        "Password": password,
                        "ConfirmPassword": confirmPassword,
                        "SecretCode": 'T0pS3cr3t',
                        "Role": (SessionService.user?'agent':'consumer'),
                        "Agency": SessionService.agencyNo(),
                        "UrlToConfirmationPage": (SessionService.config().webRoot + 'account.html#/confirm-email/'+SessionService.languageId())
                    });
                    return invoke('/Register', 'POST', requestData, 2, userName);
                },
                login: function (userName, password) {
                    var requestData = modules.angular.toJson({
                        "Username": userName,
                        "Password": password
                    });
                    return invoke('/Login', 'POST', requestData, 3, userName, password);
                },
                logout: function () {
                    return invoke('/Logout', 'POST', null, 4);
                },
                setPassword: function (newPassword, confirmPassword) {
                    var requestData = modules.angular.toJson({
                        "NewPassword": newPassword,
                        "ConfirmPassword": confirmPassword
                    });
                    return invoke('/SetPassword', 'POST', requestData, 5);
                },
                forgotPassword: function (userName) {
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "SecretCode": SessionService.config().secretCode,
                        "UrlToResetPage": (SessionService.config().webRoot + 'account.html#/reset-password/'+SessionService.languageId())
                    });
                    return invoke('/ForgotPassword', 'POST', requestData, 6);
                },
                confirmEmail: function (userId, code) {
                    var requestData = modules.angular.toJson({
                        "UserID": userId,
                        "Code": code
                    });
                    return invoke('/ConfirmEmail', 'POST', requestData, 7);
                },
                resetPassword: function (userName, newPassowrd, confirmPassword, code, redirectUrl) {
                    var requestData = modules.angular.toJson({
                        "UserName": userName,
                        "Password": newPassowrd,
                        "ConfirmPassword": confirmPassword,
                        "Code": code,
                        "RedirectToUrl": redirectUrl
                    });
                    return invoke('/ResetPassword', 'POST', requestData, 8);
                },
                getFinanceInfo:function(){
                    return invoke('/FinanceInfo', 'GET', null, 9);
                },
                getUserProperties:function() {
                    return invoke('/UserProperties','GET',null, 10);
                }
            };
        }]);

    return modules;
});
