define(['app/modules'], function (modules) {
    'use strict';
    modules.services
        .provider('HeaderService', function () {
            var cfg = {
              showSearchBox:true,
                showLanguage:true,
                showAccount:true
            };
            this.showSearchBox = function(value) {
                cfg.showSearchBox = value;
            };
            this.showLanguage = function(value) {
                cfg.showLanguage = value;
            };
            this.showAccount = function(value) {
                cfg.showAccount = value;
            };

            this.$get = function () {
                var self = this;
                return {
                    showSearchBox:cfg.showSearchBox,
                    showLanguage:cfg.showLanguage,
                    showAccount:cfg.showAccount
                };
            };
        });

    return modules;
});
