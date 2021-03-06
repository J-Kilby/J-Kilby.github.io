//initialising global variables
var lat, lon, placeName, alaResult, animals, marker, radius = 1;

if (localStorage.getItem("radius") > 0 ) {
    console.log("problem?");
    radius = localStorage.getItem("radius");
    $("#radiusSelect").val(radius);
}

$.ajaxSetup({
  error: function(xhr, status, error) {
    alert("An AJAX error occured: " + status + "\nError: " + error);
  }
});

/*---------------------*\
  Finding Your Location
\*---------------------*/

//Set Lat Lon
//use # in url if present
if (window.location.hash !== "") {
    var hash;
    
    //retrive lat lon from hash
    hash = window.location.hash.substr(1).replace(/ /g,"").split(",")
    
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
    navigator.geolocation.getCurrentPosition(function(position) {
    
        lat = position.coords.latitude.toString(); 
        lon = position.coords.longitude.toString();
        
        //get data
        getPlaceName();
        
        if (lat.substring(0,6) + ":" + lon.substring(0,6) == localStorage.getItem('lastALAlocation')) {
            bypassAPIs();
        } else {
            searchALA();
        }
    }, function(error) {
        $.getJSON("https://api.ipify.org?format=json", function(ip){
            var ip = ip.ip;
            $.getJSON("https://freegeoip.net/json/" + ip, function(position) {
                lat = position.latitude.toString(); 
                lon = position.longitude.toString();

                //get data
                getPlaceName();

                if (lat.substring(0,6) + ":" + lon.substring(0,6) == localStorage.getItem('lastALAlocation')) {
                    bypassAPIs();
                } else {
                    searchALA();
                }
            });
        });
    });
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
    }

