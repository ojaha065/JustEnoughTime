"use strict";

$(document).ready(function(){
    var confirmDialog = $("#confirmDialog");

    $(".notReserved").click(function(){
        confirmDialog.modal("show");
    });
});