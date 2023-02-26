// Dependencies
var express = require("express");
var path = require("path");
var request = require("request");

var weatherApp = express();
const port = 8080;

// Set view engine
weatherApp.set("view engine", "ejs");

// App configuration
weatherApp.use(express.static(path.join(__dirname, "public")));

weatherApp.get('/', function(req, res) {
    // City and API key removed for privacy reasons. 
    // You can receive and use a free API key from https://openweathermap.org/
    // To use the weather app, you can set your own definitions 
    // using your city name and your API key in this format:
    // 
    // var city = "your+city"; 
    // var apiKey = "yourapikey";

    var city = "";
    var apiKey = "";
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + apiKey;
    
    request(url, function(err, response, body) {
        if (err) {
            console.log(err);
        }
        else {
            var weather = JSON.parse(body);
            var iconCode = weather.weather[0].icon;
            var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";

            res.render("index", { 
                title: "Weather", 
                cityName: weather.name,
                wicon: iconUrl,
                temp: parseInt(weather.main.temp),
                feelsLike: parseInt(weather.main.feels_like),
                conditions: weather.weather[0].description,
                windSpeed: weather.wind.speed,
                pressure: weather.main.pressure / 10,
                humidity: weather.main.humidity
            });
            console.log(weather);
            console.log("Weather data has been rendered to Index");
        }
    });
});

// Create server
weatherApp.listen(port, () => console.log(`Weather App is running on port ${port}.`));