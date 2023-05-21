const express = require("express");
const https = require("https");
const bodyparser = require("body-parser");

const app = express();
app.use(bodyparser.urlencoded({extended: true}));

app.get("/",function(req,res){
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req,res){

    const loc = req.body.cityname;
    const apikey = "ace8de3c900696748c5a389d4eab753b";
    const unit = "metric";

    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + loc +"&appid=" + apikey +"&units=" + unit;

    https.get(url,function(response){
        response.on("data", function(data){
            const weatherdata = JSON.parse(data);
            const temp = weatherdata.main.temp;

            res.send("The temp of " + loc + " is " + temp);
        })
    })
})


app.listen(4000, function(){
    console.log("server set");
})