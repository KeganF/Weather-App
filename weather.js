// Dependencies
var express = require('express');
var path = require('path');

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
var lat;
var lon;


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
        const response = await fetch(url);
        const json = await response.json();
        lat = json[0].lat;
        lon = json[0].lon;
    }
    catch (err) {
        console.log('error: ' + err);
    }
    res.redirect('/weather');
});

// Returns API data for both weather and forecast as one result
async function getWeather() {
    var weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityString + '&units=metric&appid=' + apiKey;
    var forecastUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=metric&appid=' + apiKey;

    const weatherPromise = await fetch(weatherUrl);
    const forecastPromise = await fetch(forecastUrl);

    const result = {
        weather: await weatherPromise.json(),
        forecast: await forecastPromise.json()
    };

    return result;
}

app.get('/weather', function(req, res) {
    
    getWeather().then(function(result) {
        try {
            const weatherData = {
                city:       result.weather.name,
                temp:       parseInt(result.weather.main.temp),
                feelsLike:  parseInt(result.weather.main.feels_like),
                conditions: result.weather.weather[0].description,
                wIcon:      'http://openweathermap.org/img/wn/' + result.weather.weather[0].icon + '@2x.png',
                wind:       result.weather.wind.speed,
                humidity:   result.weather.main.humidity,
                pressure:   result.weather.main.pressure
            };
    
            var forecastData = [];
            for (var i = 0; i < 5; i++) {            
                const forecastDate = new Date(Date.parse(result.forecast.list[i].dt_txt));
    
                forecastData.push({
                    city:       result.forecast.city.name,
                    time:       forecastDate.getHours() + ':00', 
                    wIcon:      'http://openweathermap.org/img/wn/' + result.forecast.list[i].weather[0].icon + '@2x.png', 
                    conditions: result.forecast.list[i].weather[0].description, 
                    temp:       parseInt(result.forecast.list[i].main.temp), 
                }); 
            }
    
            res.render('currentWeather', {
                weather: weatherData,
                forecast: forecastData
            });
        }
        catch (err) {
            console.log('Error: ' + err);
            res.redirect('/error');
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
