const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const card = document.getElementById("weatherCard");
const statusText = document.getElementById("status");
const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("weatherIcon");
const suggestionsContainer = document.getElementById("suggestions-container");
const forecastCard = document.getElementById("forecastCard");
const forecastContainer = document.getElementById("forecastContainer");
const recommendationEl = document.getElementById("recommendation");
const favBtn = document.getElementById("favBtn");
const favoritesList = document.getElementById("favoritesList");

let currentCityData = null;
let failures = 0;
let circuitOpen = false;
let circuitTimeout = null;

const API_KEY = (window.ENV && window.ENV.WEATHER_API_KEY) ? window.ENV.WEATHER_API_KEY : "";

// --- CARGA INICIAL (UNIFICADA) ---
document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();

    const lastCity = localStorage.getItem("lastSearchedCity");
    
    if (lastCity && lastCity !== "undefined" && lastCity !== "null") {
        getWeather(lastCity);
    } else {
        getWeather("Hermosillo");
    }
});

// --- FUNCIONES DE RED ---
async function fetchWithRetry(url, retries = 2) {
    try {
        const response = await fetch(url);
        if (response.status === 404) throw new Error("city name not founded");
        if (!response.ok) throw new Error("Error querying the API");
        failures = 0;
        return await response.json();
    } catch (error) {
        if (error.message === "city name not founded") throw error;
        if (retries > 0) {
            return fetchWithRetry(url, retries - 1);
        } else {
            failures++;
            if (failures >= 3) openCircuit();
            throw error;
        }
    }
}

function openCircuit() {
    circuitOpen = true;
    statusText.textContent = "Unstable connection. Please wait.";
    clearTimeout(circuitTimeout);
    circuitTimeout = setTimeout(() => {
        circuitOpen = false;
        failures = 0;
        statusText.textContent = "You can try again.";
    }, 15000);
}

// --- LÓGICA PRINCIPAL ---
async function getWeather(city) {
    if (!navigator.onLine || circuitOpen) {
        statusText.textContent = "Unavailable connection.";
        return;
    }
    
    statusText.textContent = "Loading...";

    try {
        const urlWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=en&appid=${API_KEY}`;
        const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=en&appid=${API_KEY}`;

        const dataWeather = await fetchWithRetry(urlWeather);
        const dataForecast = await fetchWithRetry(urlForecast);

        showWeather(dataWeather);
        showForecast(dataForecast);

        localStorage.setItem("lastSearchedCity", dataWeather.name);
        statusText.textContent = "Data loaded successfully.";
    } catch (error) {
        console.error("Fetch Error:", error.message);
        statusText.textContent = error.message === "city name not founded" ? "City name not found." : "Error loading data.";

        // LIMPIEZA VISUAL EN CASO DE ERROR
        card.classList.add("hidden");
        forecastCard.classList.add("hidden");
        currentCityData = null;
    }
}

// --- RENDERIZADO ---
function showWeather(data) {
    currentCityData = data; 
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    temperatureEl.textContent = `${Math.round(data.main.temp)} °C`;
    descriptionEl.textContent = data.weather[0].description;
    humidityEl.textContent = data.main.humidity;
    windEl.textContent = Math.round(data.wind.speed * 3.6); 
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    const favorites = JSON.parse(localStorage.getItem("weatherFavs")) || [];
    favBtn.src = favorites.includes(data.name) ? "img/ic_favorite.png" : "img/ic_unfavorite.png";

    recommendationEl.textContent = getRecommendation(data.weather[0].id, data.main.temp);
    card.classList.remove("hidden");
}

function showForecast(data) {
    forecastContainer.innerHTML = ""; 
    const dailyData = data.list.filter((item, index) => index % 8 === 0);
    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const dayElement = document.createElement("div");
        dayElement.className = "forecast-item";
        dayElement.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather">
            <p>${Math.round(day.main.temp)}°C</p>
        `;
        forecastContainer.appendChild(dayElement);
    });
    forecastCard.classList.remove("hidden");
}

function getRecommendation(weatherId, temp) {
    if (weatherId >= 200 && weatherId < 600) return "It's raining. Stay indoors.";
    if (weatherId >= 600 && weatherId < 700) return "Snowy day! Stay warm.";
    if (weatherId === 800) return temp > 25 ? "Sunny and warm! Beach time." : "Clear skies. Great for a walk.";
    return "A bit cloudy. Good for a city tour.";
}

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem("weatherFavs")) || [];
    favoritesList.innerHTML = favorites.length === 0 ? "<p>No favorites yet</p>" : "";
    favorites.forEach(cityObj => {
        let city, country;
        if (typeof cityObj === 'string') {
            city = cityObj;
            country = '';
        } else {
            city = cityObj.name;
            country = cityObj.country;
        }
        const span = document.createElement("span");
        span.className = "fav-item";
        span.textContent = country ? `${city}, ${country}` : city;
        span.onclick = () => getWeather(country ? `${city},${country}` : city);
        favoritesList.appendChild(span);
    });
}

// --- EVENTOS ---
input.addEventListener("keyup", async () => {
    const query = input.value.trim();
    if (query.length < 3) {
        suggestionsContainer.innerHTML = "";
        return;
    }
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
    try {
        const response = await fetch(geoUrl);
        const cities = await response.json(); 
        suggestionsContainer.innerHTML = ""; 
        cities.forEach(city => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerHTML = `<strong>${city.name}</strong> <span>${city.country}</span>`;
            div.addEventListener("click", () => {
                input.value = city.name;
                suggestionsContainer.innerHTML = "";
                getWeather(city.name);
            });
            suggestionsContainer.appendChild(div);
        });
    } catch (e) { console.error("Suggestions error", e); }
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (city) {
        suggestionsContainer.innerHTML = ""; 
        getWeather(city);
    }
});

favBtn.addEventListener("click", () => {
    if (!currentCityData) return;
    let favorites = JSON.parse(localStorage.getItem("weatherFavs")) || [];
    // Use object {name, country}
    const cityObj = { name: currentCityData.name, country: currentCityData.sys.country };
    // Find index by name+country
    const cityIndex = favorites.findIndex(fav => (typeof fav === 'object' && fav.name === cityObj.name && fav.country === cityObj.country) || (typeof fav === 'string' && fav === cityObj.name));
    if (cityIndex === -1) {
        favorites.push(cityObj);
    } else {
        favorites.splice(cityIndex, 1);
    }
    localStorage.setItem("weatherFavs", JSON.stringify(favorites));
    showWeather(currentCityData);
    renderFavorites();
});

document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) suggestionsContainer.innerHTML = "";
});