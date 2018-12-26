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
const session = require("express-session");
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
app.use(session({
    secret: "mklJklfdj45u984Fds", // Change this before using
    resave: false,
    saveUninitialized: false
}));

// Jos isLoggedIn-muuttujaa ei ole, luodaan se
app.use((req,res,next) => {
    if(!req.session.isLoggedIn){
        req.session.isLoggedIn = false;
    }
    next();
});

// Routes
app.get("/",(req,res) => {
    JET.getAllReservations().then((data) => {
        let now = moment();
        let dateInfo = {
            currentDay: now.weekday(),
            weekNumber: now.week(),
            nextYear: now.year(),
            prevYear: null,
            year: now.year(),
            nextWeek: null,
            prevWeek: null,
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

        // Changing year
        if(dateInfo.weekNumber >= 52){
            dateInfo.nextWeek = 1;
            dateInfo.nextYear = dateInfo.year + 1;
        }
        else{
            dateInfo.nextWeek = dateInfo.weekNumber + 1;
        }

        res.render("index",{
            dateInfo: dateInfo,
            reservations: data,
            error: null
        });
    }).catch((error) => {
        res.render("index",{
            dateInfo: null,
            reservations: null,
            error: "Error while loading data. Please try again later."
        });
    });
});
app.get("/date/:week/:year",(req,res) => {
    JET.getAllReservations().then((data) => {
        let now = moment();
        let realNow = moment();

        if(!isNaN(req.params.week) && req.params.week > 0 && req.params.week <= 52){
            now.week(req.params.week);
        }

        if(!isNaN(req.params.year)){
            now.year(req.params.year);
        }

        let dateInfo = {
            currentDay: (req.params.week == realNow.week() && req.params.year == realNow.year()) ? now.weekday() : null,
            weekNumber: now.week(),
            year: now.year(),
            nextYear: now.year(),
            prevYear: now.year(),
            nextWeek: null,
            prevWeek: null,
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

        // Changing year
        if(dateInfo.weekNumber >= 52){
            dateInfo.nextWeek = 1;
            dateInfo.nextYear = dateInfo.year + 1;
        }
        else{
            dateInfo.nextWeek = dateInfo.weekNumber + 1;
        }

        if(realNow.diff(now.week(-1),"weeks") <= 0){
            if(dateInfo.weekNumber <= 1){
                dateInfo.prevWeek = 52;
                dateInfo.prevYear = dateInfo.year - 1;
            }
            else{
                dateInfo.prevWeek = dateInfo.weekNumber - 1;
            }
        }

        res.render("index",{
            dateInfo: dateInfo,
            reservations: data,
            error: null,
        });
    }).catch((error) => {
        res.render("index",{
            dateInfo: null,
            reservations: null,
            error: "Error while loading data. Please try again later.",
        });
    });
});

app.get("/date",(req,res) => {
    res.redirect("/");
});
app.get("/date/:week",(req,res) => {
    res.redirect("/");
});

app.get("/login",(req,res) => {
    res.render("login",{
        error: null
    });
});
app.get("/logout",(req,res) => {
    req.session.isLoggedIn = false;
    res.redirect("/");
});

app.get("/admin",(req,res) => {
    if(req.session.isLoggedIn === true){
        JET.getAllReservations().then((data) => {
            let now = moment();
            let dateInfo = {
                currentDay: now.weekday(),
                weekNumber: now.week(),
                year: now.year(),
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
    
            res.render("admin",{
                dateInfo: dateInfo,
                reservations: data  
            });
        }).catch((error) => {
            res.render("index",{
                dateInfo: null,
                reservations: null,
                error: "Error while loading data. Please try again later.",
            });
        });
    }
    else{
        res.redirect("/login");
    }
});

app.post("/newReservation",(req,res) => {
    //console.log(req.body);
    JET.newReservation(req.body).then(() => {
        res.redirect(`/date/${req.body.weekNumber}/${req.body.year}`);
    }).catch((error) => {
        res.redirect("/");
    });
});
app.post("/login",(req,res) => {
    JET.login(req.body).then(() => {
        req.session.isLoggedIn = true;
        res.redirect("/admin");
    }).catch(() => {
        res.render("login",{
            error: "Incorrect username or password"
        });
    });
});

// Käynnistetään palvelin
const port = process.env.PORT || 8000;
app.listen(port,() => {
    console.info(`The server started listening the port ${port}`);
});