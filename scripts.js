$("#clean").click( function() {
    localStorage.clear()
    window.location.reload();
});


if (localStorage.getItem("saved") !== "true") {
    localStorage.setItem("saved", "false")
};



/*--------------------*\
  Initialise  Varables
\*--------------------*/

//time variables
var timeNow = new Date(Date.now()),
    time48 = new Date(timeNow.getTime() + 2880*60000),
    timeUnix = timeNow.getTime().toString(),
    gap = 172800000,
    timeMachine = [];

for (i = 0; i < 8; i++) {
    timeMachine.push(parseInt(timeUnix, 10)-(gap*(i+1)));
}

//format the time to ##:##
var timeFill;
if (timeNow.getMinutes() < 10){timeFill = ":0"}else{timeFill = ":"};
var time = timeNow.getHours() + timeFill + timeNow.getMinutes();

//api calls
var apiKey = "12f2ea9c1c2ae5e0c782f4a732f16469";
var apiCallf;
var apiCallt = [];
var apiCalll;

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

//location variables
var localName;
var latLon;





//get location data from IP adress if it is not stored
if (localStorage.getItem("saved") == "false") {

    
    $.getJSON("http://ip-api.com/json", function(data) {
        
        if (data.status == "success") {
            localStorage.setItem("latLon", data.lat + ", " + data.lon);
            localStorage.setItem("localName", data.city);
            localStorage.setItem("saved", "true");
        } else {
            localStorage.setItem("latLon", "-35.2809, 149.1300");
            localStorage.setItem("localName", "canberra");
            localStorage.setItem("saved", "true");
        }
        
        
        callForcast();
    });
} else {
    
    localStorage.setItem("saved", "true");
    callForcast();
}






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

function search() {
    
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
            localStorage.setItem("latLon", this.dataset.latlon);
            localStorage.setItem("localName", this.dataset.local);
            localStorage.setItem("saved", "true");
            
            window.location.reload();
        });
    });    
    
    $("#loading").fadeOut();
};





/*--------------------*\
       Functions
\*--------------------*/



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
    
    blank = [],
    temps = [],
    tempsRaw = [],
    cloudCovers = [],
    rainChances = [],
    icons = [],
    
    backcast = [],
    backcastMaxTemps = [],
    backcastMinTemps = [],
    avMax = 0,
    avMin = 0;


//call API and store data in declared varables
function callForcast() {
    assignAPI();
};






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


//forcast API Calls
function assignAPI() {
    localName = localStorage.getItem("localName");
    latLon = localStorage.getItem("latLon").replace(/\s/g, '');
    apiCallf = "https://api.darksky.net/forecast/" + apiKey + "/" + latLon + "?units=si&callback=?";

    for (i = 0; i < timeMachine.length; i++) {
        apiCallt.push("https://api.darksky.net/forecast/" + apiKey + "/" + latLon + "," + timeMachine[i].toString().slice(0, -3) +"?units=si&exclude=[currently,hourly]&callback=?");
    }
    
    for (i = 0; i < 7; i++) {
        $.getJSON(apiCallt[i], function(data) {
            backcast.push(data);});
    }
    
    $.getJSON(apiCallf, function(data) {
        
        forcast = data;
        assignVars();
        placeData();
    });
}


