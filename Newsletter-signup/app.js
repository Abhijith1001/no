const express = require("express");
const bodyparser = require("body-parser");
const https = require("https");



const app = express();

app.use(bodyparser.urlencoded({extended : true}))

app.use(express.static("public"));

app.get("/", function(req,res){
    res.sendFile(__dirname + "/signup.html");
})

app.post("/" , function(req,res){
    var fname = req.body.first;
    var lname = req.body.last;
    var email = req.body.email;

    var data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields:{
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };

    var jsondata = JSON.stringify(data);

    const url = "https://us17.api.mailchimp.com/3.0/lists/1e6c14d66f";

    const options = {
        method: "POST",
        auth: "abhijith:5e4ea4c09c2fc596e750dce2cc0dc09e-us17"


    }

    const request =  https.request(url, options, function(response){

        if(response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");
        }else{
            res.sendFile(__dirname + "/failure.html");

        }

        response.on("data", function(data){
            console.log(jsondata);
        })

    })

    request.write(jsondata);
    request.end();
})

app.post("/failure.html", function(req,res){
    res.redirect("/");
})

app.listen(3000, function(){
    console.log("server is running on port 3000");
})


//list id
//1e6c14d66f

//apiley
//5e4ea4c09c2fc596e750dce2cc0dc09e-us17