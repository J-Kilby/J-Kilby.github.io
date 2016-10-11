var images = document.getElementsByClassName("images");

for (i = 0; i < images.length; i++) {
    images[i].style.backgroundImage = "url(art/thumb/" + images[i].dataset.image + ")";
};

var viewer = $("#viewer");

$(".images p").click( function(){
    $("#viewer img").remove();
    viewer.fadeIn();
    viewer.append("<img src='art/" + this.parentNode.dataset.image + "'>");
});

$("#viewer div").click( function(){
    $("#viewer").fadeOut();
});
