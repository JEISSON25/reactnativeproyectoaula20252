// src/screens/Home.js
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { WeatherAPI } from "../../services/weatherApi";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get('window').width;

export default function Home() {
  const navigation = useNavigation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("Madrid");
  const [selectedCity, setSelectedCity] = useState("Madrid");
  const [historicalData, setHistoricalData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [savingData, setSavingData] = useState(false);
  const [loadingSavedData, setLoadingSavedData] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);	

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌍 Iniciando búsqueda del clima para:', city);
      const weatherData = await WeatherAPI.getWeatherByCity(city);
      setWeather(weatherData);
      setSelectedCity(city);
      console.log('✅ Clima obtenido exitosamente:', weatherData);
      
      // Obtener datos históricos para el gráfico
      await fetchHistoricalData(city);
    } catch (error) {
      console.error('❌ Error al obtener el clima:', error);
      setError(error.message);
      Alert.alert('Error', `No se pudo obtener el clima para ${city}. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (city) => {
    try {
      setChartLoading(true);
      
      // Obtener datos de los últimos 7 días
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await WeatherAPI.getHistoricalWeather(city, startDate, endDate);
      setHistoricalData(data);
    } catch (error) {
      console.error('❌ Error al obtener datos históricos:', error);
      // No mostrar error al usuario, solo log
    } finally {
      setChartLoading(false);
    }
  };

  const handleSearchCity = () => {
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
    } else {
      Alert.alert('Error', 'Por favor ingresa el nombre de una ciudad');
    }
  };

  const handleCityPress = (city) => {
    setCityInput(city);
    fetchWeather(city);
  };

  // Función para guardar datos históricos en Firebase
  const saveHistoricalData = async () => {
    try {
      setSavingData(true);
      console.log('💾 Guardando datos históricos para:', selectedCity);
      
      // Obtener datos de los últimos 7 días
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const resultado = await WeatherAPI.fetchAndSaveHistoricalData(selectedCity, startDate, endDate);
      
      Alert.alert(
        '✅ Datos Guardados', 
        `Se guardaron ${resultado.savedCount} registros históricos para ${selectedCity}`
      );
      
      console.log('✅ Datos guardados exitosamente:', resultado);
    } catch (error) {
      console.error('❌ Error al guardar datos históricos:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos históricos');
    } finally {
      setSavingData(false);
    }
  };

  // Función para guardar datos actuales
  const saveCurrentData = async () => {
    try {
      setSavingData(true);
      console.log('💾 Guardando datos actuales para:', selectedCity);
      
      const fechaActual = new Date().toISOString().split('T')[0];
      const docId = await WeatherAPI.saveHistoricalData(selectedCity, weather, fechaActual);
      
      Alert.alert('✅ Datos Guardados', `Datos actuales guardados exitosamente`);
      console.log('✅ Datos actuales guardados con ID:', docId);
    } catch (error) {
      console.error('❌ Error al guardar datos actuales:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos actuales');
    } finally {
      setSavingData(false);
    }
  };

  // Función para recuperar datos guardados
  const loadSavedData = async () => {
    try {
      setLoadingSavedData(true);
      console.log('📖 Cargando datos guardados para ciudad:', selectedCity);
      
      // Obtener datos históricos con caché offline
      const result = await WeatherAPI.getSavedHistoricalData(selectedCity, 20);
      console.log('📊 Datos obtenidos:', result);
      
      // Extraer los datos del resultado
      const datos = result.data || result; // Compatibilidad con formato anterior
      
      setSavedData(datos);
      
      // Mostrar información sobre la fuente de los datos
      if (result.isOffline) {
        console.log('📱 Datos obtenidos en modo offline desde:', result.source);
        setIsOfflineMode(true);
        if (result.warning) {
          console.log('⚠️ Advertencia:', result.warning);
        }
      } else {
        console.log('🌐 Datos obtenidos desde Firebase');
        setIsOfflineMode(false);
      }
      
      if (datos.length === 0) {
        Alert.alert('Info', `No hay datos guardados para "${selectedCity}". Intenta guardar algunos datos primero.`);
      } else {
        console.log('✅ Datos cargados exitosamente:', datos.length, 'registros');
      }
    } catch (error) {
      console.error('❌ Error al cargar datos guardados:', error);
      console.error('Detalles del error:', error.message);
      Alert.alert('Error', `No se pudieron cargar los datos guardados: ${error.message}`);
    } finally {
      setLoadingSavedData(false);
    }
  };

  useEffect(() => {
    fetchWeather("Madrid");
  }, []);

  // Función para preparar los datos del gráfico
  const prepareChartData = () => {
    if (!historicalData || !historicalData.hourly) return null;

    const hourlyData = historicalData.hourly;
    
    // Reducir a solo 7 puntos (uno por día) para evitar superposición
    const step = Math.floor(hourlyData.time.length / 7);
    
    const labels = [];
    const temperatures = [];
    const humidities = [];

    for (let i = 0; i < hourlyData.time.length; i += step) {
      const date = new Date(hourlyData.time[i]);
      
      // Formato más simple: solo día y mes
      const timeLabel = date.toLocaleDateString('es-ES', { 
        day: 'numeric',
        month: 'short'
      });
      
      labels.push(timeLabel);
      temperatures.push(Math.round(hourlyData.temperature_2m[i]));
      humidities.push(Math.round(hourlyData.relative_humidity_2m[i]));
    }

    return {
      temperatureChart: {
        labels: labels.slice(0, 7), // Solo 7 puntos (uno por día)
        datasets: [{
          data: temperatures.slice(0, 7),
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 3
        }]
      },
      humidityChart: {
        labels: labels.slice(0, 7), // Solo 7 puntos (uno por día)
        datasets: [{
          data: humidities.slice(0, 7),
          color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          strokeWidth: 3
        }]
      }
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Obteniendo información del clima...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Intenta nuevamente en unos momentos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchWeather(selectedCity)}>
          <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo obtener la información del clima</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Indicador de modo offline */}
      {isOfflineMode && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Modo Offline - Datos del caché local
          </Text>
        </View>
      )}
      {/* Selector de Ciudad */}
      <View style={styles.citySelector}>
        <Text style={styles.sectionTitle}>🏙️ Selecciona una Ciudad</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.cityInput}
            placeholder="Escribe el nombre de la ciudad..."
            value={cityInput}
            onChangeText={setCityInput}
            onSubmitEditing={handleSearchCity}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchCity}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de Firebase */}
      <View style={styles.firebaseContainer}>
        <Text style={styles.sectionTitle}>💾 Gestión de Datos Históricos</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.firebaseButton, styles.saveButton]} 
            onPress={saveCurrentData}
            disabled={savingData || !weather}
          >
            <Text style={styles.buttonText}>
              {savingData ? '⏳' : '💾'} Guardar Actual
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.firebaseButton, styles.historicalButton]} 
            onPress={saveHistoricalData}
            disabled={savingData}
          >
            <Text style={styles.buttonText}>
              {savingData ? '⏳' : '📊'} Guardar Histórico
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.firebaseButton, styles.loadButton]} 
          onPress={loadSavedData}
          disabled={loadingSavedData}
        >
          <Text style={styles.buttonText}>
            {loadingSavedData ? '⏳' : '📖'} Cargar Guardados
          </Text>
        </TouchableOpacity>
        
        {savedData.length > 0 && (
          <View style={styles.savedDataContainer}>
            <Text style={styles.savedDataTitle}>📋 Datos Guardados ({savedData.length})</Text>
            <ScrollView style={styles.savedDataList} horizontal showsHorizontalScrollIndicator={false}>
              {savedData.slice(0, 5).map((item, index) => (
                <View key={item.id || index} style={styles.savedDataItem}>
                  <Text style={styles.savedDataDate}>{item.date}</Text>
                  <Text style={styles.savedDataTemp}>{item.temperature}°C</Text>
                  {item.temperature_min && item.temperature_max && (
                    <Text style={styles.savedDataRange}>
                      {item.temperature_min}°-{item.temperature_max}°
                    </Text>
                  )}
                  <Text style={styles.savedDataHumidity}>{item.humidity}%</Text>
                  {item.precipitation > 0 && (
                    <Text style={styles.savedDataPrecip}>💧 {item.precipitation}mm</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

        {/* Información del Clima */}
        <View style={styles.weatherCard}>
          <Text style={styles.cityTitle}>🌍 {selectedCity}</Text>
          
          <View style={styles.mainInfo}>
            <Text style={styles.temperature}>{weather.temp}°C</Text>
            <Text style={styles.description}>{weather.description}</Text>
          </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💧 Humedad:</Text>
            <Text style={styles.detailValue}>{weather.humidity}%</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌡️ Sensación térmica:</Text>
            <Text style={styles.detailValue}>{weather.feels_like}°C</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💨 Velocidad del viento:</Text>
            <Text style={styles.detailValue}>{weather.wind_speed} km/h</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>☀️ Índice UV:</Text>
            <Text style={styles.detailValue}>{weather.uv}</Text>
          </View>
        </View>
      </View>

      {/* Gráfico de variación semanal */}
      {weather && historicalData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📊 Variación de la Semana</Text>
          
          {chartLoading ? (
            <View style={styles.chartLoadingContainer}>
              <ActivityIndicator size="small" color="#0066CC" />
              <Text style={styles.chartLoadingText}>Cargando gráfico...</Text>
            </View>
          ) : (
            <>
              {/* Gráfico de temperatura */}
              <View style={styles.chartSection}>
                <Text style={styles.chartSubtitle}>🌡️ Temperatura (°C)</Text>
                <LineChart
                  data={prepareChartData()?.temperatureChart || { labels: [], datasets: [] }}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#ff6384'
                    },
                    propsForLabels: {
                      fontSize: 10
                    }
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                />
              </View>

              {/* Gráfico de humedad */}
              <View style={styles.chartSection}>
                <Text style={styles.chartSubtitle}>💧 Humedad Relativa (%)</Text>
                <LineChart
                  data={prepareChartData()?.humidityChart || { labels: [], datasets: [] }}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#36a2eb'
                    },
                    propsForLabels: {
                      fontSize: 10
                    }
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                />
              </View>
            </>
          )}
          {/* Botones de prueba para modo offline - Solo en desarrollo */}
      {__DEV__ && (
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>🧪 Pruebas de Modo Offline</Text>
          <View style={styles.testButtons}>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={async () => {
                const { OfflineTest } = await import('../utils/OfflineTest');
                const restoreNetwork = OfflineTest.simulateNetworkError();
                Alert.alert('🔧 Modo Offline Simulado', 'Ahora prueba cargar datos históricos');
                // Guardar función para restaurar
                window.restoreNetwork = restoreNetwork;
              }}
            >
              <Text style={styles.testButtonText}>🚫 Simular Offline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={async () => {
                if (window.restoreNetwork) {
                  window.restoreNetwork();
                  Alert.alert('🌐 Modo Online Restaurado', 'Conexión normal restaurada');
                } else {
                  Alert.alert('ℹ️ Info', 'No hay simulación activa');
                }
              }}
            >
              <Text style={styles.testButtonText}>🌐 Restaurar Online</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={async () => {
                const { OfflineTest } = await import('../utils/OfflineTest');
                await OfflineTest.clearAllCache();
                Alert.alert('🗑️ Caché Limpiado', 'Ahora prueba el flujo completo');
              }}
            >
              <Text style={styles.testButtonText}>🗑️ Limpiar Caché</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineIndicator: {
    backgroundColor: '#FFA500',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  offlineText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  testSection: {
    backgroundColor: '#f0f0f0',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  testButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  mainInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  citySelector: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  cityInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 10,
  },
  searchButtonText: {
    fontSize: 24,
    color: '#0066CC',
  },
  popularTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  popularCities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cityButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  selectedCityButton: {
    backgroundColor: '#0066CC',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  cityButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCityButtonText: {
    color: 'white',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Estilos para los gráficos
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  
  chartSection: {
    marginBottom: 20,
  },
  
  chartSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  
  chart: {
    borderRadius: 16,
  },
  
  chartLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  chartLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  
  // Estilos para Firebase
  firebaseContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  firebaseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  
  saveButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  
  historicalButton: {
    backgroundColor: '#FF9800',
    marginLeft: 8,
  },
  
  loadButton: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  savedDataContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  
  savedDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  savedDataList: {
    flexDirection: 'row',
  },
  
  savedDataItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  savedDataDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  
  savedDataTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 2,
  },
  
  savedDataHumidity: {
    fontSize: 12,
    color: '#666',
  },
  
  savedDataRange: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  
  savedDataPrecip: {
    fontSize: 10,
    color: '#2196F3',
    marginTop: 2,
  },
});