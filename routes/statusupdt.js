const express = require('express');
const config = require('config');
const mysql = require("mysql2/promise");
const schedule = require("node-schedule")
const { use } = require('express/lib/application');

const statusupdt = express.Router();

function sms_status(user_id){
    let x = Math.floor(Math.random() * 2);   //0 or 1 ans => randomly assigning weather it was sent or not

    try{
        db.query(`UPDATE user_status SET sms_status = ${x} WHERE user_id = ${user_id}`);
    }catch(err){
        console.log(err);
    }

    if(x == 0){  //fail condition
        setTimeout(voicenote_status(user_id), 3600000);
    }
    else{
        setTimeout(voicenote_status(user_id), 7200000);
    }
}

function voicenote_status(user_id){
    let x = Math.floor(Math.random() * 2);   //0 or 1 ans => randomly assigning weather it was sent or not

    try{
        db.query(`UPDATE user_status SET voicent_status = ${x} WHERE user_id = ${user_id}`);    //setting complete or failed status
    }catch(err){
        console.log(err);
    }
}

async function setstatusexe(){
    try{
        let [user_status] = await db.query(`SELECT user_id, timezone FROM user_status;`);
        console.log(user_status[0].user_id)    

        for(let i=0; i<user_status.length; i++){
            if(user_status[i].user_tz == "EST"){
                sms_status(user_status[i].user_id);
            }
            if(user_status[i].user_tz == "CST"){
                setTimeout(sms_status(user_status[i].user_id), 3600000);  //1 hour later execute
            }
            if(user_status[i].user_tz == "PST"){
                setTimeout(sms_status(user_status[i].user_id), 10800000);  //3 hour later execute
            }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({"status": "all gud"});
    }catch(err){
        res.status(err.status || 500);
        res.render('error');
    }
}


statusupdt.route('/')
.get(async (req,res,next) => {
    try{
        const job = schedule.scheduleJob('* 9 * * *', function(){       //execute when 9 am
            console.log('The answer to life, the universe, and everything!');
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({"status": "All status will be updated soon"});
    }catch(err){
        res.status(err.status || 500);
        res.render('error');
    }
})

async function main(){
    db = await mysql.createConnection({
      host: config.get('db.host'),
      user: config.get('db.user'),
      password: config.get('db.password'),
      database: config.get('db.database'),
      timezone: config.get('db.timezone'),
      charset: config.get('db.charset')
    });
}
main();

module.exports = statusupdt;