import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,useColorScheme,} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../context/AuthContext';
import { OfflineObservations } from '../utils/OfflineObservations';
import { notificarSiCumpleAlerta } from '../utils/notificarAlerta';

export default function RegistrarObservacion({ navigation }) {
  const { user } = useAuth();
  const colorScheme = useColorScheme(); // 'light' o 'dark'
  const isDark = colorScheme === 'dark';

  const [online, setOnline] = useState(true);
  const [ciudad, setCiudad] = useState('');
  const [temp, setTemp] = useState('');
  const [humedad, setHumedad] = useState('');

  // Detectar conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !online && state.isConnected;
      setOnline(state.isConnected);
      if (wasOffline) sincronizar();
    });
    return () => unsubscribe();
  }, [online]);

  const sincronizar = async () => {
    const count = await OfflineObservations.sync();
    if (count > 0) {
      Alert.alert('Sincronizado', `${count} observaciones subidas`);
      await OfflineObservations.clearSynced();
    }
  };

  const handleGuardar = async () => {
    if (!user) return Alert.alert('Error', 'Debes estar logueado');

    const observacion = {
      uid: user.uid,
      ubicacion: ciudad.trim(),
      temperature_2m: parseFloat(temp) || null,
      relative_humidity_2m: parseFloat(humedad) || null,
    };

    try {
      if (online) {
        await OfflineObservations.save(observacion);
        await sincronizar();
        await notificarSiCumpleAlerta(observacion, user.uid); // ← ALERTA

        Alert.alert('Éxito', 'Observación guardada y enviada');
        
      } else {
        await OfflineObservations.save(observacion);
        Alert.alert('Offline', 'Guardado localmente. Se sincronizará al tener internet');
      }

      // Limpiar campos
      setCiudad('');
      setTemp('');
      setHumedad('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la observación');
      console.error(error);
    }
  };

  // Estilos dinámicos
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    status: {
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: '600',
    },
    online: { color: '#10b981' },
    offline: { color: '#f97316' },
    input: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#ddd',
      fontSize: 16,
    },
    boton: {
      backgroundColor: '#10b981',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    botonTexto: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Observación</Text>
      <Text style={[styles.status, online ? styles.online : styles.offline]}>
        {online ? 'Online' : 'Offline'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        value={ciudad}
        onChangeText={setCiudad}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Temperatura (°C)"
        placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        value={temp}
        onChangeText={setTemp}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Humedad (%)"
        placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        value={humedad}
        onChangeText={setHumedad}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.boton} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Guardar Observación</Text>
      </TouchableOpacity>
    </View>
  );
}