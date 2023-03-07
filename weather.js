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


var cityString;

weatherApp.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "views/index.html"));
    
    if (req.query.city != undefined) {
        cityString = formatQueryStringToCityName(req.query.city);
        res.redirect('/current-weather');
    }
});

weatherApp.get('/current-weather', function(req, res) {
    // You can sign up for a free API key here: https://openweathermap.org/
    const apiKey = "yourapikeyhere";
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + cityString + "&units=metric&appid=" + apiKey;
    
    request(url, function(err, response, body) {
        if (err) {
            console.log("Error: " + err);
        }
        else {
            try {
                var weather = JSON.parse(body);

                var iconCode = weather.weather[0].icon;
                var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";
                
                res.render("currentWeather", { 
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
    
                console.log(`Weather data for ${weather.name} has been rendered to currentWeather.ejs`);
            }
            catch {
                console.log(`${cityString} was an invalid input, redirecting to error page.`);
                res.redirect('/error');
            }
        }
    });
});

weatherApp.get('/error', function(req, res) {
    res.sendFile(path.join(__dirname, "views/error.html"));
});

// Create server
weatherApp.listen(port, () => console.log(`Weather App is running on port ${port}.`));


// Converts query string to appropriate city name for OpenWeather API to use
function formatQueryStringToCityName(search) {
    search = search.toLowerCase();
    search = search.replace(" ", "+");
    return search;
}