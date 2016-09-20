$("#clean").click( function() {
    localStorage.clear()
    window.location.reload();
});


/*--------------------*\
  Initialise  Varables
\*--------------------*/

//time variables
var timeNow = new Date(Date.now());
var time48 = new Date(timeNow.getTime() + 2880*60000);
var timeMachine = new Date(timeNow.getTime() - 11520*60000)

//format the time to ##:##
var timeFill;
if (timeNow.getMinutes() < 10){timeFill = ":0"}else{timeFill = ":"};
var time = timeNow.getHours() + timeFill + timeNow.getMinutes();

//arrays for date display
var days = ["Sunday", 
            "Monday", 
            "Tueday", 
            "Wednesday", 
            "Thursday", 
            "Friday", 
            "Saturday"];

var months = ["January",	
              "February", 
              "March",	
              "April",	
              "May",	
              "June",	
              "July",	
              "August",	
              "September", 
              "October",	
              "November",	
              "December"];

//get location data from IP adress if it is not stored
console.log(localStorage.getItem("latLon") + localStorage.getItem("localName"));
console.log(localStorage.getItem("latLon") == undefined);
if (localStorage.getItem("latLon") == undefined || localStorage.getItem("latLon") == null) {
    $.getJSON("http://ip-api.com/json", function(data) {
        console.log(data.status == "success");
        if (data.status == "success") {
            localStorage.setItem("latLon", data.lat + ", " + data.lon);
            localStorage.setItem("localName", data.city);
        } else {
            localStorage.setItem("latLon", "-35.2809, 149.1300");
            localStorage.setItem("localName", "canberra");
        }       
    });
}

//location variables
var localName = localStorage.getItem("localName");
var latLon = localStorage.getItem("latLon");

console.log(latLon);
console.log(localStorage.getItem("latLon"));


//api calls
var apiKey = "12f2ea9c1c2ae5e0c782f4a732f16469";
var apiCallf = "https://api.forecast.io/forecast/" + apiKey + "/" + latLon + "?units=si&callback=?";
var apiCallt = "https://api.forecast.io/forecast/" + apiKey + "/" + latLon + "?units=si&callback=?";
var apiCalll;





/*--------------------*\
  Setting the Location
\*--------------------*/

//toggle location popup
$("#locationToggle").click( function(){
    $("#changeLocation").fadeToggle();
    $("#locationToggle").toggleClass("down");
})

var results,
    query;

$("#changeLocation_submit").click ( function() {
    
    $("#loading").fadeIn();
    $("#locationResults").empty();
        
    query = encodeURIComponent($("#changeLocation_input").val());
    apiCalll = "http://api.geonames.org/searchJSON?q=" + query + "&maxRows=10&username=kilby";
    
    
    $.getJSON(apiCalll, function(data) {
        
        results = data;
        
        for (i = 0; i < results.geonames.length; i++) {
            $("#locationResults").append("<p class=\"locationResult\" data-local=\"" + results.geonames[i].name + "\" data-latlon=\"" + results.geonames[i].lat + ", " + results.geonames[i].lng + "\"><span>" + results.geonames[i].name + ", " + results.geonames[i].adminName1 + ", " + results.geonames[i].countryName + "<br></span><span>" + results.geonames[i].lat + ", " + results.geonames[i].lng + ": " + results.geonames[i].fclName + "</span></p>")
        }
        
        $(".locationResult").click( function(){
            console.log(this);
            console.log(this.dataset);
            localStorage.setItem("latLon", this.dataset.latlon);
            console.log(this.dataset.latLon);
            localStorage.getItem("latLon");
            localStorage.setItem("localName", this.dataset.local);
            
            window.location.reload();
        });
    });    
    
    $("#loading").fadeOut();
});















/*--------------------*\
   Get  The  Weather
\*--------------------*/

