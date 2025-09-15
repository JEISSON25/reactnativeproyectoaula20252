import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function RegisterScreen({ navigation }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log("Usuario registrado:", userCredential.user.email);
            Alert.alert("Registro exitoso", "Ya puedes iniciar sesión");
            navigation.navigate("Login");

        } catch (error) {
            console.error("Error", error.message);
            Alert.alert("Error", error.message);
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
            <Button title="Registrar" onPress={handleRegister} />
        </View>
    );
}
