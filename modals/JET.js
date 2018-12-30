"use strict";

// Crypton dokumentaatio suosittelee varmistamaan, että käytössä oleva Node.js -ympäristö sisältää crypto-moduulin.
let crypto;
try{
    crypto = require("crypto");
}
catch(error){
    throw "Crypto not available. Exiting."
}

const fs = require("fs");

const datafile = "./data.json";

// Luodaan tietokantatiedosto, jos sitä ei ole olemassa
if(!fs.existsSync(datafile)){
    let emptyJSON = {
        users: [

        ],
        reservations: [

        ]
    };
    fs.writeFile(datafile,JSON.stringify(emptyJSON,null,2),(error) => {
        if(!error){
            console.info(`${datafile} file was not found and new one was created`);
        }
    });
}

module.exports = {
    createAdminAccount: (password) => {
        return new Promise((resolve,reject) => {
            fs.readFile(datafile,"UTF-8",(error,data) => {
                if(!error){
                    data = JSON.parse(data);
                    let adminAccount = {
                        username: "admin",
                        password: crypto.createHash("sha256").update(password).digest("hex")
                    }
                    data.users.push(adminAccount);
                    fs.writeFile(datafile,JSON.stringify(data,null,2),(error) => {
                        if(!error){
                            resolve();
                        }
                        else{
                            reject(error);
                        }
                    });
                }
                else{
                    reject(error);
                }
            });
        });
    },
    newReservation: (body) => {
        return new Promise((resolve,reject) => {
            let thisReservation = {
                name: body.name,
                email: body.email || null,
                message: body.extraInfo || null,
                time : {
                    weekNumber: body.weekNumber,
                    year: body.year,
                    cellId: body.cellId
                }
            };
            fs.readFile(datafile,"UTF-8",(error,data) => {
                if(!error){
                    let currentData = JSON.parse(data);
                    
                    let doesExist = currentData.reservations.find((reservation) => {
                        return reservation.time.weekNumber === thisReservation.time.weekNumber && reservation.time.year === thisReservation.time.year && reservation.time.cellId === thisReservation.time.cellId;
                    });

                    if(!doesExist){
                        currentData.reservations.push(thisReservation);
                        fs.writeFile(datafile,JSON.stringify(currentData,null,2),(error) => {
                            if(!error){
                                resolve();
                            }
                            else{
                                reject();
                            }
                        });
                    }
                    else{ // If there's already a reservation on this slot
                        reject();
                    }
                }
                else{ // Error reading file
                    reject();
                }
            });
        });
    },
    getAllReservations: () => {
        return new Promise((resolve,reject) => {
            fs.readFile(datafile,"UTF-8",(error,data) => {
                if(!error){
                    resolve(JSON.parse(data).reservations);
                }
                else{
                    reject(error);
                }
            });
        });
    },
    login: (body) => {
        return new Promise((resolve,reject) => {
            fs.readFile(datafile,"UTF-8",(error,data) => {
                if(!error){
                    let users = JSON.parse(data).users;
                    let hash = (body.password) ? crypto.createHash("sha256").update(body.password).digest("hex") : "Nope";
                    let thisUser = users.find((user) => { // Palauttaa undefined jos käyttäjää ei löydy
                        return body.username === user.username;
                    });
                    if(thisUser && hash === thisUser.password){
                        resolve();
                    }
                    else{
                        reject();
                    }
                }
                else{
                    reject();
                }
            });
        });
    }
};