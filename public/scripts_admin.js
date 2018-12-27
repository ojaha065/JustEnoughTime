"use strict";

$(document).ready(function(){
    $(".reserved").click(function(){
        $(this).children(".extraInfoAboutReservation").slideToggle();
    });
});