//jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");


const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true,})


const userSchema = new mongoose.Schema({
    email: String,
    password: String
})


const User = new mongoose.model("User", userSchema)



app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", async function(req, res){

  

  const newUser = new User({
    email: req.body.username,
     password: await bcrypt.hash(req.body.password, 10)
  });

  try {
    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.log(err);
    // Handle the error appropriately, such as showing an error page
  }
});


app.post("/login", async function(req, res) {
    const username = req.body.username;
    const plaintextPassword = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser) {
            // Compare the entered plaintext password with the hashed password from the database
            bcrypt.compare(plaintextPassword, foundUser.password, function(err, result) {
                if (err) {
                    console.log(err);
                    // Handle the error appropriately
                    return;
                }

                if (result) {
                    res.render("secrets"); // Successful login
                } else {
                    res.redirect("/login"); // Redirect to login page if authentication fails
                }
            });
        } else {
            // User not found
            res.redirect("/login"); // Redirect to login page
        }
    } catch (err) {
        console.log(err);
        // Handle the error appropriately
    }
});





app.listen(3000, function(){
    console.log("server started on port 3000.");
})