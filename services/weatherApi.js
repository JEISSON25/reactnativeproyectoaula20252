// services/WeatherAPI.js
// Usando OpenMeteo (completamente gratuita, sin API key)
const BASE_URL = 'https://api.open-meteo.com/v1';

const WeatherAPI = {
  getWeatherByCity: async (city) => {
    try {
      console.log('🌤️ Obteniendo clima para:', city);
      
      // Primero obtenemos las coordenadas de la ciudad
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
      );
      
      if (!geoResponse.ok) {
        throw new Error('Error al obtener coordenadas de la ciudad');
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Ciudad "${city}" no encontrada`);
      }
      
      const { latitude, longitude } = geoData.results[0];
      console.log('📍 Coordenadas obtenidas:', { latitude, longitude });
      
      // Ahora obtenemos el clima usando las coordenadas
      const weatherResponse = await fetch(
        `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Error al obtener datos del clima');
      }
      
      const weatherData = await weatherResponse.json();
      console.log('✅ Datos del clima recibidos:', weatherData);
      
      // Convertir códigos de clima a descripciones
      const weatherDescriptions = {
        0: 'Cielo despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna intensa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        95: 'Tormenta'
      };
      
      const current = weatherData.current;
      const weatherCode = current.weather_code;
      
      return {
        temp: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        description: weatherDescriptions[weatherCode] || 'Condición desconocida',
        icon: weatherCode.toString(),
        feels_like: Math.round(current.apparent_temperature),
        wind_speed: Math.round(current.wind_speed_10m),
        uv: weatherCode,
        city: city
      };
    } catch (error) {
      console.error('💥 Error al obtener el clima:', error);
      throw error;
    }
  },
};

export { WeatherAPI };