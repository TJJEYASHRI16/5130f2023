const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const os = require('os');
const app = express();


app.use(express.static("public"));
app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://127.0.0.1:27017/userDB");


const UserSchema={
    email:String,
    password:String
};

const User = new mongoose.model("User",UserSchema);

app.get("/",function(req,res){
res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",async function(req,res){
    const new_user=new User({
        email:req.body.username,
        password:req.body.password
    });
    await new_user.save();
    res.render("login", { username: req.body.username, password: req.body.password} );
});
app.post("/login", async function (req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({ email: username });
        if(!foundUser){
            res.send("<h1>Incorrect Login Details.</h1>");
            return;
        }
        const networkInterfaces = os.networkInterfaces();
        let ipAddress ='';

for (const interfaceName in networkInterfaces) {
  const interface = networkInterfaces[interfaceName];

  for (const address of interface) {
    if (address.family === 'IPv4' && !address.internal) {
      
      ipAddress= address.address;
      console.log(ipAddress);
      break;
    }
  }
}
        
        

           // Check if the IP address is valid
    if (!ipAddress) {
        console.error("Unable to determine IP address");
        res.send("Error fetching location. Please try again later.");
        return;
      }
  
      // Fetch location information using the IP address
      let locationData;
      try {
        const locationResponse = await axios.get(
          `https://ipinfo.io/${ipAddress}?token=71073e7ce2944e`
        );
        locationData = locationResponse.data;
      } catch (error) {
        console.error("Error fetching location information:", error.message);
        res.send("Error fetching location. Please try again later.");
        return;
      }
  
      // Handle incomplete location data
      if (!locationData.city) {
        console.warn("Location data incomplete, using default city");
        locationData.city = "Boston";
      }
  
      // Fetch weather information using the location data
    //   console.log(locationData.city );
      const weatherApiKey = "b69fe4bd1be1040fe6565a38249b21af";
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${locationData.city}&units=imperial&appid=${weatherApiKey}`
      );
      
      const weatherData = weatherResponse.data.main.temp;
      const weatherFeelsLike = weatherResponse.data.main.feels_like;
        
      // Render the 'secrets' view with location and weather data
      res.render("secrets", { location: locationData.city, weather: weatherData ,weatherlike : weatherFeelsLike});
    } catch (error) {
      console.error("General error:", error.message);
      res.send("Error fetching location or weather. Please try again later.");
    }
  });
app.get("/login",function(req,res){
        res.render("login");
});

app.listen("3000" , function(){
    console.log("Server started");
})
