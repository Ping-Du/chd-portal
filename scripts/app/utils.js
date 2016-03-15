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