//get nearby nature from the ALA
function searchALA(){
    console.log("SEARCHING ALA");
    $("#loadingMessage").html("Searching for Life Near You");
    $.getJSON("https://biocache.ala.org.au/ws/occurrences/search?lat=" + lat + "&lon=" + lon + "&radius="+radius+"&facet=off&pageSize=2000", function(data) {
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
    animals.animalListSci = [];
    
    for (i=0; i<alaResult.occurrences.length; i++){
        
        var record = alaResult.occurrences[i];
        
        if (record.raw_vernacularName != undefined){
            var reName = record.raw_vernacularName.toLowerCase().replace(/ /g,"_");
        } else if (record.vernacularName != undefined){
            reName = record.vernacularName.toLowerCase().replace(/ /g,"_");
        } else {continue};
        
        if (record.raw_scientificNameName != undefined){
            var sciName = record.raw_scientificNameName.toLowerCase();
        } else if (record.scientificName != undefined){
            sciName = record.scientificName.toLowerCase();
        } else {continue};
        
        if (record.classs != undefined){
            var className = record.classs.toLowerCase();
        } else if (record.classs != undefined){
            className = "unknown";
        } else {continue};
        
        if (record.kingdom != undefined){
            var kingdomName = record.kingdom.toLowerCase();
        } else if (record.kingdom != undefined){
            kingdomName = "unknown";
        } else {continue};
        
        if (record.phylum != undefined){
            var phylumName = record.phylum.toLowerCase();
        } else if (record.phylum != undefined){
            phylumName = "unknown";
        } else {continue};
        
        if (record.order != undefined){
            var orderName = record.order.toLowerCase();
        } else if (record.order != undefined){
            orderName = "unknown";
        } else {continue};
        
        if (record.family != undefined){
            var familyName = record.family.toLowerCase();
        } else if (record.family != undefined){
            familyName = "unknown";
        } else {continue};
        
        if (animals[reName] == undefined) {
            animals[reName] = {
                commonName: reName.replace(/_/g," "),
                scientificName: sciName,
                kingdom: kingdomName,
                phylum: phylumName,
                class: className,
                order: orderName,
                family: familyName,
                years: [record.year],
                source: record.dataResourceName
            };
            
            animals.animalList.push(reName);
            animals.animalListSci.push(sciName.replace(/ /g,"_"));
        } else {animals[reName].years.push(record.year)};
    };
}

//find images for Animals from Wikipedia
function getImages() {
    console.log("FINDING IMAGES");
    $("#loadingMessage").html("Finding Cute Animal Pictures");
    var images = 0, imagesTwo = 0, imagesThree = 0, imagesFour = 0, progress = 0;
    
    for (i=0; i<animals.animalList.length; i++){
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&titles="+ animals.animalList[i] +"&prop=pageimages&format=json&pithumbsize=300",
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
                    images += 1;
                    animals[data.query.normalized[0].from].image = data.query.pages[pageID].thumbnail.source;
                    animals[data.query.normalized[0].from].wikiName = data.query.normalized[0].from;
                    progress += 1;
                    $("#loadingMessage").html("Finding Cute Animal Pictures - " + Math.round((progress/animals.animalList.length)*100) + "%");
                } else {
                    images += 1;
                    animals[data.query.normalized[0].from].image = "no image";
                }
            },
            error: function() {console.log("wikiImg error!")}
        });
    };
    
    var x = setInterval(function () {
        if (images == animals.animalList.length) {
            clearInterval(x);
            for (i=0; i<animals.animalList.length; i++){
                if (animals[animals.animalList[i]].image == "no image") {
                    $.ajax({
                        url: "https://en.wikipedia.org/w/api.php?action=query&titles="+ animals.animalListSci[i] +"&prop=pageimages&format=json&pithumbsize=300",
                        type: 'GET',
                        crossDomain: true,
                        dataType: 'jsonp',
                        success: function(data) {
                            var pageID;
                            for (var key in data.query.pages) {
                                pageID = key;
                            }
                            if (data.query == undefined){return}

                            function sciName(element){
                                return element == data.query.normalized[0].from;
                            }

                            if (data.query.pages[pageID].thumbnail != undefined) {
                                imagesTwo += 1;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].image = data.query.pages[pageID].thumbnail.source;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].wikiName = data.query.normalized[0].from;
                                progress += 1;
                                $("#loadingMessage").html("Finding Cute Animal Pictures - " + Math.round((progress/animals.animalList.length)*100) + "%");
                            } else {
                                imagesTwo += 1;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].image = "no image";
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].wikiName = "no wiki";
                            }
                        },
                        error: function() {console.log("wikiImg error!")}
                    });
                } else {imagesTwo += 1;}
            }
        }
    }, 200);
    
    var y = setInterval(function () {
        if (imagesTwo == animals.animalList.length) {
            clearInterval(y);
            for (i=0; i<animals.animalList.length; i++){
                if (animals[animals.animalList[i]].image == "no image") {
                    $.ajax({
                        url: "https://en.wikipedia.org/w/api.php?action=query&titles="+ animals.animalListSci[i].split('_')[0] +"&prop=pageimages&format=json&pithumbsize=300",
                        type: 'GET',
                        crossDomain: true,
                        dataType: 'jsonp',
                        success: function(data) {
                            var pageID;
                            for (var key in data.query.pages) {
                                pageID = key;
                            }
                            if (data.query == undefined){return}

                            function sciName(element){
                                return element.split('_')[0] == data.query.normalized[0].from;
                            }

                            if (data.query.pages[pageID].thumbnail != undefined) {
                                imagesThree += 1;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].image = data.query.pages[pageID].thumbnail.source;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].wikiName = data.query.normalized[0].from;
                                progress += 1;
                                $("#loadingMessage").html("Finding Cute Animal Pictures - " + Math.round((progress/animals.animalList.length)*100) + "%");
                            } else {
                                imagesThree += 1;
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].image = "no image";
                                animals[animals.animalList[animals.animalListSci.findIndex(sciName)]].wikiName = "no wiki";
                            }
                        },
                        error: function() {console.log("wikiImg error!")}
                    });
                } else {imagesThree += 1;}
            }
        }
    }, 200);
    
    var w = setInterval(function () {
        if (imagesThree == animals.animalList.length) {
            clearInterval(w);
            for (i=0; i<animals.animalList.length; i++){
                if (animals[animals.animalList[i]].image == "no image") {
                    if (animals[animals.animalList[i]].kingdom == "plantae") {
                        animals[animals.animalList[i]].image = "images/plant.jpg";
                    } else {
                        switch (animals[animals.animalList[i]].class) {
                            case "aves":
                                animals[animals.animalList[i]].image = "images/bird.jpg";
                                break;
                            case "mammalia":
                                animals[animals.animalList[i]].image = "images/mammal.jpg";
                                break;
                            case "reptilia":
                                animals[animals.animalList[i]].image = "images/reptile.jpg";
                                break;
                            case "amphibia":
                                animals[animals.animalList[i]].image = "images/amphibian.jpg";
                                break;
                            case "chondrichthyes":
                                animals[animals.animalList[i]].image = "images/fish.jpg";
                                break;
                            case "actinopterygii":
                                animals[animals.animalList[i]].image = "images/fish.jpg";
                                break;
                            case "insecta":
                                animals[animals.animalList[i]].image = "images/insect.jpg";
                                break;
                            case "malacostraca":
                                animals[animals.animalList[i]].image = "images/insect.jpg";
                                break;
                            case "gastropoda":
                                animals[animals.animalList[i]].image = "images/insect.jpg";
                                break;
                            default: 
                                animals[animals.animalList[i]].image = "images/generic.jpg";
                                break;
                        };
                    };
                    imagesFour += 1;
                } else {imagesFour += 1}
            }
        }
    }, 200);
    
    var z = setInterval(function () {
        if (imagesFour == animals.animalList.length) {
            clearInterval(z);
            console.log("FINISHED IMAGES");
            animals.imagesLoaded = true;
        }
    }, 200);
};



