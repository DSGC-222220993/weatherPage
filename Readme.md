# Weather App - Gemini Edition

Una aplicación de clima limpia y responsiva que utiliza la API de **OpenWeatherMap** para proporcionar datos meteorológicos en tiempo real y pronósticos para los próximos 5 días.

## Características principales
* **Búsqueda Inteligente**: Sugerencias de ciudades en tiempo real mientras escribes.
* **Persistencia de Datos**: Gracias al uso de `localStorage`, la app recuerda tu última búsqueda y tus ciudades favoritas incluso después de cerrar el navegador.
* **Sistema de Favoritos**: Guarda tus ciudades preferidas para un acceso rápido con un solo clic.
* **Recomendaciones Dinámicas**: Consejos personalizados según el estado del clima (lluvia, sol, nieve).
* **Resiliencia (Circuit Breaker)**: Sistema de reintentos y bloqueo temporal ante fallos de conexión para proteger la integridad de la app.

---

## Instalación y Ejecución Local

Sigue estos pasos para tener el proyecto funcionando en tu computadora:

### 1. Requisitos previos
* Un navegador web moderno (Chrome, Firefox, Edge).
* Una cuenta en [OpenWeatherMap](https://openweathermap.org/) para obtener tu propia **API KEY**.

### 2. Clonar o Descargar
Descarga los archivos del proyecto o clona el repositorio:

---

## Configuración de Seguridad
Este proyecto utiliza una API Key para obtener datos meteorológicos. Por seguridad:
1. El archivo `config.js` está excluido del repositorio mediante `.gitignore`.
2. Para despliegue en **Netlify**, se recomienda configurar una variable de entorno llamada `WEATHER_API_KEY`.

## Instrucciones de Despliegue (Netlify)
1. Conecta tu repositorio de GitHub a Netlify.
2. Ve a **Site Settings** > **Environment Variables**.
3. Añade la clave `WEATHER_API_KEY` con tu token de OpenWeather.
4. ¡Despliega y disfruta!

## Da click aqui para probar la pagina
* 