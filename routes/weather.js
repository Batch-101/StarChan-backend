var express = require('express');
var router = express.Router();

const weatherKey = process.env.WEATHER_API_KEY

router.get('/', (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=bordeaux&appid=${weatherKey}&units=metric&lang=fr`)
        .then(response => response.json())
        .then(apiWeatherData => {
            res.json({
                main: apiWeatherData.weather[0].main,
                icon: apiWeatherData.weather[0].icon,
                temp: Math.round(apiWeatherData.main.temp),
                speedWind: apiWeatherData.wind.speed,
                clouds: apiWeatherData.clouds.all,
                name: apiWeatherData.name
            });
        })
})

router.get('/sun', (req, res) => {
    fetch('https://api.sunrise-sunset.org/json?lat=44.8333&lng=-0.57918')
        .then(response => response.json())
        .then(apiSunData => {
            res.json({
                sunrise: apiSunData.results.sunrise,
                sunset: apiSunData.results.sunset,
                astronomicalTwilightBegin: apiSunData.results.astronomical_twilight_begin,
                astronomicalTwilightEnd: apiSunData.results.astronomical_twilight_end
            });
        })
})


module.exports = router;