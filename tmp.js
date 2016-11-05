console.log("Loaded");
//get buttons
var filterBtns = document.getElementsByClassName("filterBtn");
//set 'all' as selected (background fill)
filterBtns[0].className = "filterBtn  selected"
    
//get all the items to be sorted
var items;
items = document.getElementsByClassName("workoutbox");
console.log(items);

    
//add a click listener to all of them
for (i=0; i<filterBtns.length; i++) {
    filterBtns[i].addEventListener("click", function(){
        console.log("ckick!");
        //remove the seleted calss from all buttons
        for (x=0; x<filterBtns.length; x++){filterBtns[x].className = "filterBtn";}
        //add selected class to this element
        this.className = "filterBtn  selected";
            
        for (x=0; x<items.length; x++) {
            console.log("iterating on" + x);
            //if you cliekd all ...
            if (this.id == "all"){
                console.log("all");
                //turn on visibility for all
                items[x].style.display = "inline-block";
            } else {
                console.log("not all");
                //otherwise ...
                if (items[x].dataset.filter1 == this.id || items[x].dataset.filter2 == this.id) {
                    console.log("inline");
                    //hide all that don't match
                    items[x].style.display = "inline-block";
                } else  {
                    console.log("none");
                    //and show all that do
                    items[x].style.display = "none";
                }
            }
        };   
	});    
};