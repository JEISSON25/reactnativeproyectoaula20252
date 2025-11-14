import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AddProductScreens from "../screens/AddProductScreens";
import InventoryScreen from "../screens/InventoryScreen";
import MovementScreen from "../screens/MovementScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ReportsScreen from "../screens/ReportsScreen";

import { useAuth } from "../contexts/MyAuthContext";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Cargando...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="AddProduct" component={AddProductScreens} />
                    <Stack.Screen name="Inventory" component={InventoryScreen} />
                    <Stack.Screen name="Alerts" component={AlertsScreen} />
                    <Stack.Screen name="Movement" component={MovementScreen} />
                    <Stack.Screen name="Reports" component={ReportsScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
