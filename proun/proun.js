var hash, seed;

seed = chance.word({syllables: 3});

if (window.location.hash !== "") {
    hash = window.location.hash.substr(1).split(",");
    
    seed = hash[0];

    $("#spread").val(hash[1]);
    $("#denisty").val(hash[2]);
    $("#fillings").val(hash[3]);
    $("#thickness").val(hash[4]);
    
    $("#circles").val(hash[5]);
    $("#quads").val(hash[6]);
    $("#tris").val(hash[7]);
    $("#arcs").val(hash[8]);
    $("#lines").val(hash[9]);
};

$("#genBtn").click( function(){

    seed = chance.word({syllables: 3});
    
    genHash();
    draw($("#spread").val(),
         $("#denisty").val(),
         $("#fillings").val(),
         $("#thickness").val(),
         $("#circles").val(),
         $("#quads").val(),
         $("#tris").val(),
         $("#arcs").val(),
         $("#lines").val()
        );
});

document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        seed = chance.word({syllables: 3});
    
        genHash();
        draw($("#spread").val(),
             $("#denisty").val(),
             $("#fillings").val(),
             $("#thickness").val(),
             $("#circles").val(),
             $("#quads").val(),
             $("#tris").val(),
             $("#arcs").val(),
             $("#lines").val()
            );
    };
};

$("#sliders > input").bind("input", function() { 
    genHash();
    draw($("#spread").val(),
         $("#denisty").val(),
         $("#fillings").val(),
         $("#thickness").val(),
         $("#circles").val(),
         $("#quads").val(),
         $("#tris").val(),
         $("#arcs").val(),
         $("#lines").val()
        );
});





function genHash() {
    window.location.hash = "#"+ seed +","+ 
        $("#spread").val() +","+ 
        $("#denisty").val() +","+ 
        $("#fillings").val() +","+ 
        $("#thickness").val() +","+ 
        $("#circles").val() +","+ 
        $("#quads").val() +","+ 
        $("#tris").val() +","+ 
        $("#arcs").val() +","+ 
        $("#lines").val();
}





function draw(spr, den, fil, thk, cir, qua, tri, arc, lin) {
    seedChance = new Chance(seed);
    
    $("#svgCont").empty();
    
    var graph = d3.select("#svgCont").append("svg:svg")
                  .attr("viewBox", "0 0 200 200")
                  .attr("preserveAspectRatio","xMinYMin meet")
                  .append("svg:g");

    for (i=0; i<den; i++) {
        switch (seedChance.weighted( ["cir", "qua"], [cir, qua] )){
            case "cir":
                cirGen(graph, spr, den, fil, thk);
                break;
            case "qua":
                quaGen(graph, spr, den, fil, thk);
                break;
            case "tri":
                triGen(graph, spr, den, fil, thk);
                break;
            case "arc":
                arcGen(graph, spr, den, fil, thk);
                break;
            case "lin":
                linGen(graph, spr, den, fil, thk);
        }
        
    }
}

function cirGen(graph, spr, den, fil, thk){
    graph.append("circle")
         .attr("r", seedChance.normal({mean: 15, dev: 5}) )
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

function triGen(graph, spr, den, fil, thk){
    
}

function arcGen(graph, spr, den, fil, thk){
    
}

function linGen(graph, spr, den, fil, thk){
    
}

draw($("#spread").val(),
     $("#denisty").val(),
     $("#fillings").val(),
     $("#thickness").val(),
     $("#circles").val(),
     $("#quads").val(),
     $("#tris").val(),
     $("#arcs").val(),
     $("#lines").val()
);