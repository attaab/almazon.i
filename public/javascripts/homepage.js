// dropdowns
$(document).ready(function () {
    $(".user-signup").on("click", function () {
        $(this).children(".select-sign").slideToggle(100);
    });
    $(".toggle-menu").on("click", function () {
        $(".header1 span").children('i').toggleClass("fa-times").toggleClass('fa-bars');
        $(".side-menu").slideToggle(200);
    });
    $(".user-login").on("click", function () {
        $(this).children(".select-sign").slideToggle(100);
    });
    $(".category .title-category").on("click", function () {
        $(this).children('.title-category span').toggleClass('.glyphicon glyphicon-chevron-down');
        $(this).parent(".category").children('.sub-category').slideToggle(100);
    });
    if ($(window).width() < 600) {
        $(".side-menu .container-menu .cont-sign").append($(".sign"));
        $(".cont-sign").css({"display":"block"});
        $(".select").removeClass('select-sign').addClass('active-dropdown');
        $(".logo").css({"width":"55%"});
        $(".sign li").on("click", function () {
            $(this).children(".select").slideToggle(100);
        });
        $(".user-dropdown").css({"display":"none"});
        $(".user-cont-options").css({"display":"block"});
    }
    $(".new-product").hover(function () {

        $(this).children(".new-product-overlay").fadeToggle(200);
    });
    function toggling(param) {
        var i;
        $(".fa-arrow-left").on("click", function () {
           i = 0;
           var slides = $(".toggle-engineers");
           var currentContainer = $(".act1");
           var prevContainer = currentContainer.prev();
           if (prevContainer.length) {
            currentContainer.fadeOut(100, function () {
                $(this).removeClass('act1');
                prevContainer.fadeIn(100, function () {
                    $(this).addClass('act1');
                });
            });
            
           } else {
            $(".fa-arrow-left").hide();
           }
        });
        $(".fa-arrow-right").on("click", function () {
            var currentContainer = $(".act1");
            var nextContainer = currentContainer.next();
            i = 0;
            var prevContainer = currentContainer.prev();
            if (nextContainer.length) {
                currentContainer.fadeOut(100, function () {
                    $(this).removeClass('act1');
                    nextContainer.fadeIn(100, function () {
                        $(this).addClass('act1');
                    });
                });
            }
        });
    }
    toggling();
   $(".uploadImage").on("click", function () {
    $("#profileimage").click();
   });
   $("#submi").on("click", function () {
   });
});
