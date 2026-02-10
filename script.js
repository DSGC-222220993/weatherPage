const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const card = document.getElementById("weather-card");
const status = document.getElementById("status");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");

const CONFIG={
    retries: 2,
    timeout: 5000,
    circuitBreakerTime: 15000
};

let circuitOpenUntil = 0;

const API_KEY= window.ENV?.WEATHER_API_KEY;

async function fetchWithRetry(url, retries = CONFIG.retries) {
    if (Date.now() < circuitOpenUntil) {
        throw new Error("Circuit breaker is open. Please try again later.");
    }
    try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), CONFIG.timeout);

    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) throw new Error("Error fetching data");

    return await res.json();
  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1);
    } else {
      circuitOpenUntil = Date.now() + CONFIG.circuitBreakerTime;
      throw err;
    }
  }
}

async function getWeather(city) {
  if (!API_KEY) {
    statusText.textContent = "The API key is not detected.";
    return;
  }

  statusText.textContent = "Loading...";
  card.classList.add("hidden");

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`;
    const data = await fetchWithRetry(url);

    cityName.textContent = data.name;
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    desc.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} km/h`;
    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    card.classList.remove("hidden");
    statusText.textContent = "";
  } catch (error) {
    if (!navigator.onLine) {
      statusText.textContent = "Theres no internet connection. Please check your connection and try again.";
    } else {
      statusText.textContent = error.message;
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (city) getWeather(city);
});