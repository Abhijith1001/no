const { json } = require("express");
const express = require("express");
const https = require("https");
const bodyparser = require("body-parser");

const app = express();
app.use(bodyparser.urlencoded({extended: true}));

app.get("/", function(req,res){

    res.sendFile(__dirname + "/index.html");
    
})

app.post("/", function(req,res){
    //console.log(req.body.cityname);
    const query = req.body.cityname;
    const apikey = "ace8de3c900696748c5a389d4eab753b";
    const unit = "metric";

    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apikey + "&units="+ unit;
   
    https.get(url, function(response){
        //console.log(response.statusCode);

        response.on("data",function(data){
            //console.log(data);
            const weatherdata =  JSON.parse(data);
            const temp = weatherdata.main.temp;
            const desc = weatherdata.weather[0].description;
            const icon = weatherdata.weather[0].icon;
            const image = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
            res.write("<h1>The tempreture in " + query +" is " + temp + " degree celcius.<h1>");
            //res.write("<img src= " + image + ">");
            res.send();
        })
    });
})





app.listen(3000, function(){
    console.log("server running on port 3000");
})