String.prototype.Trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
String.prototype.LTrim = function () {
    return this.replace(/(^\s*)/g, "");
};
String.prototype.RTrim = function () {
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

var serviceTypes = [
    {id: "ACTIV", type: 'activities'},
    {id: "ATTAD", type: 'activities'},
    {id: "BST", type: 'activities'},
    {id: "CNCRT", type: 'activities'},
    {id: 'DINE', type: 'activities'},
    {id: 'GOLF', type: 'activities'},
    {id: 'GREET', type: 'activities'},
    {id: 'SHOW', type: 'activities'},
    {id: 'THMPK', type: 'activities'},
    {id: 'SHW-D', type: 'activities'},
    {id: 'WED', type: 'activities'},
    {id: 'TIC', type: 'activities'},
    {id: 'ART', type: 'tours'},
    {id: 'SIC', type: 'tours'},
    {id: 'EXCUR', type: 'tours'},
    {id:'HOP', type:'transportation'},
    {id:'PPT', type:'transportation'},
    {id:'SHTTL', type:'transportation'},
    {id:'T-IN', type:'transportation'},
    {id:'T-OUT', type:'transportation'},
    {id:'TRANS', type:'transportation'}
];

function getServiceType(serviceTypeId) {
    for (var i = 0; i < serviceTypes.length; i++) {
        if (serviceTypes[i].id == serviceTypeId)
            return serviceTypes[i].type;
    }
    return "unknown";
}
function getServiceId(serviceType) {
    //if(serviceType == 'activities')
    //    return 'ATTAD';

    var type = '';
    for (var i = 0; i < serviceTypes.length; i++) {
        if (serviceTypes[i].type == serviceType) {
            if(type != '')
                type += ',';

            type += "'" + serviceTypes[i].id +"'";
        }
    }
    return type;
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

function GetHotelGuestsInfo(guests, languageId) {
    var rooms = guests.length, adults = 0, minors = 0;
    for (var i = 0; i < guests.length; i++) {
        adults += parseInt(guests[i].Adults);
        minors += guests[i].MinorAges.length;
    }

    var rtn = '';
    if(languageId == 'CHI') {
        rtn = rooms + '间房 ' + adults + '成人 ';
        if(minors > 0)
            rtn += ( minors + '儿童');
    }
    else {
        rtn = rooms + ' room(s) ' + adults + ' adult(s) ';
        if(minors > 0)
            rtn += ( minors + ' minor(s)');
    }

    return rtn;
}

function GetServiceGuestsInfo(guests, languageId) {
    if(languageId == 'CHI')
        return ((guests.Adults.Trim() == '' ? '0' : guests.Adults) + '成人 ' + (guests.MinorAges.length > 0?guests.MinorAges.length + '儿童':''));
    else
        return ((guests.Adults.Trim() == '' ? '0' : guests.Adults) + ' adult(s) ' + (guests.MinorAges.length>0?guests.MinorAges.length + ' minor(s)':''));
}


function GuestsToHotelArray(guests) {
    var rooms = [];
    for (var i = 0; i < guests.length; i++) {
        rooms.push({
            Guests: {
                Adults: parseInt(guests[i].Adults),
                MinorAges: []
            }
        });

        for (var j = 0; j < guests[i].MinorAges.length; j++) {
            rooms[i].Guests.MinorAges.push(parseInt(guests[i].MinorAges[j]));
        }
    }
    return rooms;
}

function GuestsToServiceCriteria(guests) {
    var obj = {
        Adults: (guests.Adults.Trim() == '' ? 0 : parseInt(guests.Adults)),
        MinorAges: []
    };
    for (var i = 0; i < guests.MinorAges.length; i++) {
        obj.MinorAges.push(parseInt(guests.MinorAges[i]));
    }

    return obj;
}

function DayDiff(startDate, endDate) {
    return (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000);
}

function addDays(startDate, days) {
    return new Date(startDate.valueOf() + days * 24 * 3600000);
}

function makePriceString(lowPrice, highPrice) {

    if (lowPrice == highPrice)
        return '$' + lowPrice;
    else
        return '$' + lowPrice + ' - $' + highPrice;
}

function clearEmptyAddress(address) {
    if(address) {
        address.Address1 = address.Address1.Trim();
        address.Address2 = address.Address2.Trim();
        address.Address3 = address.Address3.Trim();
        address.City = address.City.Trim();
        address.State = address.State.Trim();
        if (address.Country == null)
            address.Country = "";
        else
            address.Country = address.Country.Trim();
        address.Zip = address.Zip.Trim();
    } else {
        address.Address1 = '';
        address.Address2 = '';
        address.Address3 = '';
        address.City = "";
        address.State = "";
        address.Country = "";
        address.Zip = "";
    }
}

function getImageByServiceType(serviceType) {
    switch (serviceType) {
        case
        'hotels'
        :
            return 'hotel.png';
        case
        'activities'
        :
            return 'activity.png';
        case
        'tours'
        :
            return 'tour.png';
        case
        'transportation'
        :
            return 'transportation.png';
        case
        'packages'
        :
            return 'packages.png';
    }
}


