
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

function ValidateHotelGuestsInfo(guests, lastNameRequired, firstNameRequired) {
    var result = {
        hasError:false,
        rooms:0,
        adults:0,
        children: 0,
        message:""
    };

    for (var g = 0; g < guests.length; g++) {
        result.rooms++;
        if(lastNameRequired) {
            guests[g].lastName = guests[g].lastName.Trim();
            if(guests[g].lastName == '') {
                guests[g].lastNameError = true;
                result.hasError = true;
            } else{
                guests[g].lastNameError=false;
            }
        } else {
            guests[g].lastNameError = false;
        }

        if(firstNameRequired) {
            guests[g].firstName = guests[g].firstName.Trim();
            if(guests[g].firstName == '') {
                guests[g].firstNameError = true;
                result.hasError = true;
            } else{
                guests[g].firstNameError=false;
            }
        } else {
            guests[g].firstNameError = false;
        }

        guests[g].ages = guests[g].ages.replace(/\s/g,'');
        if(guests[g].ages != '') {
            var ages = guests[g].ages.split(',');
            for(var j = 0; j < ages.length; j++) {
                if (!IsInteger(ages[j])) {
                    guests[g].agesError = true;
                    result.hasError = true;
                } else {
                    if (parseInt(ages[j]) <= 17 || parseInt(ages[j]) > 100) {
                        guests[g].agesError = true;
                        result.hasError = true;
                    }
                    else {
                        guests[g].agesError = false;
                    }
                }
            }
            result.adults += ages.length;
        } else {
            result.hasError = true;
            guests[g].agesError = true;
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

function ValidateServiceGuestsInfo(guests, lastNameRequired, firstNameRequired) {
    var result = {
        hasError:false,
        adults:0,
        children: 0,
        message:""
    };

    for (var g = 0; g < guests.length; g++) {
        result.adults++;
        if(lastNameRequired) {
            guests[g].lastName = guests[g].lastName.Trim();
            if(guests[g].lastName == '') {
                guests[g].lastNameError = true;
                result.hasError = true;
            } else{
                guests[g].lastNameError=false;
            }
        } else {
            guests[g].lastNameError = false;
        }

        if(firstNameRequired) {
            guests[g].firstName = guests[g].firstName.Trim();
            if(guests[g].firstName == '') {
                guests[g].firstNameError = true;
                result.hasError = true;
            } else{
                guests[g].firstNameError=false;
            }
        } else {
            guests[g].firstNameError = false;
        }

        guests[g].ages = guests[g].ages.replace(/\s/g,'');
        if(guests[g].ages != '') {
                if (!IsInteger(guests[g].ages)) {
                    guests[g].agesError = true;
                    result.hasError = true;
                } else {
                    if (parseInt(guests[g].ages) <= 17 || parseInt(guests[g].ages) > 100) {
                        guests[g].agesError = true;
                        result.hasError = true;
                    }
                    else {
                        guests[g].agesError = false;
                    }
                }
        } else {
            result.hasError = true;
            guests[g].agesError = true;
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
                Adults: item.ages.split(',').length,
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


