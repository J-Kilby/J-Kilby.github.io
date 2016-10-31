//initialising global variables
var lat, lon, placeName, alaResult, animals, blank;



/*---------------------*\
  Finding Your Location
\*---------------------*/

//Set Lat Lon
//use # in url if present
if (window.location.hash !== "") {
    var hash;
    
    //retrive lat lon from hash
    hash = window.location.hash.substr(1).split(",")
    
    lat = hash[0];
    lon = hash[1];
    
    //get data
    getPlaceName();
    
    if (lat.substring(0,6) + ":" + lon.substring(0,6) == localStorage.getItem('lastALAlocation')) {
        bypassAPIs();
    } else {
        searchALA();
    }
} else {
    //else use geolocation
    if ("geolocation" in navigator) {
        $("#latLon").html("geolocation available");
        navigator.geolocation.getCurrentPosition(function(position) {
            $("#latLon").html("geolocation readable");
            
            lat = position.coords.latitude.toString(); 
            lon = position.coords.longitude.toString();
            
            //display lat lon on page
            /*$("#latLon").html("#" + lat + ", " + lon);*/
            
            //get data
            getPlaceName();
            
            if (lat.substring(0,6) + ":" + lon.substring(0,6) == localStorage.getItem('lastALAlocation')) {
                bypassAPIs();
            } else {
                searchALA();
            }
        });
    } else {
        //else us ip-api
        $.getJSON("http://ip-api.com/json", function(data) {
            lat = data.lat;
            lon = data.lon;
            
            //get data
            getPlaceName();
            
            if (lat.substring(0,6) + ":" + lon.substring(0,6) == localStorage.getItem('lastALAlocation')) {
                bypassAPIs();
            } else {
                searchALA();
            }
        });
    };
};

function getPlaceName(){
    $.getJSON("https://locationiq.org/v1/reverse.php?format=json&key=d9468055045db628123d&lat="+lat+"&lon="+lon+"&zoom=16", function(data) {        
        placeName = data.display_name.split(',')[0]
        if (data.address.suburb != undefined) {
            placeName +=  ", " + data.address.suburb
        };
        if (data.address.county != undefined) {
            placeName +=  ", " + data.address.county
        };
        
        //display geographic name
        $(".locationaddress").html(placeName);
    });
}



/*----------------------------*\
  Data Retrival and Processing
\*----------------------------*/

    function bypassAPIs(){
        console.log("GOT IT FROM LOCAL STORAGE");
        $("#loadingMessage").html("Remembering Life Near You");
        animals = JSON.parse(localStorage.getItem('animals'));

        //place ala data into page
        placeImages();
    }

//get nearby nature from the ALA
function searchALA(){
    $("#loadingMessage").html("Searching for Life Near You");
    $.getJSON("https://biocache.ala.org.au/ws/occurrences/search?lat=" + lat + "&lon=" + lon + "&radius=1&facet=off&pageSize=200", function(data) {
        localStorage.setItem('lastALAlocation', lat.substring(0,6) + ":" + lon.substring(0,6));
        alaResult = data;
        
        //place ala data into page
        processData();
        getImages();
    });
};

//process the ALA data into a usefull format
function processData(){
    console.log("PROCESSING DATA");
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

//find images for Animals from Wikipedia
function getImages() {
    $("#loadingMessage").html("Finding Cute Animal Pictures");
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
                if (data.query == undefined){return}
                if (data.query.pages[pageID].thumbnail != undefined) {
                    images.push(data.query.pages[pageID].thumbnail.source);
                    animals[data.query.normalized[0].from.toLowerCase()].image = data.query.pages[pageID].thumbnail.source;
                } else {
                    images.push("no image");
                    animals[data.query.normalized[0].from.toLowerCase()].image = "no image";
                }
            },
            error: function() {console.log("wikiImg error!")}
        });
    }
    
    animals.images = images;
};

function addCap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



/*-------------------------------------*\
  Place and Manipualte Data on the Page
\*-------------------------------------*/

function placeImages(){
    var skippedAnimals = 0;
    for (i=0; i+1 < animals.images.length; i++) {
        
        var factor = (i-skippedAnimals)%2,
            side;
        
        if (factor == 0){side = "right"} else {side = "left"}
        
        if (animals[animals.animalList[i]].image != "no image" && animals[animals.animalList[i]].image != undefined){
            $("#speciesphotos").append("<a class=\"linker\" data-animal=\"" +animals.animalList[i]+ "\"><img class=\"" + side + "img\" src=\"" + animals[animals.animalList[i]].image + "\" alt=\"" + animals.animalList[i] + "\"></a>");
        } else {skippedAnimals += 1;}
    };
    
    localStorage.setItem('animals', JSON.stringify(animals));
    
    $("#speciesphotos > *").click( function(){
        openSpeciesPage(this.dataset.animal);
    })
};

function openSpeciesPage(animal){
    var speciesImage = document.getElementById("speciesimage");
    speciesImage.alt = animal;
    speciesImage.src = animals[animal].image;
    $("#name").html(animals[animal].commonName);
    var description;
    
    $.ajax({
            url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+animal,
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function(data) {
                var pageID;
                for (var key in data.query.pages) {
                    pageID = key;
                }
                if (data.query == undefined){
                    $("#content").html("Error loading Desciption");
                    return
                }
                if (data.query.pages[pageID].extract != undefined) {
                    $("#content").html(data.query.pages[pageID].extract);
                } else {
                    $("#description").html("Error loading Desciption");
                }
            },
            error: function() {console.log("wikiExtract error!")}
        });
    $("#speciesPage").fadeIn();
}

$(".closeBtn").click(function(){
    $("#speciesPage").fadeOut();
})



/*--------------*\
  Time Handeling 
\*--------------*/

$(window).load(function ()
{
    var i = setInterval(function () {
        console.log("loading...");
        if (animals.images != undefined) {
            if (animals.images[animals.animalList.length-1] != undefined) {
                clearInterval(i);
                placeImages();
                $("#backgroundlanding").fadeOut();
            }
        }
    }, 1000);
});