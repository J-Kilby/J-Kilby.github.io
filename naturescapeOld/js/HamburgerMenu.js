// Hamburger Menu Show + Hide

$(document).ready(function(){
    $(".navicons > #menuicon").click(function(){
        $(".nav > li").toggle(500);
        $('#menuicon').toggleClass("selectedIcon");
        $('#fbicon').toggle();
    });
});