/*-------------------------------------*\
  Place and Manipualte Data on the Page
\*-------------------------------------*/

function placeImages(){
    var skippedAnimals = 0;
    var columns;
    
    if ($(window).width() < 640){
        columns = 2;
        $("#speciesphotos").append("<div class=\"column c2 c21\"></div><div class=\"column c2 c22\"></div>");
    } else if ($(window).width() < 1000){
        columns = 3;
        $("#speciesphotos").append("<div class=\"column c3 c31\"></div><div class=\"column c3 c32\"></div><div class=\"column c3 c33\"></div>");
    } else {
        columns = 4;
        $("#speciesphotos").append("<div class=\"column c4 c41\"></div><div class=\"column c4 c42\"></div><div class=\"column c4 c43\"></div><div class=\"column c4 c44\"></div>");
    };
    
    for (i=0; i < animals.animalList.length; i++) {
        
        var factor = (i-skippedAnimals)%columns;
        var side;
        
        if (animals[animals.animalList[i]].image.charAt(0) == "h" && animals[animals.animalList[i]].image != undefined){
            $(".c" + columns + (factor+1)).append("<a class=\"linker\" data-kingdom=\"" + animals[animals.animalList[i]].kingdom + "\" data-class=\"" + animals[animals.animalList[i]].class + "\" data-animal=\"" +animals.animalList[i]+ "\"><h3 class=\"label\">"+animals[animals.animalList[i]].commonName+"</h3><img src=\"" + animals[animals.animalList[i]].image + "\" alt=\"" + animals.animalList[i] + "\"></a>");
        } else {skippedAnimals += 1;}
    };
    
    skippedAnimals = 0;
    
    for (i=0; i < animals.animalList.length; i++) {
        
        var factor = (i-skippedAnimals)%columns;
        var side;
        
        if (animals[animals.animalList[i]].image.charAt(0) == "i" && animals[animals.animalList[i]].image != undefined){
            $(".c" + columns + (factor+1)).append("<a class=\"linker\" data-kingdom=\"" + animals[animals.animalList[i]].kingdom + "\" data-class=\"" + animals[animals.animalList[i]].class + "\" data-animal=\"" +animals.animalList[i]+ "\"><h3>"+animals[animals.animalList[i]].commonName+"</h3><img src=\"" + animals[animals.animalList[i]].image + "\" alt=\"" + animals.animalList[i] + "\"></a>");
        } else {skippedAnimals += 1;}
    };
    
    localStorage.setItem('animals', JSON.stringify(animals));
    
    $(".column > *").click( function(){
        openSpeciesPage(this.dataset.animal);
    })
};



//open map page
$("#searchicon").click(function(){
    $("#mapPage").addClass("open");
    openMapPage();
});
$("#closeMap").click(function(){
    $("#mapPage").removeClass("open");
    openMapPage();
});

function openMapPage(){
    if (marker == undefined) {
        L.mapbox.accessToken = 'pk.eyJ1Ijoia2lsYnkiLCJhIjoiY2l1eW1pOTV6MDRrMzJ5bDF5dmpnYWUwbiJ9.RfbH9hH2rX1gSWeu4APF7w';

        var map = L.mapbox.map('mapPopup', 'mapbox.outdoors')
            .setView([lat, lon], 15);
        marker = L.marker(new L.LatLng(lat, lon), {
            icon: L.mapbox.marker.icon({
                'marker-color': '8ca8b4'
            }),
            draggable: true
        });
        marker.addTo(map);
    };
    
    if ( $("#mapPage").hasClass("open") ){
        $("#mapPage").animate({marginTop: 0}, 500, function(){});
    } else {
        $("#mapPage").animate({marginTop: "-100vh"}, 500, function(){});
    };
    
    $("#useMarker").fadeToggle(500);
    $("#search").fadeToggle(500);
}

