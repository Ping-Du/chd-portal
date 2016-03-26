
String.prototype.Trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
String.prototype.LTrim = function(){
    return this.replace(/(^\s*)/g, "");
};
String.prototype.RTrim = function() {
    return this.replace(/(\s*$)/g, "");
};

function elementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop = obj.offsetTop;
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }
    }
    return {x: curleft, y: curtop};
}

function scrollToControl(id) {
    var elem = document.getElementById(id);
    var scrollPos = elementPosition(elem);
    window.scrollTo(scrollPos.x, scrollPos.y);
}

function initMap(lat, lng, title) {
    var myLatLng = {lat: lat, lng: lng};

    var map = new google.maps.Map(document.getElementById('map_canvas'), {
        zoom: 15,
        center: myLatLng
    });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: title
    });
}

function getServiceType(serviceTypeId, byName) {
    var serviceTypes = [
        {id:"SHOW",name: 'shows'},
        {id:"ATTAD",name: 'activities'},
        {id:'DINE',name:'dining'},
        {id:'SHTTL',name:'tours'}
    ];

    for(var i = 0; i < serviceTypes.length; i++) {
        if(!byName) {
            if (serviceTypes[i].id == serviceTypeId)
                return serviceTypes[i].name;
        } else {
            if(serviceTypes[i].name == serviceTypeId) {
                return serviceTypes[i].id;
            }
        }
    }

    return "unknown";
}

function IsInteger(s) {
    if (s != null) {
        var r, re;
        re = /\d+/i; //\d表示数字,*表示匹配多个数字
        r = s.match(re);
        return (r == s) ? true : false;
    } else {
        return false;
    }
}

function ValidateHotelGuestsInfo(guests) {
    var result = {
        hasError:false,
        rooms:0,
        adults:0,
        children: 0,
        message:""
    };

    for (var g = 0; g < guests.length; g++) {
        result.rooms++;
        guests[g].adults = guests[g].adults.replace(/\s/g,'');
        if(guests[g].adults != '') {
                if (!IsInteger(guests[g].adults)) {
                    guests[g].adultsError = true;
                    result.hasError = true;
                } else {
                    if (parseInt(guests[g].adults) <= 0 || parseInt(guests[g].adults) > 10) {
                        guests[g].adultsError = true;
                        result.hasError = true;
                    }
                    else {
                        guests[g].adultsError = false;
                        result.adults += parseInt(guests[g].adults);
                    }
                }
        } else {
            result.hasError = true;
            guests[g].adultsError = true;
        }

        guests[g].minors = guests[g].minors.replace(/\s/g,'');
        if (guests[g].minors != '') {
            var minors = guests[g].minors.split(',');
            for (var i = 0; i < minors.length; i++) {
                if (!IsInteger(minors[i])) {
                    guests[g].minorsError = true;
                    result.hasError = true;
                } else {
                    if (parseInt(minors) > 17) {
                        guests[g].minorsError = true;
                        result.hasError = true;
                    } else {
                        guests[g].minorsError = false;
                    }
                }
            }
            result.children += minors.length;
        }
    }
    result.message = result.rooms + ' room(s) ' + result.adults + ' adult(s) ' + result.children + ' minor(s)';
    return result;
}

function ValidateServiceGuestsInfo(guests) {
    var result = {
        hasError:false,
        adults:0,
        children: 0,
        message:""
    };

    for (var g = 0; g < guests.length; g++) {
        result.adults++;
        guests[g].minors = guests[g].minors.replace(/\s/g,'');
        if (guests[g].minors != '') {
            var minors = guests[g].minors.split(',');
            for (var i = 0; i < minors.length; i++) {
                if (!IsInteger(minors[i])) {
                    guests[g].minorsError = true;
                    result.hasError = true;
                } else {
                    if (parseInt(minors) > 17) {
                        guests[g].minorsError = true;
                        result.hasError = true;
                    } else {
                        guests[g].minorsError = false;
                    }
                }
            }
            result.children += minors.length;
        }
    }
    result.message = result.adults + ' adult(s) ' + result.children + ' minor(s)';
    return result;
}


function GuestsToArray(guests) {
    var rooms = [];
    for(var i = 0; i < guests.length; i++) {
        var item = guests[i];
        var minors = [];
        if(item.minors != '')
            minors = item.minors.split(',');
        for(var j = 0; j < minors.length; j++) {
            minors[j] = parseInt(minors[j]);
        }
        rooms.push({
            Guests: {
                Adults: parseInt(item.adults),
                MinorAges: minors
            }
        });
    }
    return rooms;
}

function GuestsToServiceCriteria(guests) {
    var obj = {
        Adults:guests.length,
        MinorAges:[]
    };
    for(var i = 0; i < guests.length; i++) {
        var item = guests[i];
        var minors = [];
        if(item.minors != '')
            minors = item.minors.split(',');
        for(var j = 0; j < minors.length; j++) {
            obj.MinorAges.push(parseInt(minors[j]));
        }
    }

    return obj;
}

function DayDiff(startDate, endDate) {
    return (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000);
}


