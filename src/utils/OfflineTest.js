// src/utils/OfflineTest.js
// Utilidades para probar el modo offline

export const OfflineTest = {
  // Simular error de red para probar caché
  simulateNetworkError: () => {
    // Interceptar fetch para simular error de red
    const originalFetch = global.fetch;
    
    global.fetch = (...args) => {
      console.log('🚫 Simulando error de red para:', args[0]);
      return Promise.reject(new Error('Network request failed - Simulated offline mode'));
    };
    
    console.log('🔧 Modo offline simulado activado');
    
    // Función para restaurar fetch normal
    return () => {
      global.fetch = originalFetch;
      console.log('🌐 Modo online restaurado');
    };
  },

  // Limpiar caché para probar desde cero
  clearAllCache: async () => {
    try {
      const { HistoricalCache } = await import('./HistoricalCache');
      await HistoricalCache.clear();
      console.log('🗑️ Caché limpiado para prueba');
    } catch (error) {
      console.error('❌ Error al limpiar caché:', error);
    }
  },

  // Verificar estado del caché
  checkCacheStatus: async (city) => {
    try {
      const { HistoricalCache } = await import('./HistoricalCache');
      const cachedData = await HistoricalCache.get(city);
      
      if (cachedData) {
        console.log('📱 Caché encontrado para', city, ':', cachedData.length, 'registros');
        return true;
      } else {
        console.log('❌ No hay caché para', city);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al verificar caché:', error);
      return false;
    }
  },

  // Instrucciones de prueba
  getTestInstructions: () => {
    return `
🧪 INSTRUCCIONES PARA PROBAR MODO OFFLINE:

1. PREPARACIÓN:
   - Ejecuta la app con internet
   - Guarda algunos datos históricos para una ciudad
   - Carga los datos guardados (esto los guarda en caché)

2. ACTIVAR MODO OFFLINE:
   - Desactiva WiFi y datos móviles
   - O usa: OfflineTest.simulateNetworkError()

3. PROBAR:
   - Carga los datos históricos de la misma ciudad
   - Deberías ver el indicador naranja "Modo Offline"
   - Los datos deberían cargar desde el caché

4. RESTAURAR:
   - Reactiva internet
   - O usa: restoreNetwork() (si usaste simulación)

💡 TIP: Usa la consola para ver los logs de caché
    `;
  }
};
