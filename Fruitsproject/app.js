const express = require("express");
const mongoose = require("mongoose");
const app = express();


mongoose.connect("mongodb://127.0.0.1:27017/mydb", { useNewUrlParser: true });

var conn = mongoose.connection;


conn.on('connected', function () {
  console.log('database is connected successfully');
});


conn.on('disconnected', function () {
  console.log('database is disconnected successfully');
})


// Defining User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    age: Number,
    skill: {
      type: Number,
      min: 1,
      max: 10
    }
  }
)

// Defining User model
const User = mongoose.model('User', userSchema);

// Create collection of Model
User.createCollection().then(function (collection) {
  console.log('Collection is created!');
});



const user = new User({
  name: "abhi",
  age: 24,
  skill: 99
})



// const user1 = new User({
//   name: "abhu",
//   age: 23,
// })
// const user2 = new User({
//   name: "abi",
//   age: 22,
// })
// const user3 = new User({
//   name: "ahi",
//   age: 24,
// })


// User.insertMany([user1, user2, user3], function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("everything saved");
//   }
// })



//user.save();


User.find(function (err, users) {
  if (err) {
    console.log(err)
  }
  else {

    mongoose.connection.close();

    users.forEach(user => {
      console.log(user);
    });
  }
})

User.updateOne({_id:"6395f94531333d6545b36aaf"}, {name: "joju"}, function(err){
  if(err){
    console.log(err);
  }else{
    console.log("updated");
  }
})

User.deleteOne({name: "joju"},function(err){
  if(err){
    console.log(err);
  }else{
    console.log("deleted");
  }
})



app.listen(3000, () => {
  console.log("running");
})



