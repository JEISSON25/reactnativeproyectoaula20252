import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { db } from "../../firebaseConfig"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Observaciones() {
  const [fechaHora, setFechaHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [humedad, setHumedad] = useState("");
  const [presion, setPresion] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Al cargar la pantalla, fijamos la fecha y hora actual
  useEffect(() => {
    const now = new Date();
    const fechaFormateada = now.toLocaleDateString();
    const horaFormateada = now.toLocaleTimeString();
    setFechaHora(`${fechaFormateada} ${horaFormateada}`);
  }, []);

  const handleGuardar = async () => {
    try {
      await addDoc(collection(db, "observaciones"), {
        ubicacion,
        temperatura,
        humedad,
        presion,
        descripcion,
        fecha: serverTimestamp(), // fecha y hora automática de Firebase
      });

      Alert.alert("Éxito", "Observación registrada correctamente");
      setUbicacion("");
      setTemperatura("");
      setHumedad("");
      setPresion("");
      setDescripcion("");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la observación");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Observaciones</Text>

      {/* Mostrar fecha y hora actual */}
      <Text style={styles.fecha}>Fecha y Hora: {fechaHora}</Text>

      <Text>Ubicación (Ciudad)</Text>
      <TextInput
        style={styles.input}
        value={ubicacion}
        onChangeText={setUbicacion}
        placeholder="Ej: Medellín"
      />

      <Text>Temperatura (°C)</Text>
      <TextInput
        style={styles.input}
        value={temperatura}
        onChangeText={setTemperatura}
        keyboardType="numeric"
      />

      <Text>Humedad (%)</Text>
      <TextInput
        style={styles.input}
        value={humedad}
        onChangeText={setHumedad}
        keyboardType="numeric"
      />

      <Text>Presión Atmosférica (hPa)</Text>
      <TextInput
        style={styles.input}
        value={presion}
        onChangeText={setPresion}
        keyboardType="numeric"
      />

      <Text>Observaciones</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <Button title="Guardar Observación" onPress={handleGuardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fecha: {
    fontSize: 16,
    marginBottom: 15,
    color: "#007AFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});
