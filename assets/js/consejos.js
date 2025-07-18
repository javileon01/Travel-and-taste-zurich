document.addEventListener("DOMContentLoaded", function () {

const apiKey = 'YCWJR24RPH88DHUQ75PU62GP4';
const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Zurich?unitGroup=metric&key=${apiKey}&contentType=json`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        const temp = data.currentConditions.temp;
        const condition = data.currentConditions.conditions;
        const icon = data.currentConditions.icon;
        document.getElementById('temp').textContent = `${temp}°`;
        document.getElementById('condition').textContent = condition;
        document.getElementById('weather-icon').src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${icon}.png`;
    })
    .catch(error => console.error('Error:', error));
});