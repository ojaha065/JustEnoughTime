"use strict";

$(document).ready(function(){
    var confirmDialog = $("#confirmDialog");

    $(".notReserved").click(function(){
        var cellId = $(".cell").index(this);
        $("#cellId").val(cellId);
        confirmDialog.modal("show");
    });
});