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
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import sqlite from "../context/sqlite";
import { auth, db as firestoreDb } from "../firebaseConfig";

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInLocal } = useAuth();
  const { isAppOnline } = useOffline();

  // hecho por santiago pa manejar inicio de sesion online y offline
  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("error", "llene todos los campos, parcero");
      return;
    }

    setLoading(true);
    try {
      let emailToLogin = identifier;

      // si el man pone usuario en vez de correo
      if (!identifier.includes("@")) {
        if (isAppOnline) {
          console.log("buscando el usuario en firebase...");
          const q = query(
            collection(firestoreDb, "users"),
            where("username", "==", identifier)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) throw new Error("usuario no encontrado");
          emailToLogin = snapshot.docs[0].data().email;
        } else {
          console.log("modo offline, buscando usuario local...");
          const users = await sqlite.getAllLocalUsers();
          const found = users.find((u) => u.username === identifier);
          if (!found) throw new Error("usuario no encontrado (offline)");
          emailToLogin = found.email;
        }
      }

      if (isAppOnline) {
        console.log("intentando iniciar sesion normal...");
        await signInWithEmailAndPassword(auth, emailToLogin, password);
        console.log("inicio de sesion exitoso con firebase:", emailToLogin);
      } else {
        console.log("verificando datos locales pa login offline...");
        const localUser = await sqlite.verifyLocalPassword(emailToLogin, password);
        if (!localUser) throw new Error("credenciales incorrectas (offline)");
        signInLocal(localUser);
        Alert.alert("modo offline", "inicio de sesion local exitoso");
      }
    } catch (error) {
      console.log("error en el login:", error);
      Alert.alert("error", error.message || "datos incorrectos, revise bien");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>entrenador personal</Text>
        <Text style={styles.subtitle}>inicie sesion para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="correo o usuario"
          placeholderTextColor="#777"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="contrasena"
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>iniciar sesion</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            no tiene cuenta? <Text style={styles.linkHighlight}>registrese aqui</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// att brahian: se revisaron colores pa mantener el gris parejo con los demas screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  inner: {
    width: "100%",
  },
  title: {
    fontSize: 22,
    color: "#ff6600",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
  },
  link: {
    color: "#fff",
    textAlign: "center",
    marginTop: 15,
  },
  linkHighlight: {
    color: "#ff6600",
  },
});

export default LoginScreen;
