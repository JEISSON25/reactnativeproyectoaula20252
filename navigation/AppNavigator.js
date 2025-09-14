import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import InventoryScreen from "../screens/InventoryScreen";
import AddProductScreen from "../screens/AddProductScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: "Iniciar Sesión" }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: "Registro" }}
            />
            <Stack.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{ title: "Inventario" }}
            />
            <Stack.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={{ title: "Agregar Producto" }}
            />
        </Stack.Navigator>
    );
}