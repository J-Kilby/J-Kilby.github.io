//initialising global variables
var lat, lon, placeName, alaResult;

//Set Lat Lon
//use # in url if present
if (window.location.hash !== "") {
    var hash;
    
    //retrive lat lon from hash
    hash = window.location.hash.substr(1).split(",")
    
    lat = hash[0];
    lon = hash[1];
    
    //display lat lon on page
    $("#latLon").html("#" + lat + ", " + lon)
    
    //get data
    getPlaceName();
    searchALA();
} else {
    //else use geolocation
    console.log(navigator);
    console.log(navigator.platform);
    navigator.geolocation.getCurrentPosition(function(position) {console.log("poop")});
    
    if ("geolocation" in navigator) {
        $("#latLon").html("geolocation available");
        navigator.geolocation.getCurrentPosition(function(position) {
            $("#latLon").html("geolocation readable");
            
            lat = position.coords.latitude; 
            lon = position.coords.longitude;
            
            //display lat lon on page
            $("#latLon").html("#" + lat + ", " + lon);
            
            //get data
            getPlaceName();
            searchALA();
        });
    } else {
        //else us ip-api
        $.getJSON("http://ip-api.com/json", function(data) {
            lat = data.lat;
            lon = data.lon;
            
            //display lat lon on page
            $("#latLon").html("#" + lat + ", " + lon);
            
            //get data
            getPlaceName();
            searchALA();
        });
    };
};



function getPlaceName(){
    $.getJSON("https://locationiq.org/v1/reverse.php?format=json&key=d9468055045db628123d&lat="+lat+"&lon="+lon+"&zoom=16", function(data) {
        console.log(data);
        placeName = data.display_name;
        
        //display geographic name
        $("#location").html(placeName);
    });
}

function searchALA(){
    $.getJSON("https://biocache.ala.org.au/ws/occurrences/search?lat=" + lat + "&lon=" + lon + "&radius=1&facets=common_name", function(data) {
        alaResult = data;
        console.log(alaResult);
        
        //place ala data into page
        tmpPlaceData();
    });
}

function tmpPlaceData(){
    for (i=0; i+1 < alaResult.facetResults[0].fieldResult.length; i++) {
        $("#imageGrid").append("<li>" + alaResult.facetResults[0].fieldResult[i].label + "</li>")
    };
};




//wikipedia api call to get the thumbnail image from a specific page

//https://en.wikipedia.org/w/api.php?action=query&titles=" + Common_name + "&prop=pageimages&format=json&pithumbsize=300

//still need to get the api call to find the relevant page based on the ala data