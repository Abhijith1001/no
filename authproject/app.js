const express = require("express");
const path = require("path");
const session = require("express-session")
const flash = require("connect-flash");
const bodyparser = require("body-parser");
const expressValidator = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const app = express();
app.use(bodyparser.urlencoded({extended: true}));

const routes = require("./routes/index");
const users = require("./routes/user");


app.use(session({
    secret: 'sonic',
   saveUninitialized: true,
   resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(flash());

app.use("/", routes)
app.use("/users",users)
app.use(expressValidator())



app.use(express.static(path.join(__dirname,"public")));

app.use(expressValidator())


 app.use((req,res,next)=>{
     res.locals.messages = require("express-messages"(req,res));
     next();
 });

app.use("*",(req,res,next)=>{
    res.locals.user = req.user || null;
    next();
})

app.listen(4000, () => {
    console.log("server running");
})

module.exports = app;