//set varivbles for 'now' section
function assignVars() {
    
    icon = "<img src=\"icons/" + forcast.currently.icon + ".png" + "\" alt=\"" + forcast.currently.icon + "\" />";
    currentTemp = Math.round(forcast.currently.temperature) + "&deg;";
    callTime = days[timeNow.getDay()] +", "+ months[timeNow.getMonth()]+" "+timeNow.getDate() +" &ndash; "+ time;
    feelsLike = Math.round(forcast.currently.apparentTemperature*2)/2 + "&deg;";
    cloudCover = Math.round(forcast.currently.cloudCover*100) + "%";
    dewPoint = Math.round(forcast.currently.dewPoint) + "&deg;";
    humidity = Math.round(forcast.currently.humidity*100) + "%";
    rainIntensity = forcast.currently.precipIntensity + " mm/h";
    rainChance = Math.round(forcast.currently.precipProbability*100) + "%";
    rainType = forcast.currently.precipType;
    windDirection = degToCard(forcast.currently.windBearing);
    windSpeed = Math.round(forcast.currently.windSpeed * 3.6) + " km/h";

    
    for (i = 0; i < 49; i+=48) {
        blank.push({date: new Date(timeNow.getTime() + (i*(60*60000))),
                    value: 0
            });
    }
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
    
    
    for (i = 0; i < backcast.length; i++) {
        backcastMaxTemps.push(backcast[i].daily.data[0].temperatureMax);
        backcastMinTemps.push(backcast[i].daily.data[0].temperatureMin);
    };
    
    for (i = 0; i < backcastMaxTemps.length; i++) {
        avMax = avMax + backcastMaxTemps[i];
        avMin = avMin + backcastMinTemps[i];
    }
    avMax = avMax / backcastMaxTemps.length;
    avMin = avMin / backcastMaxTemps.length;
    
}




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
    var x = d3.scaleLinear().domain([minTemp-3, maxTemp+3]).range([0, w]);
    
    var tempCloudCovers = cloudCovers,
        tempRainChances = rainChances;
    
    for (i = 0; i < 49; i++) {
        tempCloudCovers[i].value = (tempCloudCovers[i].value/100)*(maxTemp-minTemp+6) + minTemp-3;
        tempRainChances[i].value = (tempRainChances[i].value/100)*(maxTemp-minTemp+6) + minTemp-3;
    }
    
    var graph = d3.select("#graphCont").append("svg:svg")              
                  .attr("width", w + m)
                  .attr("height", h + m)
                  .attr('viewBox','0 0 '+ (w+m) +' '+ (h+m) )
                  .attr('preserveAspectRatio','xMinYMin')
                  .attr("transform", "translate(" + m + "," + m + ")")
                  .append("svg:g");
      
    var xAxis = d3.axisTop(x)
                  .ticks((maxTemp-minTemp+6)/2);
    var yAxis = d3.axisLeft(y)
                  .ticks(48/3);
    var c;
    
    var line = d3.line()
        .y(function(d) { return y(d.date); })
        .x(function(d) { return x(d.value); });
    
    var guide = d3.line()
        .y(function(d) { return y(d.date); })
        .x(function(d) { return x(c); });
    
    var maxLine = d3.line()
        .y(function(d) { return y(d.date); })
        .x(function(d) { return x(avMax); });
    var minLine = d3.line()
        .y(function(d) { return y(d.date); })
        .x(function(d) { return x(avMin); });
    
    var area = d3.area()
        .y(function(d) { return y(d.date); })
        .x0(x(minTemp-3))
        .x1(function(d) { return x(d.value); });
    
    
    for (c = Math.round(((minTemp-2)/2)*2); c < maxTemp+3; c = c+2) {
        graph.append("svg:path")
             .attr("d", guide(blank))
             .attr("class", "graphLines")
             .attr("transform", "translate(" + m + "," + m + ")");
    }
    
    graph.append("svg:path")
             .attr("d", maxLine(blank))
             .attr("id", "avMax")
             .attr("transform", "translate(" + m + "," + m + ")");
    graph.append("svg:path")
             .attr("d", minLine(blank))
             .attr("id", "avMin")
             .attr("transform", "translate(" + m + "," + m + ")");
    
    graph.append("svg:path")
         .attr("d", area(cloudCovers))
         .attr("id", "graph_cloudCovers")
         .attr("transform", "translate(" + m + "," + m + ")");
    graph.append("svg:path")
         .attr("d", area(rainChances))
         .attr("id", "graph_rainChances")
         .attr("transform", "translate(" + m + "," + m + ")");

    
    graph.append("svg:path")
         .attr("d", line(temps))
         .attr("id", "graph_temps")
         .attr("transform", "translate(" + m + "," + m + ")");
    graph.append("svg:path")
         .attr("d", line(temps))
         .attr("id", "graph_temps__shadow")
         .attr("transform", "translate(" + m + "," + m + ")");
    
    graph.append("svg:g")
         .call(xAxis)
         .attr("class", "xAxis")
         .attr("transform", "translate(" + m + ", " + m + ")");
    graph.append("svg:g")
         .call(yAxis)
         .attr("class", "yAxis")
         .attr("transform", "translate(" + m + ", " + m + ")");

    
    
    $("#loading").fadeOut();
}