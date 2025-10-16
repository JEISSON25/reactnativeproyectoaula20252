import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ObservacionesMenu() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Observaciones</Text>
      <Text style={styles.subtitle}>
        Selecciona una opción para continuar:
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="➕ Registrar Observación"
          onPress={() => navigation.navigate("RegistrarObservacion")}
          color="#007AFF"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🔍 Consultar Observaciones"
          onPress={() => navigation.navigate("ConsultarObservaciones")}
          color="#34C759"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#555",
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 10,
  },
});
