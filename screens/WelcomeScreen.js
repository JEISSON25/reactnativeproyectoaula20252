import React from "react";
import { View, Text, Button } from "react-native";

export default function WelcomeScreen({ navigation }) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
            }}
        >
            <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
                Bienvenido a la App de Gestión de Inventario
            </Text>

            <Button
                title="Entrar"
                onPress={() => navigation.navigate("Login")}
            />
        </View>
    );
}
