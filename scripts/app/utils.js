
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
    window.scrollTo(scrollPos.x, scrollPos.y - 50);
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

function GetHotelGuestsInfo(guests) {
    var rooms = guests.length, adults = 0, minors = 0;
    for(var i = 0; i < guests.length; i++) {
        adults += parseInt(guests[i].Adults);
        minors += guests[i].MinorAges.length;
    }

    return ( rooms + ' room(s) ' + adults + ' adult(s) ' + minors + ' minor(s)');
}

function GetServiceGuestsInfo(guests) {
    return ((guests.Adults.Trim()==''?'0':guests.Adults) + ' adult(s) ' + guests.MinorAges.length + ' minor(s)');
}


function GuestsToHotelArray(guests) {
    var rooms = [];
    for(var i = 0; i < guests.length; i++) {
        rooms.push({
            Guests: {
                Adults: parseInt(guests[i].Adults),
                MinorAges: []
            }
        });

        for(var j = 0; j < guests[i].MinorAges.length; j++) {
            rooms[i].Guests.MinorAges.push(parseInt(guests[i].MinorAges[j]));
        }
    }
    return rooms;
}

function GuestsToServiceCriteria(guests) {
    var obj = {
        Adults:(guests.Adults.Trim() == ''?0:parseInt(guests.Adults)),
        MinorAges:[]
    };
    for(var i = 0; i < guests.MinorAges.length; i++) {
        obj.MinorAges.push(parseInt(guests.MinorAges[i]));
    }

    return obj;
}

function DayDiff(startDate, endDate) {
    return (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000);
}

function addDays(startDate, days) {
    return new Date(startDate.valueOf() + days * 24* 3600000);
}

function makePriceString(lowPrice, highPrice) {

    if(lowPrice == highPrice)
        return '$'+lowPrice;
    else
        return '$'+lowPrice+' - $'+highPrice;
}

function clearEmptyAddress(address) {
    address.Address1 = address.Address1.Trim();
    address.Address2 = address.Address2.Trim();
    address.Address3 = address.Address3.Trim();
    address.City = address.City.Trim();
    address.State = address.State.Trim();
    if(address.Country == null)
        address.Country = "";
    else
        address.Country = address.Country.Trim();
    address.Zip = address.Zip.Trim();
}


