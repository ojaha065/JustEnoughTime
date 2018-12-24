"use strict";

/*
    Jani Haiko (D5209)
    TKMI17SP
    Sovellusohjelmointi 2 / Janne Turunen
    Soveltava harjoitustyö
*/

console.clear();
console.info("Starting up... Please wait!");

const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();

const JET = require("./modals/JET.js");

app.set("views","./views");
app.set("view engine","ejs");

moment.locale("fi");

app.use(express.static("./public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes
app.get("/",(req,res) => {
    JET.getAllReservations().then((data) => {
        let now = moment();
        let dateInfo = {
            currentDay: now.weekday(),
            dates: [
                now.weekday(0).format("l"),
                now.weekday(1).format("l"),
                now.weekday(2).format("l"),
                now.weekday(3).format("l"),
                now.weekday(4).format("l"),
                now.weekday(5).format("l"),
                now.weekday(6).format("l")
            ]
        };
        let rowIds = [];
        let columnIds = [];
        data.forEach((item) => {
            rowIds.push(item.time.rowId);
            columnIds.push(1);
        });
        res.render("index",{
            dateInfo: dateInfo,
            reservationData: {
                rowIds: rowIds,
                columnIds: columnIds
            }
        });
    }).catch((error) => {
        throw error;
    });
});
app.post("/newReservation",(req,res) => {
    //console.log(req.body);
    JET.newReservation(req.body).then(() => {
        res.redirect("/");
    }).catch((error) => {
        throw error;
    });
});

// Käynnistetään palvelin
const port = process.env.PORT || 8000;
app.listen(port,() => {
    console.info(`The server started listening the port ${port}`);
});