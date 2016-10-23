var hash, seed, colScheme = ["fff", "233539", "233539"], random = false;

seed = chance.word({syllables: 3});

//set parameters to hash vales if present
if (window.location.hash !== "") {
    hash = window.location.hash.substr(1).split(",");
    
    seed = hash[0];

    $("#spread").val(hash[1]);
    $("#denisty").val(hash[2]);
    $("#fillings").val(hash[3]);
    $("#thickness").val(hash[4]);
    
    $("#circles").val(hash[5]);
    $("#quads").val(hash[6]);
    $("#arcs").val(hash[7]);
    $("#lines").val(hash[8]);
    
    document.styleSheets[1].rules[0].style.backgroundColor = "#" + hash[9];
    document.styleSheets[1].rules[1].style.fill = "#" + hash[10];
    document.styleSheets[1].rules[2].style.stroke = "#" + hash[11];
    
    colScheme = [hash[9], hash[10], hash[11]];
};





/*--------------------------*\
  Call Draw & Hash Functions
\*--------------------------*/

//'New' button
$("#genBtn").click( function(){

    seed = chance.word({syllables: 3});
    
    if (random == true) {
        $("#spread").val(chance.integer({min: 10,max: 50})),
        $("#denisty").val(chance.integer({min: 1,max: 49})),
        $("#fillings").val(chance.integer({min: 0,max: 100})),
        $("#thickness").val(chance.integer({min: 1,max: 3})),
        $("#circles").val(chance.integer({min: 0,max: 10})),
        $("#quads").val(chance.integer({min: 0,max: 10})),
        $("#arcs").val(chance.integer({min: 0,max: 10})),
        $("#lines").val(chance.integer({min: 0,max: 10}))
    }
    
    genHash();
    draw($("#spread").val(),
         $("#denisty").val(),
         $("#fillings").val(),
         $("#thickness").val(),
         $("#circles").val(),
         $("#quads").val(),
         $("#arcs").val(),
         $("#lines").val()
        );
});

//press 'space'
document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        e.preventDefault();
        
        seed = chance.word({syllables: 3});
        
        if (random == true) {
            $("#spread").val(chance.integer({min: 10,max: 50})),
            $("#denisty").val(chance.integer({min: 1,max: 49})),
            $("#fillings").val(chance.integer({min: 0,max: 100})),
            $("#thickness").val(chance.integer({min: 1,max: 3})),
            $("#circles").val(chance.integer({min: 0,max: 10})),
            $("#quads").val(chance.integer({min: 0,max: 10})),
            $("#arcs").val(chance.integer({min: 0,max: 10})),
            $("#lines").val(chance.integer({min: 0,max: 10}))
        }
        genHash();
        draw($("#spread").val(),
             $("#denisty").val(),
             $("#fillings").val(),
             $("#thickness").val(),
             $("#circles").val(),
             $("#quads").val(),
             $("#arcs").val(),
             $("#lines").val()
            );
    };
};

//adjust slider value
$("#sliders > input").bind("input", function() { 
    genHash();
    draw($("#spread").val(),
         $("#denisty").val(),
         $("#fillings").val(),
         $("#thickness").val(),
         $("#circles").val(),
         $("#quads").val(),
         $("#arcs").val(),
         $("#lines").val()
        );
});

$("#colourSelect > div").click( function(){
    var scheme = this.dataset.colours.split(",");
    document.styleSheets[1].rules[0].style.backgroundColor = "#" + scheme[0];
    document.styleSheets[1].rules[1].style.fill = "#" + scheme[1];
    document.styleSheets[1].rules[2].style.stroke = "#" + scheme[2];
    
    colScheme = [scheme[0], scheme[1], scheme[2]];
    
    genHash();
})

$("#rSlider").click( function(){
    $("#rHandel").toggleClass("handelOn");
    if (random == false) {random = true} else {random = false};
})






/*---------*\
|           |
| Functions |
|           |
\*---------*/

//change the url hash to the current settings
function genHash() {
    window.location.hash = "#"+ seed +","+ 
        $("#spread").val() +","+ 
        $("#denisty").val() +","+ 
        $("#fillings").val() +","+ 
        $("#thickness").val() +","+ 
        $("#circles").val() +","+ 
        $("#quads").val() +","+ 
        $("#arcs").val() +","+ 
        $("#lines").val() +","+
        colScheme[0]+","+colScheme[1]+","+colScheme[2];
}



//proun genorator
function draw(spr, den, fil, thk, cir, qua, arc, lin) {
    seedChance = new Chance(seed);
    
    //clear canvas
    $("#svgCont").empty();
    
    //new canvas
    var graph = d3.select("#svgCont").append("svg:svg")
                  .attr("viewBox", "0 0 200 200")
                  .attr("preserveAspectRatio","xMinYMin meet")
                  .append("svg:g");
    
    var weights = [cir, qua, lin],
        sum = 0;
    
    for (i=0; i<weights.length; i++){
        sum += parseInt(weights[i]);
    }
    
    for (i=0; i<den; i++) {
        
        var portion = 1/sum,
               step = 1/den;
        
        if ((step*(i+1))-(step/2) < portion*parseInt(cir)) {
            cirGen(graph, spr, den, fil, thk);
        } else if ((step*(i+1))-(step/2) < portion*(parseInt(cir)+parseInt(qua))) {
            quaGen(graph, spr, den, fil, thk);
        } else if ((step*(i+1))-(step/2) < portion*(parseInt(cir)+parseInt(qua)+parseInt(lin))) {
            linGen(graph, spr, den, fil, thk);
        } else {
            break;
        }        
    }
}


/*---------------*\
  Shape Functions
\*---------------*/
function cirGen(graph, spr, den, fil, thk){    
    graph.append("circle")
         .attr("r", seedChance.normal({mean: 15, dev: 4}) )
         .attr("cx", seedChance.normal({mean: 100, dev: spr}) )
         .attr("cy", seedChance.normal({mean: 100, dev: spr}) )
         .attr("class", "fill" + seedChance.bool({likelihood: fil}) )
         .attr("stroke-width", thk + "px");
}

function quaGen(graph, spr, den, fil, thk){    
    var width = seedChance.normal({mean: 50, dev: 10});
    var height = seedChance.normal({mean: 50, dev: 10});
    
    graph.append("rect")
         .attr("x", seedChance.normal({mean: 100, dev: spr}) )
         .attr("y", seedChance.normal({mean: 100, dev: spr}) )
         .attr("width", width )
         .attr("height", height )
         .attr("class", "fill" + seedChance.bool({likelihood: fil}) )
         .attr("stroke-width", thk + "px")
         .attr("transform", "translate(" + -height/2 + " ," + -width/2 + " )");
}

function arcGen(graph, spr, den, fil, thk){
    
}

function linGen(graph, spr, den, fil, thk){
    graph.append("path")
         .attr("d", "M" + seedChance.normal({mean: 100, dev: spr})+", "+seedChance.normal({mean: 100, dev: spr})+", "+seedChance.normal({mean: 100, dev: spr})+", "+seedChance.normal({mean: 100, dev: spr}))
         .attr("class", "fillfalse")
         .attr("stroke-width", thk + "px");
}





//draw default proun on load 
draw($("#spread").val(),
     $("#denisty").val(),
     $("#fillings").val(),
     $("#thickness").val(),
     $("#circles").val(),
     $("#quads").val(),
     $("#arcs").val(),
     $("#lines").val()
);