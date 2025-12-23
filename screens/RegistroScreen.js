import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import HeaderApp from "../components/HeaderApp";

export default function RegistroScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const registrar = async () => {
    if (!email || !password || !confirmar) {
      return Alert.alert("Error", "Todos los campos son obligatorios.");
    }

    if (password !== confirmar) {
      return Alert.alert("Error", "Las contraseñas no coinciden.");
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await auth.signOut();

      Alert.alert("Éxito", "Cuenta creada correctamente.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      console.log(error);

      let mensaje = "Error al registrar usuario.";

      if (error.code === "auth/email-already-in-use")
        mensaje = "El correo ya está registrado.";
      if (error.code === "auth/invalid-email")
        mensaje = "Correo inválido.";
      if (error.code === "auth/weak-password")
        mensaje = "La contraseña debe tener al menos 6 caracteres.";

      Alert.alert("Error", mensaje);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderApp />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f5d"]}
          style={styles.background}
        >
          <Text style={styles.titulo}>Crear Cuenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirmar}
            onChangeText={setConfirmar}
          />

          <TouchableOpacity style={styles.boton} onPress={registrar}>
            <Text style={styles.botonText}>Registrarme</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 15,
    fontSize: 16,
  },
  boton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  botonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});
