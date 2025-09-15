import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log("Usuario logueado:", userCredential.user.email);
            Alert.alert("Bienvenido", userCredential.user.email);
            navigation.navigate("Home");

        } catch (error) {
            console.error("Error en login", error.message);
            Alert.alert("Error", "Credenciales inválidas. Intenta de nuevo.");
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Correo"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
            />

            <Button title="Iniciar Sesión" onPress={handleLogin} />
            <View style={{ marginTop: 10 }}>
                <Button
                    title="No tienes cuenta? Registrate"
                    onPress={() => navigation.navigate("Register")}
                />
            </View>
        </View>
    );
}
