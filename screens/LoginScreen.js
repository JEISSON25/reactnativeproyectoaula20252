import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
// import { useAuth } from "../contexts/MyAuthContext";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const { user } = useAuth();

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert("Error", "Por favor ingresa correo y contraseña");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Usuario logueado:", userCredential.user.email);
                Alert.alert("Bienvenido", `Hola ${userCredential.user.email}`);
                navigation.replace("Inventory");
            })
            .catch((error) => {
                console.log("Error:", error.message);
                Alert.alert("Error", error.message);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <View style={styles.button}>
                <Button title="Entrar" onPress={handleLogin} />
            </View>

            <View style={styles.button}>
                <Button
                    title="Registrarse"
                    onPress={() => navigation.navigate("Register")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        marginVertical: 10,
    },
});