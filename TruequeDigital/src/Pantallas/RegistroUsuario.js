// src/Pantallas/RegistroUsuario.js
import React, { useState } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegistroUsuario() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [pais, setPais] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      if (
        !nombre.trim() ||
        !apellido.trim() ||
        !pais.trim() ||
        !departamento.trim() ||
        !ciudad.trim() ||
        !email.trim() ||
        !password
      ) {
        return Alert.alert("Campos requeridos", "Debes completar todos los campos.");
      }

      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        pais: pais.trim(),
        departamento: departamento.trim(),
        ciudad: ciudad.trim(),
        fechaCreacion: serverTimestamp(),
      });

      Alert.alert("Registro exitoso", `Bienvenido/a, ${nombre}`);
    } catch (error) {
      Alert.alert("No se pudo registrar", error?.message || "Error desconocido");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.title}>Componente Creación de Usuario</Text>

          <Text>Nombre:</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />

          <Text>Apellido:</Text>
          <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholder="Apellido" />

          <Text>País:</Text>
          <TextInput style={styles.input} value={pais} onChangeText={setPais} placeholder="País" />

          <Text>Departamento:</Text>
          <TextInput style={styles.input} value={departamento} onChangeText={setDepartamento} placeholder="Departamento" />

          <Text>Ciudad:</Text>
          <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} placeholder="Ciudad" />

          <Text>Correo electrónico:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text>Contraseña:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />

          <Button title="Registrarse" onPress={handleRegister} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    // ¡esto es clave! hace que el contenido “quiera” crecer y por tanto se pueda hacer scroll
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
