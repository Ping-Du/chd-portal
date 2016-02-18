define([ 'angular'], function (angular) {
    'use strict';
    var module = angular.module('chd.navbar',[]);
    module.provider('navbarService', function(){
        this.activeItem = '';
        this.setActiveItem = function(item) {
            if(item)
                this.activeItem = item;
        };
        this.$get = function() {
            var self = this;
            var service = {
                isActiveItem:function(item) {
                    return (self.activeItem === item);
                },
                getActiveItem:function(){
                    return self.activeItem;
                }
            };
            return service;
        };
    });
    return module;
});