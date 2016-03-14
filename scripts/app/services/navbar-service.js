define(['app/modules'], function (modules) {
    'use strict';
    modules.services
        .provider('NavbarService', function () {
            this.activeItem = '';
            this.setActiveItem = function (item) {
                if (item)
                    this.activeItem = item;
            };
            this.$get = function () {
                var self = this;
                return {
                    isActiveItem: function (item) {
                        return (self.activeItem === item);
                    },
                    getActiveItem: function () {
                        return self.activeItem;
                    },
                    setActiveItem: function(item) {
                        self.activeItem = item;
                    }
                };
            };
        });

    return modules;
});