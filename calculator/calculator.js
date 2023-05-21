const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true  }));

app.get("/bmicalculator", function(req,res){
    //res.sendFile("index.html");
    res.sendFile(__dirname + "/bmicalculator.html");
});

app.post("/", function(req,res){
    
    var n1 = Number(req.body.weight);
    var n2 = parseFloat(req.body.height);

    var result =(n1 / (n2 * n2));

  
    res.send("Thanku " + result);
});

app.listen(3000, function(){
    console.log("server run on 3000");
});
