"use strict";

$(document).ready(function(){
    var confirmDialog = $("#confirmDialog");

    $(".notReserved").click(function(){
        var rowId = $(this).parent().data("rowid");
        var date = $("#dates :nth-child("+ Number($(this).index() + 1) + ")").html(); // Ugly as hell but it works...
        $("#rowId").val(rowId);
        $("#date").val(date);
        confirmDialog.modal("show");
    });
});