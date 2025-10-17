import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

// Pantalla de Login
const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(""); // correo o username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      let emailToLogin = identifier;

      // Si no contiene "@", asumimos que es un username
      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Usuario no encontrado");
        }

        // Tomamos el correo del usuario encontrado
        emailToLogin = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);
    } catch (error) {
      console.error("Error de inicio de sesión:", error.code, error.message);
      Alert.alert("Error", "Credenciales incorrectas. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Entrenador Personal</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {/* Input correo o usuario */}
        <TextInput
          style={styles.input}
          placeholder="Correo o Nombre de Usuario"
          placeholderTextColor="#888"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        {/* Input contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Botón login */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        {/* Link a registro */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta?{" "}
            <Text style={styles.linkHighlight}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // negro de fondo
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#1a1a1a", // gris oscuro para contraste
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff6600", // naranja principal
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#ccc", // gris claro
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#444",
    color: "#fff", // texto input
  },
  button: {
    backgroundColor: "#ff6600", // naranja
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#b34700", // naranja opaco cuando está deshabilitado
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    textAlign: "center",
    fontSize: 14,
    color: "#fff",
  },
  linkHighlight: {
    color: "#ff6600",
    fontWeight: "bold",
  },
});

export default LoginScreen;
