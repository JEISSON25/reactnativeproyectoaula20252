// src/Pantallas/CalificarUsuario.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

export default function CalificarUsuario({ route, navigation }) {
  // Recibe los parámetros enviados desde MisSolicitudes
  const { evaluadoId, solicitudId } = route.params || {};
  const [puntuacion, setPuntuacion] = useState("");
  const [comentario, setComentario] = useState("");

  // Función para enviar la calificación
  const enviarCalificacion = async () => {
    try {
      const evaluadorId = auth.currentUser?.uid;
      const puntos = parseFloat(puntuacion);

      if (!evaluadorId || !evaluadoId) {
        return Alert.alert("Error", "Faltan datos del usuario.");
      }

      if (!puntos || puntos < 1 || puntos > 5) {
        return Alert.alert("Error", "La puntuación debe ser un número entre 1 y 5.");
      }

      // Registrar la calificación en Firestore
      await addDoc(collection(db, "calificaciones"), {
        evaluadorId,
        evaluadoId,
        solicitudId,
        puntuacion: puntos,
        comentario,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Gracias", "Tu calificación se ha registrado correctamente.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Calificar usuario
      </Text>

      <Text>Puntuación (1 a 5):</Text>
      <TextInput
        placeholder="Ej: 5"
        keyboardType="numeric"
        value={puntuacion}
        onChangeText={setPuntuacion}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginVertical: 8,
        }}
      />

      <Text>Comentario (opcional):</Text>
      <TextInput
        placeholder="Escribe tu comentario..."
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          textAlignVertical: "top",
          marginVertical: 8,
        }}
      />

      <Button title="Enviar calificación" onPress={enviarCalificacion} />
    </View>
  );
}
