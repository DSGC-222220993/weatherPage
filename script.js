const apiKey = 'c24f4dd6390f2e981bd58058d6275a10'; 

const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weather-icon");
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const message = document.getElementById('message');

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === '') {
        message.textContent = "Please enter a city name.";
        return;
    }
    fetchWeatherData(city);
});

function fetchWeatherData(city) {
    message.textContent = 'Loading...';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            updateWeatherUI(data);
            message.textContent = '';
        })
        .catch(error => {
            message.textContent =  'Check your internet connection and try again.';
        });
}

function updateWeatherUI(data) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}