//declare all empty variables to contain data in a readable format
var forcast,
    icon,
    currentTemp,
    callTime,
    feelsLike,
    cloudCover,
    dewPoint,
    humidity,
    rainIntensity,
    rainChance,
    rainType,
    windDirection,
    windSpeed,
    
    minTemp,
    maxTemp,
    
    temps = [],
    tempsRaw = [],
    cloudCovers = [],
    rainChances = [],
    icons = [];



//call API and store data in declared varables
$.getJSON(apiCallf, function(data) {
    forcast = data;
    /*$.getJSON(apiCallt, function(data) {}*/
    
    //set varivbles for 'now' section
    icon = "<img src=\"icons/" + forcast.currently.icon + ".png" + "\" alt=\"" + forcast.currently.icon + "\" />";
    currentTemp = Math.round(forcast.currently.temperature) + "&deg;";
    callTime = days[timeNow.getDay()] +", "+ months[timeNow.getMonth()]+" "+timeNow.getDate() +" &ndash; "+ time;
    feelsLike = Math.round(forcast.currently.apparentTemperature*2)/2 + "&deg;";
    cloudCover = Math.round(forcast.currently.cloudCover*100) + "%";
    dewPoint = Math.round(forcast.currently.dewPoint) + "&deg;";
    humidity = Math.round(forcast.currently.humidity*100) + "%";
    rainIntensity = forcast.currently.precipIntensity + " mm/s";
    rainChance = Math.round(forcast.currently.precipProbability*100) + "%";
    rainType = forcast.currently.precipType;
    windDirection = degToCard(forcast.currently.windBearing);
    windSpeed = Math.round(forcast.currently.windSpeed * 3.6) + " km/h";
    
    //set variables for graph
    for (i = 0; i < 49; i++) {
        temps.push({date: new Date(timeNow.getTime() + (i*(60*60000))),
                    value: Math.round(forcast.hourly.data[i].temperature*2)/2
            });
        
        tempsRaw.push(Math.round(forcast.hourly.data[i].temperature*2)/2);
        
        cloudCovers.push({date: new Date(timeNow.getTime() + (i*(60*60000))),
                          value: Math.round(forcast.hourly.data[i].cloudCover*100)
            });
        
        rainChances.push({date: new Date(timeNow.getTime() + (i*(60*60000))),
                          value: Math.round(forcast.hourly.data[i].precipProbability*100)
            });
        
        icons.push(forcast.hourly.data[i].icon);
    }
    
    
    
    placeData();
});

          
          


/*--------------------*\
       Functions
\*--------------------*/
          
//convert degress to cardinal deirections
function degToCard(angle) {
    if (angle < 22) { return("N") } else 
    if (angle < 67) { return("NE")} else 
    if (angle < 112){ return("E") } else 
    if (angle < 157){ return("SE")} else 
    if (angle < 202){ return("S") } else 
    if (angle < 247){ return("SW")} else 
    if (angle < 292){ return("W") } else 
    if (angle < 337){ return("NW")} else 
                      return("N") ;
};


