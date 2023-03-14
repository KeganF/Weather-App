// Dependencies
var express = require('express');
var path = require('path');
var request = require('request');

const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));


var app = express();
const port = 8080;


// Set view engine
app.set('view engine', 'ejs');

// App configuration
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


const apiKey = 'yourapikeygoeshere';
var cityString;
var lat = '';
var lon = '';


// Routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});


app.post('/location', function(req, res) {
    cityString = formatQueryStringToCityName(req.body.city);
    res.redirect('/location-data');
});


app.get('/location-data', async function(req, res) {
    var url = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityString + '&limit=1&appid=' + apiKey;
    
    try {
        const res = await fetch(url);
        const json = await res.json();
        lat = json[0].lat;
        lon = json[0].lon;
    }
    catch (err) {
        console.log('error: ' + err);
    }
    res.redirect('/weather');
});


app.get('/weather', function(req, res) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=metric&appid=' + apiKey;
    var forecast = [];

    request(url, function(err, response, body) {
        if (err) {
            console.log('Error: ' + err);
        }
        else {
            try {
                var weather = JSON.parse(body);
                
                for (var i = 0; i < 5; i++) {
                    var iconCode = weather.list[i].weather[0].icon;
                    var iconUrl = 'http://openweathermap.org/img/wn/' + iconCode + '@2x.png';
                    
                    const forecastDate = new Date(Date.parse(weather.list[i].dt_txt));
                    const fDate = (forecastDate.getMonth() + 1) + '/' + forecastDate.getDate();
                    const fTime = forecastDate.getHours() + ':00';

                    forecast.push({
                        city: weather.city.name,
                        time: fTime, 
                        date: fDate, 
                        wIcon: iconUrl, 
                        conditions: weather.list[i].weather[0].description, 
                        temp: parseInt(weather.list[i].main.temp), 
                        feelsLike: parseInt(weather.list[i].main.feels_like),
                        windSpeed: weather.list[0].wind.speed,
                        pressure: weather.list[0].main.pressure / 10,
                        humidity: weather.list[0].main.humidity,
                    });
                }

                res.render('currentWeather', { 
                    title: 'Weather', 
                    forecast: forecast
                });
    
                console.log('Weather data rendered to currentWeather.ejs');
            }
            catch {
                console.log('Redirecting to error page');
                res.redirect('/error');
            }
        }
    });
});


app.get('/error', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/error.html'));
});


// Create server
app.listen(port, () => console.log(`Weather App is running on port ${port}.`));


// Converts query string to appropriate city name for OpenWeather API to use
function formatQueryStringToCityName(search) {
    search = search.toLowerCase();
    search = search.replace(" ", "+");
    return search;
}
