"use strict";

const fs = require("fs");

const datafile = "./data.json";

// Luodaan tietokantatiedosto, jos sitä ei ole olemassa
if(!fs.existsSync(datafile)){
    let emptyJSON = {
        users: [
            {
                username: "admin",
                password: "kissakala"
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
                    reject(error);
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
                    let thisUser = users.find((user) => {
                        return body.username === user.username;
                    });
                    if(thisUser && body.password === thisUser.password){
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