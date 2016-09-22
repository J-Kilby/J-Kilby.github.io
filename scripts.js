if (localStorage.getItem("saved") !== "true") {
    localStorage.setItem("saved", "false");
} ;



/*--------------------*\
  Initialise  Varables
\*--------------------*/

//time variables
var timeNow = new Date(Date.now()),
    time48 = new Date(timeNow.getTime() + 2880*60000),
    timeUnix = timeNow.getTime().toString(),
    gap = 172800000,
    timeMachine = [];

for (i = 0; i < 3; i++) {
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

var terms = [" Siberian", 
             " Frigid", 
             " Cold", 
             " Brisk", 
             " Cool", 
             " Mild", 
             " Balmy", 
             " Warm", 
             " Hot", 
             " Scorching", 
             "n Ovenlike"];

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
    avMin = 0,
    
    graphDataObj = [],
    
    graphMessage0,
    graphText0,
    graphIcon0,
    graphMaxMin0,
    
    graphMessage1,
    graphText1,
    graphIcon1,
    graphMaxMin1,
    
    graphMessage2,
    graphText2,
    graphIcon2,
    graphMaxMin2,
    
    graphMessage3,
    graphText3,
    graphIcon3,
    graphMaxMin3,
    
    weekday3,
    weekday4,
    weekday5,
    weekday6,
    weekday7,
    weekday8,
        
    weekSummary1,
    weekSummary2,
    weekSummary3,
    weekSummary4,
    weekSummary5,
    weekSummary6,
    weekSummary7,
    weekSummary8,
    
    weekIcon1,
    weekIcon2,
    weekIcon3,
    weekIcon4,
    weekIcon5,
    weekIcon6,
    weekIcon7,
    weekIcon8,
        
    weekMinMax1,
    weekMinMax2,
    weekMinMax3,
    weekMinMax4,
    weekMinMax5,
    weekMinMax6,
    weekMinMax7,
    weekMinMax8;
        


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
    
    var dayQuery = ["Today", "Tomorrow", "After That"];
    var nightQuery = ["This Morning", "Tonight", "After That"];
    
    for (i = 0; i < 3; i++) {
        graphDataObj.push({temp: forcast.daily.data[i].temperatureMin,
                        minmax: "min",
                        time: forcast.daily.data[i].temperatureMinTime,
                        summary: forcast.daily.data[i].summary,
                        message: generateMessage(nightQuery[i], forcast.daily.data[i].temperatureMin, "min"),
                        icon: forcast.daily.data[i].icon.replace("day", "night")})
    
        graphDataObj.push({temp: forcast.daily.data[i].temperatureMax,
                        minmax: "max",
                        time: forcast.daily.data[i].temperatureMaxTime,
                        summary: forcast.daily.data[i].summary,
                        message: generateMessage(dayQuery[i], forcast.daily.data[i].temperatureMax, "max"),
                        icon: forcast.daily.data[i].icon.replace("night", "day")})
    }
    
    if (graphDataObj[0].time < timeUnix.slice(0, -3)) {
        graphDataObj.shift();
        
        if (graphDataObj[0].time < timeUnix.slice(0, -3)) {
            graphDataObj.shift();
        }
    }
    
    
    graphMessage0 = graphDataObj[0].message;
    graphText0 = graphDataObj[0].summary;
    graphIcon0 = "<img src=\"icons/" + graphDataObj[0].icon + ".png" + "\" alt=\"" + graphDataObj[0].icon + "\" />";
    graphMaxMin0 = Math.round(graphDataObj[0].temp) + "&deg;";
    
    graphMessage1 = graphDataObj[1].message;
    graphText1 = graphDataObj[1].summary;
    graphIcon1 = "<img src=\"icons/" + graphDataObj[1].icon + ".png" + "\" alt=\"" + graphDataObj[1].icon + "\" />";
    graphMaxMin1 = Math.round(graphDataObj[1].temp) + "&deg;";
    
    graphMessage2 = graphDataObj[2].message;
    graphText2 = graphDataObj[2].summary;
    graphIcon2 = "<img src=\"icons/" + graphDataObj[2].icon + ".png" + "\" alt=\"" + graphDataObj[2].icon + "\" />";
    graphMaxMin2 = Math.round(graphDataObj[2].temp) + "&deg;";
    
    graphMessage3 = graphDataObj[3].message;
    graphText3 = graphDataObj[3].summary;
    graphIcon3 = "<img src=\"icons/" + graphDataObj[3].icon + ".png" + "\" alt=\"" + graphDataObj[3].icon + "\" />";
    graphMaxMin3 = Math.round(graphDataObj[3].temp) + "&deg;";
    
    
    
    weektime3 = new Date(timeNow.getTime() + 3*(1440*60000));
    weektime4 = new Date(timeNow.getTime() + 4*(1440*60000));
    weektime5 = new Date(timeNow.getTime() + 5*(1440*60000));
    weektime6 = new Date(timeNow.getTime() + 6*(1440*60000));
    weektime7 = new Date(timeNow.getTime() + 7*(1440*60000));
    weektime8 = new Date(timeNow.getTime() + 8*(1440*60000));
    
    weekday3 = days[weektime3.getDay()];
    weekday4 = days[weektime4.getDay()];
    weekday5 = days[weektime5.getDay()];
    weekday6 = days[weektime6.getDay()];
    weekday7 = days[weektime7.getDay()];
    weekday8 = days[weektime8.getDay()];
    
    weekSummary1 = forcast.daily.data[1-1].summary;
    weekSummary2 = forcast.daily.data[2-1].summary;
    weekSummary3 = forcast.daily.data[3-1].summary;
    weekSummary4 = forcast.daily.data[4-1].summary;
    weekSummary5 = forcast.daily.data[5-1].summary;
    weekSummary6 = forcast.daily.data[6-1].summary;
    weekSummary7 = forcast.daily.data[7-1].summary;
    weekSummary8 = forcast.daily.data[8-1].summary;

    weekIcon1 = "<img src=\"icons/" + forcast.daily.data[1-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[1-1].icon + "\" />"
    weekIcon2 = "<img src=\"icons/" + forcast.daily.data[2-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[2-1].icon + "\" />"
    weekIcon3 = "<img src=\"icons/" + forcast.daily.data[3-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[3+1].icon + "\" />"
    weekIcon4 = "<img src=\"icons/" + forcast.daily.data[4-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[4-1].icon + "\" />"
    weekIcon5 = "<img src=\"icons/" + forcast.daily.data[5-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[5-1].icon + "\" />"
    weekIcon6 = "<img src=\"icons/" + forcast.daily.data[6-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[6-1].icon + "\" />"
    weekIcon7 = "<img src=\"icons/" + forcast.daily.data[7-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[7-1].icon + "\" />"
    weekIcon8 = "<img src=\"icons/" + forcast.daily.data[8-1].icon + ".png" + "\" alt=\"" + forcast.daily.data[8-1].icon + "\" />"
        
    weekMinMax1 = Math.round(forcast.daily.data[1-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[1-1].temperatureMax) + "&deg;";
    weekMinMax2 = Math.round(forcast.daily.data[2-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[2-1].temperatureMax) + "&deg;";
    weekMinMax3 = Math.round(forcast.daily.data[3-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[3-1].temperatureMax) + "&deg;";
    weekMinMax4 = Math.round(forcast.daily.data[4-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[4-1].temperatureMax) + "&deg;";
    weekMinMax5 = Math.round(forcast.daily.data[5-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[5-1].temperatureMax) + "&deg;";
    weekMinMax6 = Math.round(forcast.daily.data[6-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[6-1].temperatureMax) + "&deg;";
    weekMinMax7 = Math.round(forcast.daily.data[7-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[7-1].temperatureMax) + "&deg;";
    weekMinMax8 = Math.round(forcast.daily.data[8-1].temperatureMin) + "&deg; &ndash; " + Math.round(forcast.daily.data[8-1].temperatureMax) + "&deg;";
}




function generateMessage(day, tmp, m) {
    var message = "A";
    var midPoint;
    var termInt;
    
    if (m == "min") {midPoint = ((3*avMin)+(2*20))/5;
    } else {midPoint = ((3*avMax)+(2*20))/5;}
    
    termInt = Math.round((tmp-midPoint)/4)+5
    if (termInt < 0){termInt = 0;} else if (termInt > 10){termInt = 10;};
    
    message += terms[termInt];
    
    if (m == "min"){
        message += " night ";
    } else {
        message += " day ";
    };
    
    message += day;
    
    return(message);
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