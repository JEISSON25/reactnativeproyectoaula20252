// src/Pantallas/LoginUsuario.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity, ScrollView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginUsuario({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    try {
      if (!email || !password) return Alert.alert("Error", "Completa todos los campos");
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      Alert.alert("No se pudo iniciar sesión", e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ padding: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} >
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Inicia sesión</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />
      <Button title="Entrar" onPress={onLogin} />
      <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
        <Text style={{ textAlign: "center", marginTop: 12 }}>
          ¿No tienes cuenta? <Text style={{ fontWeight: "bold" }}>Crear una</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
