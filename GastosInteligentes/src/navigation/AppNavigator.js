import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/App/HomeScreen";
import TransactionsScreen from "../screens/App/TransactionsScreen";
import TransactionFormScreen from "../screens/App/TransactionFormScreen";
import SettingsScreen from "../screens/App/SettingsScreen";
import ReportsScreen from "../screens/App/ReportsScreen";
import GoalsScreen from "../screens/App/GoalsScreen"; // 👈 NUEVA PANTALLA

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppTab = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "Transactions") {
          iconName = focused ? "list" : "list-outline";
        } else if (route.name === "Reports") {
          iconName = focused ? "bar-chart" : "bar-chart-outline";
        } else if (route.name === "Goals") {
          iconName = focused ? "trophy" : "trophy-outline"; // 🏆 Ícono de metas
        } else if (route.name === "Settings") {
          iconName = focused ? "settings" : "settings-outline";
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#2c3e50",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{ title: "Transacciones" }}
    />
    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ title: "Reportes" }}
    />
    <Tab.Screen
      name="Goals"
      component={GoalsScreen}
      options={{ title: "Metas" }} // 👈 Nueva pestaña
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: "Ajustes" }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={AppTab}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TransactionForm"
      component={TransactionFormScreen}
      options={{ title: "Nueva transacción" }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
