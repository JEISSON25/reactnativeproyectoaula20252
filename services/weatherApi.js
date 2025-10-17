// services/WeatherAPI.js
// Usando OpenMeteo (completamente gratuita, sin API key)
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { HistoricalCache } from '../src/utils/HistoricalCache';

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

  /**
   * Obtiene datos históricos del clima para una ciudad específica
   * @param {string} city - Nombre de la ciudad
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Datos históricos del clima
   */
  getHistoricalWeather: async (city, startDate, endDate) => {
    try {
      console.log('📊 Obteniendo datos históricos para:', city);
      
      // Obtener coordenadas de la ciudad
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
      
      // Obtener datos históricos
      const historicalResponse = await fetch(
        `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation&start_date=${startDate}&end_date=${endDate}&timezone=auto`
      );
      
      if (!historicalResponse.ok) {
        throw new Error('Error al obtener datos históricos');
      }
      
      const historicalData = await historicalResponse.json();
      console.log('✅ Datos históricos obtenidos:', historicalData);
      
      return historicalData;
    } catch (error) {
      console.error('❌ Error al obtener datos históricos:', error);
      throw error;
    }
  },

  /**
   * Guarda datos históricos del clima en Firebase
   * @param {string} city - Nombre de la ciudad
   * @param {Object} weatherData - Datos del clima a guardar
   * @param {string} date - Fecha de los datos (YYYY-MM-DD)
   * @returns {Promise<string>} ID del documento guardado
   */
  saveHistoricalData: async (city, weatherData, date) => {
    try {
      console.log('💾 Guardando datos históricos en Firebase para:', city);
      
      const historicalData = {
        city: city,
        date: date,
        temperature: weatherData.temp,
        temperature_min: weatherData.temp_min || weatherData.temp,
        temperature_max: weatherData.temp_max || weatherData.temp,
        humidity: weatherData.humidity,
        humidity_min: weatherData.humidity_min || weatherData.humidity,
        humidity_max: weatherData.humidity_max || weatherData.humidity,
        precipitation: weatherData.precipitation || 0,
        description: weatherData.description,
        weatherCode: weatherData.icon,
        feelsLike: weatherData.feels_like,
        windSpeed: weatherData.wind_speed,
        uv: weatherData.uv,
        dataPoints: weatherData.data_points || 1,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'historicalWeather'), historicalData);
      console.log('✅ Datos históricos guardados con ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al guardar datos históricos:', error);
      throw error;
    }
  },

  /**
   * Recupera datos históricos guardados en Firebase
   * @param {string} city - Nombre de la ciudad (opcional)
   * @param {number} limitCount - Número máximo de registros a recuperar (default: 50)
   * @returns {Promise<Array>} Array de datos históricos
   */
  getSavedHistoricalData: async (city = null, limitCount = 50) => {
    try {
      console.log('📖 Recuperando datos históricos guardados...');
      
      // 1. Primero intentar obtener del caché si se especifica una ciudad
      if (city) {
        const cachedData = await HistoricalCache.get(city);
        if (cachedData) {
          console.log('📱 Datos históricos obtenidos del caché offline para:', city);
          return {
            data: cachedData,
            isOffline: true,
            source: 'cache'
          };
        }
      }

      // 2. Si no hay caché, intentar obtener de Firebase
      try {
        let q = query(collection(db, 'historicalWeather'), orderBy('timestamp', 'desc'), limit(100));
        
        const querySnapshot = await getDocs(q);
        let historicalData = [];
        
        querySnapshot.forEach((doc) => {
          const data = {
            id: doc.id,
            ...doc.data()
          };
          historicalData.push(data);
        });

        // Filtrar por ciudad si se especifica
        if (city) {
          historicalData = historicalData.filter(item => 
            item.city && item.city.toLowerCase() === city.toLowerCase()
          );
        }

        // Limitar resultados
        historicalData = historicalData.slice(0, limitCount);

        // 3. Guardar en caché si se especificó una ciudad
        if (city && historicalData.length > 0) {
          await HistoricalCache.save(city, historicalData);
        }

        console.log('✅ Datos históricos recuperados de Firebase:', historicalData.length, 'registros');
        return {
          data: historicalData,
          isOffline: false,
          source: 'firebase'
        };
      } catch (firebaseError) {
        console.log('⚠️ Error de Firebase, intentando con caché:', firebaseError.message);
        
        // 4. Si falla Firebase, intentar con caché (aunque esté expirado)
        if (city) {
          const staleCache = await HistoricalCache.get(city);
          if (staleCache) {
            console.log('📱 Usando caché expirado como respaldo para:', city);
            return {
              data: staleCache,
              isOffline: true,
              source: 'stale_cache',
              warning: 'Datos pueden estar desactualizados'
            };
          }
        }
        
        throw firebaseError;
      }
    } catch (error) {
      console.error('❌ Error al recuperar datos históricos:', error);
      console.error('Detalles del error:', error.message);
      throw error;
    }
  },

  /**
   * Obtiene y guarda datos históricos automáticamente (agrupados por día)
   * @param {string} city - Nombre de la ciudad
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Resultado de la operación
   */
  fetchAndSaveHistoricalData: async (city, startDate, endDate) => {
    try {
      console.log('🔄 Obteniendo y guardando datos históricos diarios para:', city);
      
      // Obtener datos históricos de la API
      const historicalData = await WeatherAPI.getHistoricalWeather(city, startDate, endDate);
      
      // Procesar y agrupar datos por día
      const savedIds = [];
      const hourlyData = historicalData.hourly;
      
      if (hourlyData && hourlyData.time) {
        // Agrupar datos por fecha
        const dailyData = {};
        
        for (let i = 0; i < hourlyData.time.length; i++) {
          const date = hourlyData.time[i].split('T')[0]; // Extraer solo la fecha
          
          if (!dailyData[date]) {
            dailyData[date] = {
              temperatures: [],
              humidities: [],
              precipitations: []
            };
          }
          
          // Agregar datos de esta hora al día correspondiente
          dailyData[date].temperatures.push(hourlyData.temperature_2m[i] || 0);
          dailyData[date].humidities.push(hourlyData.relative_humidity_2m[i] || 0);
          dailyData[date].precipitations.push(hourlyData.precipitation[i] || 0);
        }
        
        // Procesar cada día y guardar resumen diario
        for (const [date, dayData] of Object.entries(dailyData)) {
          // Calcular estadísticas del día
          const temperatures = dayData.temperatures.filter(t => !isNaN(t));
          const humidities = dayData.humidities.filter(h => !isNaN(h));
          const precipitations = dayData.precipitations.filter(p => !isNaN(p));
          
          if (temperatures.length > 0) {
            const dailyStats = {
              temp: Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length), // Temperatura promedio
              temp_min: Math.round(Math.min(...temperatures)), // Temperatura mínima
              temp_max: Math.round(Math.max(...temperatures)), // Temperatura máxima
              humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length), // Humedad promedio
              humidity_min: Math.round(Math.min(...humidities)), // Humedad mínima
              humidity_max: Math.round(Math.max(...humidities)), // Humedad máxima
              precipitation: Math.round(precipitations.reduce((a, b) => a + b, 0) * 100) / 100, // Precipitación total
              description: 'Datos históricos diarios',
              icon: '0',
              feels_like: Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length), // Sensación térmica promedio
              wind_speed: 0,
              uv: 0,
              data_points: temperatures.length // Número de mediciones del día
            };
            
            // Guardar resumen diario en Firebase
            const docId = await WeatherAPI.saveHistoricalData(city, dailyStats, date);
            savedIds.push(docId);
            
            console.log(`📅 Día ${date}: Temp ${dailyStats.temp}°C (${dailyStats.temp_min}-${dailyStats.temp_max}), Humedad ${dailyStats.humidity}%`);
          }
        }
      }
      
      console.log('✅ Datos históricos diarios guardados exitosamente:', savedIds.length, 'días');
      
      return {
        success: true,
        savedCount: savedIds.length,
        savedIds: savedIds,
        city: city,
        dateRange: { startDate, endDate },
        type: 'daily_summary'
      };
    } catch (error) {
      console.error('❌ Error al obtener y guardar datos históricos:', error);
      throw error;
    }
  }
};

export { WeatherAPI };