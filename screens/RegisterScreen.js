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
import { useOffline } from "../context/OfflineContext";
import sqlite from "../context/sqlite";
import { auth, db as firestoreDb } from "../firebaseConfig";

const RegisterScreen = ({ navigation }) => {
  const { isAppOnline } = useOffline();
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // esto lo hizo camilo pa registrar usuarios y guardarlos local si no hay red
  const handleRegister = async () => {
    if (!username || !realName || !email || !password) {
      Alert.alert("Error", "completa todos los campos ome");
      return;
    }

    setLoading(true);
    try {
      await sqlite.initDB();

      if (isAppOnline) {
        console.log("intentando registrar el man en firebase...");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(firestoreDb, "users", user.uid), {
          uid: user.uid,
          username,
          realName,
          email,
        });

        await sqlite.saveLocalUser({
          uid: user.uid,
          email,
          username,
          plainPassword: password,
          isSynced: 1,
        });

        console.log("usuario guardao en firebase:", email);
      } else {
        console.log("guardando usuario local porque no hay red...");

        const existing = await sqlite.getLocalUserByEmail(email);
        if (existing) {
          Alert.alert("aviso", "ese correo ya esta guardado aqui");
          setLoading(false);
          return;
        }

        await sqlite.saveLocalUser({
          uid: null,
          email,
          username,
          plainPassword: password,
          isSynced: 0,
        });

        console.log("usuario guardao local, se sincroniza despues");
        Alert.alert("modo offline", "cuenta guardada localmente, se sincroniza cuando haya internet");
      }

      navigation.navigate("Login");
    } catch (error) {
      console.log("error raro registrando el usuario:", error);
      Alert.alert("error", "no se pudo crear la cuenta, intente otra vez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.box}>
        <Text style={styles.title}>crear cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="nombre de usuario"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="nombre real"
          placeholderTextColor="#888"
          value={realName}
          onChangeText={setRealName}
        />
        <TextInput
          style={styles.input}
          placeholder="correo electronico"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="contrasena"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            no tiene cuenta? <Text style={styles.linkHighlight}>inicie sesion</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// att andrey: revise que los estilos queden parejos con los demas screens
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", justifyContent: "center", alignItems: "center", padding: 10 },
  box: { width: "100%" },
  title: { color: "#FF6B00", fontSize: 20, textAlign: "center", marginBottom: 15 },
  input: { backgroundColor: "#1a1a1a", color: "#fff", padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#FF6B00", padding: 10, alignItems: "center", marginTop: 5 },
  buttonText: { color: "#fff" },
  link: { color: "#ccc", textAlign: "center", marginTop: 15 },
  linkHighlight: { color: "#FF6B00" },
});

export default RegisterScreen;
