define(['app/modules'], function (modules) {
    'use strict';
    modules.services
        .factory('CacheService', function (_) {

            var cachedData = [];

            var cache = {};

            function findData(url, method, param) {
                var index = -1;
                var find = _.find(cachedData,function(item) {
                    index ++;
                    if(item.url == url && item.method == method) {
                        if(_.isObject(param)){
                            return _.isEqual(param, item.param);
                        } else {
                            return (param === item.param)
                        }
                    } else {
                        return false;
                    }
                });
                if(find)
                    return index;
                else
                    return -1;
            }

            cache.put = function(url, method, param, data) {
                var find = findData(url, method, param);
                if(find >= 0) {
                    cachedData.splice(find, 1);
                }

                cachedData.push({
                    url:url,
                    method:method,
                    param:param,
                    data:data
                });
            };

            cache.remove = function(url, method, param) {
                var find = findData(url, method, param);
                if(find >= 0) {
                    cachedData.splice(find, 1);
                }
            };

            cache.get = function(url, method, param) {
                var find = findData(url, method, param);
                if(find >= 0)
                    return cachedData[find].data;
                else
                    return null;
            };

            return cache;
        });

    return modules;
});