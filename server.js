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
const moment = require("moment");

const app = express();

app.set("views","./views");
app.set("view engine","ejs");

moment.locale("fi");

app.use(express.static("./public"));

// Routes
app.get("/",(req,res) => {
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
    res.render("index",{
        dateInfo: dateInfo
    });
});

// Käynnistetään palvelin
const port = process.env.PORT || 8000;
app.listen(port,() => {
    console.info(`The server started listening the port ${port}`);
});