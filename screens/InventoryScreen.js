import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/MyAuthContext";

export default function InventoryScreen({ navigation }) {
    const { user, logout } = useAuth();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Bienvenido: {user?.email}</Text>
            <Button title="Cerrar Sesión" onPress={logout} />
        </View>
    );
}