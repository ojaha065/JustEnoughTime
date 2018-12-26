"use strict";

// Crypton dokumentaatio suosittelee varmistamaan, että käytössä oleva Node.js -ympäristö sisältää crypto-moduulin.
let crypto;
try{
    crypto = require("crypto");
}
catch(error){
    throw "Crypto-moduuli ei ole käytettävissä. Lopetetaan."
}

const fs = require("fs");

const datafile = "./data.json";

// Luodaan tietokantatiedosto, jos sitä ei ole olemassa
if(!fs.existsSync(datafile)){
    let emptyJSON = {
        users: [
            {
                username: "admin",
                password: "1a8c5de43cd21c6e4a0ea70d01bbb380660cd3192e4eb1dd2f24d79e12bce1e2" // kissakala
            }
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
    newReservation: (body) => {
        return new Promise((resolve,reject) => {
            let thisReservation = {
                name: body.name,
                email: (body.email) ? body.email : null,
                message: (body.extraInfo) ? body.extraInfo : null,
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
                                reject(error);
                            }
                        });
                    }
                    else{
                        reject();
                    }
                }
                else{
                    reject(error);
                }
            });
        });
    },
    getAllReservations: () => {
        return new Promise((resolve,reject) => {
            fs.readFile(datafile,"UTF-8",(error,data) => {
                if(!error){
                    reject(JSON.parse(data).reservations);
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
                    let hash = crypto.createHash("sha256").update(body.password).digest("hex");
                    console.log(hash);
                    let thisUser = users.find((user) => {
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
                    reject(error);
                }
            });
        });
    }
};