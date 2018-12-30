"use strict";

/*
    Jani Haiko (D5209)
    TKMI17SP
    Sovellusohjelmointi 2 / Janne Turunen
    Soveltava harjoitustyö
*/

console.clear();
console.info("Starting up... Please wait!");

// Ladataan asetukset ja tarkastetaan onko admin-tunnus jo olemassa
let fs = require("fs");
const settings = JSON.parse(fs.readFileSync("settings.json","UTF-8"));
const adminAccountExits = fs.existsSync("data.json");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const moment = require("moment");
const readlineSync = require("readline-sync");

const app = express();

const JET = require("./modals/JET.js");

// Kysytään komentorivi-ikkunassa minkä salasanan käyttäjä haluaa admin-tunnukselle
if(!adminAccountExits && !settings.noInteractiveConsole){
    const adminPassword = readlineSync.questionNewPassword("Input password for admin account:",{
        min: 8,
        max: 256
    });
    console.clear();
    JET.createAdminAccount(adminPassword).then(() => {
        console.info("Admin account was created with username 'admin'");
        JET.createAdminAccount = undefined;
    }).catch((error) => {
        throw error;
    });
}

fs = undefined; // Poistetaan fs käytöstä tietoturvasyistä kun sitä ei enää tarvita

app.set("views","./views");
app.set("view engine","ejs");

// Käytetään päivämäärien käsittelyssä suomalaista kalenteria
// Näin vältytään monilta päänsäryiltä
moment.locale("fi");

app.use(express.static("./public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: settings.session_secret || String(Math.floor(Math.random() * 999999) + 9999),
    resave: false,
    saveUninitialized: false
}));

// Jos isLoggedIn-muuttujaa ei ole, luodaan se
app.use((req,res,next) => {
    if(req.session.isLoggedIn === undefined){
        req.session.isLoggedIn = false;
    }
    next();
});

// Routes
app.get("/",(req,res) => {
    JET.getAllReservations().then((data) => {
        let now = moment();
        let dateInfo = {
            currentDay: now.weekday(), // 0-6, huomioi viikon aloituspäivän eri maissa
            weekNumber: now.week(), // 1-52
            nextYear: now.year(),
            prevYear: null, // Etusivu näyttää aina nykyisen viikon, jolloin taaksepäin ei pääse
            year: now.year(),
            nextWeek: null, // Täytetään alempana
            prevWeek: null, // Etusivu näyttää aina nykyisen viikon, jolloin taaksepäin ei pääse
            dates: [ // Päivämäärät otetaan halutussa localessa
                now.locale(settings.moment_language || "en").weekday(0).format("l"), // locale-metodia tarvitsee kutsua vain kerran
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

        res.status(200).render("index",{
            dateInfo: dateInfo,
            companyName: settings.company_name || "JustEnoughTime",
            reservations: data,
            error: null
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).render("index",{
            dateInfo: null,
            companyName: settings.company_name || "Just Enough Time",
            reservations: null,
            error: "Error while retrieving data. Please try again later."
        });
    });
});
app.get("/date/:week/:year",(req,res) => {
    JET.getAllReservations().then((data) => {
        let now = moment();
        let realYear;
        let realNow = moment();

        if(!isNaN(req.params.year) && req.params.year >= realNow.year() && req.params.year <= realNow.year() + settings.yearsToFuture){
            now.year(req.params.year);
        }
        else{ // TODO: Better handler for this
            res.redirect("/");
            return true;
        }

        if(!isNaN(req.params.week) && req.params.week >= 1 && req.params.week <= 52){
            realYear = now.year(); // Otetaan vuosi talteen ennen viikon muuttamista, koska muuten tulee ongelmia
            now.week(req.params.week);
        }
        else{ // TODO: Better handler for this
            res.redirect("/");
            return true;
        }

        let dateInfo = {
            currentDay: (Number(req.params.week) === realNow.week() && Number(req.params.year) == realNow.year()) ? now.weekday() : null,
            weekNumber: now.week(),
            year: realYear,
            nextYear: realYear,
            prevYear: realYear,
            nextWeek: null,
            prevWeek: null,
            dates: [
                now.locale(settings.moment_language || "en").weekday(0).format("l"),
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
        if(realNow.weekday(3).diff(now.locale("fi").weekday(3).week(-1),"weeks") <= 1){
            if(dateInfo.weekNumber <= 1){
                dateInfo.prevWeek = 52;
                dateInfo.prevYear = dateInfo.year - 1;
            }
            else{
                dateInfo.prevWeek = dateInfo.weekNumber - 1;
            }
        }

        res.status(200).render("index",{
            dateInfo: dateInfo,
            companyName: settings.company_name || "Just Enough Time",
            reservations: data,
            error: null,
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).render("index",{
            dateInfo: null,
            companyName: settings.company_name || "Just Enough Time",
            reservations: null,
            error: "Error while retrieving data. Please try again later."
        });
    });
});

// Jos parametreja puuttuu, ohjataan etusivulle
app.get("/date",(req,res) => {
    res.redirect("/");
});
app.get("/date/:week",(req,res) => {
    res.redirect("/");
});

app.get("/login",(req,res) => {
    res.status(200).render("login",{
        companyName: settings.company_name || "JustEnoughTime",
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
    
            res.status(200).render("admin",{
                dateInfo: dateInfo,
                companyName: settings.company_name || "Just Enough Time",
                reservations: data,
            });
        }).catch((error) => {
            console.error(error);
            res.status(500).render("index",{
                dateInfo: null,
                companyName: settings.company_name || "Just Enough Time",
                reservations: null,
                error: "Error while retrieving data. Please try again later."
            });
        });
    }
    else{ // Jos käyttäjä ei ole kirjautunut
        res.redirect("/login");
    }
});

app.post("/newReservation",(req,res) => {
    //console.log(req.body);

    let weHaveError = false;
    if(req.body.name && req.body.weekNumber && req.body.year && req.body.cellId){
        if(req.body.name.length < 60 && req.body.weekNumber >= 1 && req.body.weekNumber <= 52 && req.body.year >= moment().year() && req.body.year <= moment().year() + settings.yearsToFuture && req.body.cellId >= 0 && req.body.cellId <= 62){
            if((!req.body.email || req.body.email.length <= 50) && (!req.body.extraInfo || req.body.extraInfo.length <= 500)){
                JET.newReservation(req.body).then(() => {
                    res.redirect(`/date/${req.body.weekNumber}/${req.body.year}`);
                }).catch(() => {
                    res.status(500).render("index",{
                        dateInfo: null,
                        reservations: null,
                        error: "Error while saving your reservation. Please try again later."
                    });
                });
            }
            else{
                weHaveError = true;
            }
        }
        else{
            weHaveError = true;
        }
    }
    else{
        weHaveError = true;
    }

    if(weHaveError){
        res.status(400).render("index",{
            dateInfo: null,
            reservations: null,
            companyName: settings.company_name || "JustEnoughTime",
            error: "Error while saving your reservation. Please try again later."
        });
    }
});
app.post("/login",(req,res) => {
    JET.login(req.body).then(() => {
        req.session.isLoggedIn = true;
        res.redirect("/admin");
    }).catch(() => {
        res.status(400).render("login",{
            companyName: settings.company_name || "JustEnoughTime",
            error: "Incorrect username or password"
        });
    });
});

// Käynnistetään palvelin
const port = process.env.PORT || settings.port || 8000;
app.listen(port,() => {
    console.info(`The server started listening the port ${port}`);
});