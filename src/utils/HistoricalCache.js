// src/utils/HistoricalCache.js
// Caché simple solo para datos históricos
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'historical_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export const HistoricalCache = {
  // Guardar datos históricos en caché
  save: async (city, data) => {
    try {
      const cacheData = {
        city,
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`${CACHE_KEY}_${city.toLowerCase()}`, JSON.stringify(cacheData));
      console.log('💾 Datos históricos guardados en caché para:', city);
    } catch (error) {
      console.error('❌ Error al guardar caché histórico:', error);
    }
  },

  // Obtener datos históricos del caché
  get: async (city) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${city.toLowerCase()}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el caché no ha expirado
      if (now - timestamp > CACHE_DURATION) {
        console.log('⏰ Caché histórico expirado para:', city);
        await AsyncStorage.removeItem(`${CACHE_KEY}_${city.toLowerCase()}`);
        return null;
      }

      console.log('📖 Datos históricos obtenidos del caché para:', city);
      return data;
    } catch (error) {
      console.error('❌ Error al leer caché histórico:', error);
      return null;
    }
  },

  // Limpiar caché histórico
  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const historicalKeys = keys.filter(key => key.startsWith(CACHE_KEY));
      await AsyncStorage.multiRemove(historicalKeys);
      console.log('🗑️ Caché histórico limpiado');
    } catch (error) {
      console.error('❌ Error al limpiar caché histórico:', error);
    }
  }
};