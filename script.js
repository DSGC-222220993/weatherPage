const API_BASE_URL = '/api/weather'; // backend endpoint (must be implemented)

class WeatherApp {
    constructor() {
        this.minRequestInterval = 2000; // ms
        this.lastRequestTime = 0;
        this.isLoading = false;
        this.debounceTimer = null;
        this.typingTimer = null;

        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        this.elements = {
            cityInput: document.getElementById('city-input'),
            searchButton: document.getElementById('search-button'),
            cityName: document.getElementById('city-name'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            weatherIcon: document.getElementById('weather-icon'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            message: document.getElementById('message')
        };
    }

    bindEvents() {
        // Debounced click
        this.elements.searchButton.addEventListener('click', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.handleSearch(), 300);
        });

        // Enter key
        this.elements.cityInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(this.debounceTimer);
                this.handleSearch();
            }
        });

        // Optional: auto-search while typing (after pause)
        this.elements.cityInput.addEventListener('input', (e) => {
            clearTimeout(this.typingTimer);
            const val = e.target.value.trim();
            if (val.length >= 3) {
                this.typingTimer = setTimeout(() => this.handleSearch(), 1000);
            }
        });
    }

    showMessage(text, type = 'info') {
        const el = this.elements.message;
        el.textContent = text;
        el.className = type; // allow styling by type
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        this.elements.searchButton.disabled = !!isLoading;
    }

    handleSearch() {
        const city = sanitizeInput(this.elements.cityInput.value);
        if (!city) {
            this.showMessage('Please enter a city name.', 'warning');
            return;
        }

        if (city.length < 2) {
            this.showMessage('City name must be at least 2 characters.', 'warning');
            return;
        }

        const now = Date.now();
        if (now - this.lastRequestTime < this.minRequestInterval) {
            this.showMessage('Please wait before searching again.', 'info');
            return;
        }

        this.fetchWeatherData(city);
    }

    async fetchWeatherData(city) {
        this.setLoading(true);
        this.showMessage('Loading...', 'info');
        try {
            const sanitizedCity = encodeURIComponent(city);
            const resp = await fetch(`${API_BASE_URL}?city=${sanitizedCity}`, {cache: 'no-store'});
            if (!resp.ok) {
                if (resp.status === 404) throw new Error('City not found');
                throw new Error(`HTTP ${resp.status}`);
            }
            const data = await resp.json();

            const safe = sanitizeWeatherData(data);
            this.updateWeatherUI(safe);
            this.showMessage('', '');
            this.lastRequestTime = Date.now();
        } catch (err) {
            console.error(err);
            this.showMessage('Could not fetch weather. Try again later.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    updateWeatherUI(data) {
        this.elements.cityName.textContent = data.name;
        this.elements.temperature.textContent = `Temperature: ${Math.round(data.temp)}°C`;
        this.elements.description.textContent = `Description: ${data.description}`;
        this.elements.humidity.textContent = `Humidity: ${data.humidity}%`;
        this.elements.windSpeed.textContent = `Wind Speed: ${(data.windSpeed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
        this.elements.weatherIcon.src = data.icon;
        this.elements.weatherIcon.alt = data.description || 'weather icon';
    }
}

/* -------------------- Sanitization helpers -------------------- */
function sanitizeInput(input) {
    if (input == null) return '';
    return input.toString().trim().replace(/[<>\"'`]/g, '').substring(0, 100);
}

function sanitizeWeatherData(data) {
    return {
        name: escapeHtml(data?.name || ''),
        temp: typeof data?.main?.temp === 'number' ? data.main.temp : 0,
        description: escapeHtml(data?.weather?.[0]?.description || ''),
        humidity: typeof data?.main?.humidity === 'number' ? data.main.humidity : 0,
        windSpeed: typeof data?.wind?.speed === 'number' ? data.wind.speed : 0,
        icon: sanitizeIconUrl(data?.weather?.[0]?.icon)
    };
}

function sanitizeIconUrl(iconCode) {
    const defaultUrl = 'https://openweathermap.org/img/wn/01d@2x.png';
    if (!iconCode || typeof iconCode !== 'string') return defaultUrl;

    const validIconCodes = ['01d','01n','02d','02n','03d','03n','04d','04n','09d','09n','10d','10n','11d','11n','13d','13n','50d','50n'];
    if (!validIconCodes.includes(iconCode)) return defaultUrl;
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});