//search for input <spans> and add corresponding data,
//generate and draw the graph.
function placeData(){
    var feilds = document.getElementsByClassName("var");
    
    for (i = 0; i < feilds.length; i++) {
        if (window[feilds[i].dataset.id] !== undefined){
            feilds[i].innerHTML = window[feilds[i].dataset.id];
        }
    }

    
    //graph
    //http://bl.ocks.org/benjchristensen/2579599
    /* implementation heavily influenced by http://bl.ocks.org/1166403 */
		
    var m = 50,
        w = 220-m,
        h = 650-m;
    
    minTemp = Math.round(Math.min.apply(null, tempsRaw)),
    maxTemp = Math.round(Math.max.apply(null, tempsRaw));
    
    var y = d3.scaleTime().domain([timeNow, time48]).range([0, h]);
    var x = x = d3.scaleLinear().domain([minTemp-2, maxTemp+2]).range([0, w]);
    
    var tempCloudCovers = cloudCovers,
        tempRainChances = rainChances;
    
    for (i = 0; i < 49; i++) {
        tempCloudCovers[i].value = (tempCloudCovers[i].value/100)*(maxTemp-minTemp+4) + minTemp-2;
        tempRainChances[i].value = (tempRainChances[i].value/100)*(maxTemp-minTemp+4) + minTemp-2;
    }
    
    var graph = d3.select("#graphCont").append("svg:svg")              
                  .attr("width", w + m)
                  .attr("height", h + m)
                  .attr('viewBox','0 0 '+ (w+m) +' '+ (h+m) )
                  .attr('preserveAspectRatio','xMinYMin')
                  .attr("transform", "translate(" + m + "," + m + ")")
                  .append("svg:g");
      
    var xAxis = d3.axisTop(x).ticks((maxTemp-minTemp+4)/2);
    var yAxis = d3.axisLeft(y).ticks(48/3);
    
    var line = d3.line()
        .y(function(d) { return y(d.date); })
        .x(function(d) { return x(d.value); })

    graph.append("svg:path")
         .attr("d", line(cloudCovers)).attr("id", "graph_cloudCovers")
         .attr("transform", "translate(" + m + "," + m + ")");
    graph.append("svg:path")
         .attr("d", line(rainChances)).attr("id", "graph_rainChances")
         .attr("transform", "translate(" + m + "," + m + ")");

    
    graph.append("svg:path")
         .attr("d", line(temps)).attr("id", "graph_temps")
         .attr("transform", "translate(" + m + "," + m + ")");
    
    graph.append("svg:g")
         .call(xAxis)
         .attr("class", "xAxis")
         .attr("transform", "translate(" + m + ", " + m + ")");
    graph.append("svg:g")
         .call(yAxis)
         .attr("class", "yAxis")
         .attr("transform", "translate(" + m + ", " + m + ")");
    
/*

Horizontal Graph

    var m = 40,
        h = 200-m,
        w = 800-m;
    
    minTemp = Math.round(Math.min.apply(null, tempsRaw)),
    maxTemp = Math.round(Math.max.apply(null, tempsRaw));
    
    var x = d3.scaleTime().domain([timeNow, time48]).range([0, w]);
    var y = d3.scaleLinear().domain([minTemp-2, maxTemp+2]).range([h, 0]);
    
    for (i = 0; i < 49; i++) {
        cloudCovers[i].value = (cloudCovers[i].value/100)*(maxTemp-minTemp+4) + minTemp;
        rainChances[i].value = (rainChances[i].value/100)*(maxTemp-minTemp+4) + minTemp;
    }
    
    var graph = d3.select("#graphCont").append("svg:svg")
                  .attr("width", w + m + m)
                  .attr("height", h + m + m)
                  .attr("transform", "translate(" + m + "," + m + ")")
                  .append("svg:g");
      
    var yAxis = d3.axisLeft(y).ticks((maxTemp-minTemp+4)/2);
    var xAxis = d3.axisBottom(x).ticks(48/3);
    
    graph.append("svg:g")
         .call(xAxis)
         .attr("class", "xAxis")
         .attr("transform", "translate(" + m + ", 200)");
    graph.append("svg:g")
         .call(yAxis)
         .attr("class", "yAxis")
         .attr("transform", "translate(" + m + ", " + m + ")");
    
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); })

    graph.append("svg:path")
         .attr("d", line(cloudCovers)).attr("id", "graph_cloudCovers")
         .attr("transform", "translate(" + m + "," + m + ")");
    graph.append("svg:path")
         .attr("d", line(rainChances)).attr("id", "graph_rainChances")
         .attr("transform", "translate(" + m + "," + m + ")");

    
    graph.append("svg:path")
         .attr("d", line(temps)).attr("id", "graph_temps")
         .attr("transform", "translate(" + m + "," + m + ")");
*/
    
    $("#loading").fadeOut();
}