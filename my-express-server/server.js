//jshint esversion6

const { response } = require("express");
const express = require("express");

const app = express();

app.get("/", function (req, res) {
    res.send("<h1>Hai ,I'm Inevictable</h1>");
});

app.get("/about", function (req, res) {
    res.write("name:abhijith");
    res.write("age:22" );
    res.write("status:single" );
    res.end();
});

app.get("/contact", function (req, res) {
    res.send("<h1>Hai ,I'm nj</h1>");
});

app.listen(4000, function () {
    console.log("sever run on port 4000");
});