// src/screens/Registro.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Registro({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegistro = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(() => {
        Alert.alert(
          "Registro exitoso",
          "Tu cuenta ha sido creada correctamente",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
        );
      })
      .catch((error) => {
        let errorMessage = "Ocurrió un error al registrar";
        if (error.code === "auth/email-already-in-use")
          errorMessage = "El correo ya está registrado";
        Alert.alert("Error", errorMessage);
      });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 32,
      color: isDark ? "#f8fafc" : "#0f172a",
    },
    input: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#cbd5e1",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      fontSize: 16,
    },
    boton: {
      backgroundColor: "#10b981",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    botonTexto: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    linkContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
    },
    linkText: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 16,
    },
    linkTextBold: {
      color: "#10b981",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  // Colores explícitos para los TextInput (evita inconsistencias en algunos dispositivos/OS)
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const inputBackground = isDark ? "#1e293b" : "#ffffff";
  const effectivePlaceholder = isDark ? "#94a3b8" : "#64748b";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor={effectivePlaceholder}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: textColor, backgroundColor: inputBackground }]}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor={textColor}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={effectivePlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { color: textColor, backgroundColor: inputBackground }]}
        selectionColor={textColor}
      />

      <TextInput
        placeholder="Confirmar contraseña"
        placeholderTextColor={effectivePlaceholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={[styles.input, { color: textColor, backgroundColor: inputBackground }]}
        selectionColor={textColor}
      />

      <TouchableOpacity style={styles.boton} onPress={handleRegistro}>
        <Text style={styles.botonTexto}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
        <Text style={styles.linkTextBold}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
