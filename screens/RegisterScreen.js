import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !realName || !email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Guardamos datos adicionales en Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        realName,
        email,
      });

      Alert.alert("Éxito", "Cuenta creada correctamente");
    } catch (error) {
      console.error("Error de registro:", error.code, error.message);
      Alert.alert("Error", "No se pudo crear la cuenta");
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
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para continuar</Text>

        {/* Username */}
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        {/* Nombre real */}
        <TextInput
          style={styles.input}
          placeholder="Nombre real"
          placeholderTextColor="#888"
          value={realName}
          onChangeText={setRealName}
        />

        {/* Correo */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Botón */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Link a login */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.linkHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // negro de fondo
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#1E1E1E", // gris oscuro para contraste
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFA500", // naranja
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#ccc",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#2A2A2A", // gris más claro
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#444",
    color: "#fff",
  },
  button: {
    backgroundColor: "#FFA500", // naranja
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cc8400", // naranja apagado
  },
  buttonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    textAlign: "center",
    fontSize: 14,
    color: "#ccc",
  },
  linkHighlight: {
    color: "#FFA500",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