$("#useMarker").click( function(){
    window.location.hash = "#" + marker.getLatLng().lat + "," + marker.getLatLng().lng
    window.location.reload(false);
});
$("#search").click( function(){
    window.location.hash = ""
    window.location.reload(false);
});




function openSpeciesPage(animal){
    
    var speciesImage = document.getElementById("speciesimage");
    speciesImage.alt = animal;
    speciesImage.src = animals[animal].image;
    
    var speciesMap = document.getElementById("map");
    speciesMap.alt = animal;
    speciesMap.src = "https://biocache.ala.org.au/ws/density/map?q=" + animal;
    
    $("#name").html(animals[animal].commonName);
    var description;
    $("#kingdom").html(animals[animal].kingdom);
    var description;
    $("#phylum").html(animals[animal].phylum);
    var description;
    $("#class").html(animals[animal].class);
    var description;
    $("#order").html(animals[animal].order);
    var description;
    $("#family").html(animals[animal].family);
    var description;
    $("#species").html(animals[animal].scientificName);
    var description;
    
    $("#content span").html("Loading Desciption");
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+animals[animal].wikiName,
        type: 'GET',
        crossDomain: true,
        dataType: 'jsonp',
        success: function(data) {
            var pageID;
            for (var key in data.query.pages) {
                pageID = key;
            }
            if (data.query == undefined){
                $("#content span").html("No Desciption Available");
                return
            }
            if (data.query.pages[pageID].extract != undefined) {
                $("#content span").html(data.query.pages[pageID].extract);
            } else {
                $("#content span").html("No Desciption Available");
            }
        },
        error: function() {console.log("wikiExtract error!")}
    });

    $("#speciesPage").fadeIn();
    $("#speciesPage").scrollTop(0);
}

$(".closeBtn").click(function(){
    $("#speciesPage").fadeOut();
});




$("#filterSelect").on("change", function() {
    filterAnimals();
});

function filterAnimals(){
    var filter = $("#filterSelect").val();
    switch (filter) {
        case "all":
            $(".linker").css("display", "block");
            break;
        case "animals":
            $(".linker").css("display", "none");
            $("a[data-kingdom='animalia']").css("display", "block");
            break;
        case "plants":
            $(".linker").css("display", "none");
            $("a[data-kingdom='plantae']").css("display", "block");
            break;
        case "birds":
            $(".linker").css("display", "none");
            $("a[data-class='aves']").css("display", "block");
            break;
        case "mammals":
            $(".linker").css("display", "none");
            $("a[data-class='mammalia']").css("display", "block");
            break;
        case "reptiles":
            $(".linker").css("display", "none");
            $("a[data-class='reptilia']").css("display", "block");
            break;
        case "amphibians":
            $(".linker").css("display", "none");
            $("a[data-class='amphibia']").css("display", "block");
            break;
        case "fish":
            $(".linker").css("display", "none");
            $("a[data-class='chondrichthyes']").css("display", "block");
            $("a[data-class='actinopterygii']").css("display", "block");
            break;
        case "invertebrate":
            $(".linker").css("display", "none");
            $("a[data-class='insecta']").css("display", "block");
            $("a[data-class='malacostraca']").css("display", "block");
            $("a[data-class='gastropoda']").css("display", "block");
            break;
        default: 
            $(".linker").css("display", "block");
            break;
    };
};

$("#radiusSelect").on("change", function() {
    localStorage.setItem('radius', $("#radiusSelect").val());
    localStorage.setItem('lastALAlocation', undefined);
    window.location.reload(false);
});



/*--------------*\
  Time Handeling 
\*--------------*/

$(window).load(function ()
{
    var i = setInterval(function () {
        console.log("loading...");
        if (animals != undefined) {
            if (animals.imagesLoaded == true) {
                clearInterval(i);
                placeImages();
                $("#backgroundlanding").fadeOut();
            }
        }
    }, 200);
});