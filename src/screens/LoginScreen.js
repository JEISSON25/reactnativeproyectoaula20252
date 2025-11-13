import React, { useState } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,useColorScheme,} from "react-native";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then((userCredential) => {
        console.log("Ingreso exitoso ✅", userCredential.user);
        navigation.navigate("Main");
      })
      .catch((error) => {
        console.log("Error de login ❌", error.message);
        let errorMessage = "Error al iniciar sesión";
        if (error.code === "auth/invalid-credential")
          errorMessage = "Correo o contraseña incorrectos";
        if (error.code === "auth/user-not-found")
          errorMessage = "El usuario no existe";
        if (error.code === "auth/wrong-password")
          errorMessage = "Contraseña incorrecta";
        Alert.alert("Error", errorMessage);
      });
  };

  const placeholderColor = isDark ? "#94a3b8" : "#94a3b8"; // gris medio visible en ambos temas
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
      // color se aplica inline en los TextInput para asegurar prioridad
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#cbd5e1",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      fontSize: 16,
    },
    boton: {
      backgroundColor: "#3b82f6",
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
      color: "#3b82f6",
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
      <Text style={styles.title}>Iniciar Sesión</Text>

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

      <TouchableOpacity style={styles.boton} onPress={handleLogin}>
        <Text style={styles.botonTexto}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Registro")}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿No tienes cuenta? </Text>
        <Text style={styles.linkTextBold}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}
