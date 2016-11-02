if (navigator != undefined){$("#1").html("navigator is defined");}
else {$("#1").html("navigator is undefined")};
if (navigator.geolocation != undefined){$("#2").html("navigator.geolocation is defined");}
else {$("#2").html("navigator.geolocation is undefined")};
if (navigator.geolocation.getCurrentPosition != undefined){$("#3").html("navigator.geolocation.getCurrentPosition is defined");}
else {$("#3").html("navigator.geolocation.getCurrentPosition is undefined")};
if (navigator.geolocation.getCurrentPosition != undefined){$("#4").html("navigator.geolocation.getCurrentPosition is defined");}
else {$("#4").html("navigator.geolocation.getCurrentPosition is undefined")};

navigator.geolocation.getCurrentPosition(function(position) {
    $("#4").html("fire!");
    $("#5").html(position.coords.latitude.toString()); 
});