import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";

import AddProductScreens from "./AddProductScreens";
import InventoryScreen from "./InventoryScreen";


function DashboardScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20 }}>Bienvenido a tu Dashboard</Text>
        </View>
    );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Agregar Producto" component={AddProductScreens} />
            <Tab.Screen name="Inventario" component={InventoryScreen} />
        </Tab.Navigator>
    );
}
