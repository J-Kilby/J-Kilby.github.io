//initialising global variables
var lat, lon, placeName, alaResult, animals;

//Set Lat Lon
//use # in url if present
if (window.location.hash !== "") {
    var hash;
    
    //retrive lat lon from hash
    hash = window.location.hash.substr(1).split(",")
    
    lat = hash[0];
    lon = hash[1];
    
    //display lat lon on page
    /*$("#latLon").html("#" + lat + ", " + lon)*/
    
    //get data
    getPlaceName();
    searchALA();
} else {
    //else use geolocation
    if ("geolocation" in navigator) {
        $("#latLon").html("geolocation available");
        navigator.geolocation.getCurrentPosition(function(position) {
            $("#latLon").html("geolocation readable");
            
            lat = position.coords.latitude; 
            lon = position.coords.longitude;
            
            //display lat lon on page
            /*$("#latLon").html("#" + lat + ", " + lon);*/
            
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
            /*$("#latLon").html("#" + lat + ", " + lon);*/
            
            //get data
            getPlaceName();
            searchALA();
        });
    };
};



function getPlaceName(){
    $.getJSON("https://locationiq.org/v1/reverse.php?format=json&key=d9468055045db628123d&lat="+lat+"&lon="+lon+"&zoom=16", function(data) {
        placeName = data.display_name;
        
        //display geographic name
        $(".locationaddress").html(placeName);
    });
}

function searchALA(){
    $.getJSON("https://biocache.ala.org.au/ws/occurrences/search?lat=" + lat + "&lon=" + lon + "&radius=1&facet=off&pageSize=200", function(data) {
        alaResult = data;
        console.log(alaResult);
        
        //place ala data into page
        processData();
        getImages();
    });
}

function tmpPlaceData(){
    var skippedAnimals = 0;
    for (i=0; i+1 < animals.images.length; i++) {
        
        var factor = (i-skippedAnimals)%2,
            side;
        
        if (factor == 0){side = "right"} else {side = "left"}
        
        if (animals.images[i] != "no image"){
            $("#speciesphotos").append("<a class=\"linker\"><img class=\"" + side + "img\" src=\"" + animals.images[i] + "\" alt=\"" + animals.animalList[i] + "\"></a>");
        } else {skippedAnimals += 1;}
    };
};

function processData(){
    animals = new Object();
    animals.animalList = [];
    
    for (i=0; i<alaResult.occurrences.length; i++){
        var record = alaResult.occurrences[i];
        
        if (record.raw_vernacularName != undefined){
            var reName = record.raw_vernacularName.toLowerCase().replace(/ /g,"_");
        } else if (record.vernacularName != undefined){
            reName = record.vernacularName.toLowerCase().replace(/ /g,"_");
        } else {continue};
        
        if (animals[reName] == undefined) {
            animals[reName] = {
                commonName: reName.replace(/_/g," "),
                scientificName: record.raw_scientificName,
                kingdom: record.kingdom,
                class: record.classs,
                years: [record.year],
                source: record.dataResourceName
            };
            animals.animalList.push(reName);
        } else {animals[reName].years.push(record.year)};
    };
}

function getImages() {
    var images = [];
    for (i=0; i<animals.animalList.length; i++){
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&titles="+ addCap(animals.animalList[i]) +"&prop=pageimages&format=json&pithumbsize=300",
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function(data) {
                var pageID;
                for (var key in data.query.pages) {
                    pageID = key;
                }
                if (data.query.pages[pageID].thumbnail != undefined) {
                    images.push(data.query.pages[pageID].thumbnail.source);
                } else {images.push("no image")}
            },
            error: function() {console.log("Error for" + animals.animalList[i])}
        });
    }
    animals.images = images;
};

function addCap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

$(window).load(function ()
{
    var i = setInterval(function () {
        console.log(animals.images[3]);
        if (animals.images[animals.animalList.length-1] != undefined) {
            clearInterval(i);
            tmpPlaceData();
        }
    }, 300);
});