// src/screens/Home.js
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { WeatherAPI } from "../../services/weatherApi";

export default function Home() {
  const navigation = useNavigation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("Madrid");
  const [selectedCity, setSelectedCity] = useState("Madrid");

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌍 Iniciando búsqueda del clima para:', city);
      const weatherData = await WeatherAPI.getWeatherByCity(city);
      setWeather(weatherData);
      setSelectedCity(city);
      console.log('✅ Clima obtenido exitosamente:', weatherData);
    } catch (error) {
      console.error('❌ Error al obtener el clima:', error);
      setError(error.message);
      Alert.alert('Error', `No se pudo obtener el clima para ${city}. ${error.message}`);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchWeather("Madrid");
  }, []);

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});