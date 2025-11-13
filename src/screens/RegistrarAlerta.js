// src/screens/RegistrarAlerta.js
import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,StyleSheet,ScrollView,TouchableOpacity,Alert,useColorScheme,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RegistrarAlerta({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [parametro, setParametro] = useState('temperature_2m');
  const [condicion, setCondicion] = useState('mayor');
  const [valor, setValor] = useState('');
  const [numeroFrecuencia, setNumeroFrecuencia] = useState('1');
  const [unidadFrecuencia, setUnidadFrecuencia] = useState('horas');

  // Detectar usuario logueado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });
    return unsubscribe;
  }, []);

  const parametrosClima = [
    { label: 'Temperatura', value: 'temperature_2m' },
    { label: 'Sensación térmica', value: 'apparent_temperature' },
    { label: 'Humedad relativa', value: 'relative_humidity_2m' },
    { label: 'Velocidad del viento', value: 'wind_speed_10m' },
    { label: 'Precipitación', value: 'precipitation' },
    { label: 'Índice UV', value: 'uv_index' },
  ];

  const condiciones = [
    { label: 'Mayor que >', value: 'mayor' },
    { label: 'Menor que <', value: 'menor' },
    { label: 'Igual a =', value: 'igual' },
  ];

  const unidades = [
    { label: 'minutos', value: 'minutos' },
    { label: 'horas', value: 'horas' },
    { label: 'días', value: 'días' },
  ];

  const guardarAlerta = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes estar logueado');
      return;
    }
    if (!titulo.trim() || !ciudad.trim() || !valor || !numeroFrecuencia) {
      Alert.alert('Completa todos los campos');
      return;
    }

    const frecuenciaMinutos = unidadFrecuencia === 'días'
      ? parseInt(numeroFrecuencia) * 1440
      : unidadFrecuencia === 'horas'
      ? parseInt(numeroFrecuencia) * 60
      : parseInt(numeroFrecuencia);

    try {
      await addDoc(collection(db, "alertasClima"), {
        uid: user.uid,
        titulo: titulo.trim(),
        ciudad: ciudad.trim().toLowerCase(),
        parametro,
        condicion,
        valor: parseFloat(valor),
        frecuencia: frecuenciaMinutos,
        unidad: unidadFrecuencia,
        numero: parseInt(numeroFrecuencia),
        activa: true,
        fecha: serverTimestamp(),
      });

      Alert.alert('¡Alerta guardada!', 'Se verificará automáticamente', [
        { text: 'Genial', onPress: () => navigation.navigate('AlertasMenu') },
      ]);

      // Limpiar formulario
      setTitulo('');
      setCiudad('');
      setValor('');
      setNumeroFrecuencia('1');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la alerta');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#475569',
      marginTop: 15,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1.5,
      borderColor: '#cbd5e1',
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      backgroundColor: isDark ? '#1e293b' : 'white',
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    picker: {
      borderWidth: 1.5,
      borderColor: '#cbd5e1',
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : 'white',
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    boton: {
      flexDirection: 'row',
      backgroundColor: '#ef4444',
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    botonTexto: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva Alerta Climática</Text>

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Calor extremo en finca"
        placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Ciudad *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Medellín"
        placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        value={ciudad}
        onChangeText={setCiudad}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Parámetro *</Text>
      <View style={styles.picker}>
        <Picker selectedValue={parametro} onValueChange={setParametro}>
          {parametrosClima.map(p => (
            <Picker.Item key={p.value} label={p.label} value={p.value} />
          ))}
        </Picker>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Condición *</Text>
          <View style={styles.picker}>
            <Picker selectedValue={condicion} onValueChange={setCondicion}>
              {condiciones.map(c => (
                <Picker.Item key={c.value} label={c.label} value={c.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.label}>Valor *</Text>
          <TextInput
            style={[styles.input, { textAlign: 'center' }]}
            placeholder="35"
            placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
            keyboardType="numeric"
            value={valor}
            onChangeText={setValor}
          />
        </View>
      </View>

      <Text style={styles.label}>Frecuencia *</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: isDark ? '#e2e8f0' : '#1e293b' }}>Cada</Text>
        <TextInput
          style={[styles.input, { width: 70, marginHorizontal: 10, textAlign: 'center' }]}
          keyboardType="numeric"
          value={numeroFrecuencia}
          onChangeText={setNumeroFrecuencia}
          placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
        />
        <View style={[styles.picker, { flex: 1 }]}>
          <Picker selectedValue={unidadFrecuencia} onValueChange={setUnidadFrecuencia}>
            {unidades.map(u => (
              <Picker.Item key={u.value} label={u.label} value={u.value} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.boton} onPress={guardarAlerta}>
        <Icon name="cloud-upload-outline" size={26} color="white" />
        <Text style={styles.botonTexto}>Guardar en la Nube</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}