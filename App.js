import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { AppProvider, useAppContext } from "./context/AppContext";

import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/RegistroScreen";
import ListaInventarioScreen from "./screens/ListaInventarioScreen";
import AgregarProductoScreen from "./screens/AgregarProductoScreen";
import EditarProductoScreen from "./screens/EditarProductoScreen";
import MovimientosScreen from "./screens/MovimientosScreen";

import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Rutas() {
  const { user, cargandoUsuario } = useAppContext();

  if (cargandoUsuario) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeTabs} />
          <Stack.Screen name="AgregarProducto" component={AgregarProductoScreen} />
          <Stack.Screen name="EditarProducto" component={EditarProductoScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ListaInventario"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ListaInventario") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Movimientos") {
            iconName = focused ? "swap-horizontal" : "swap-horizontal-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="ListaInventario"
        component={ListaInventarioScreen}
        options={{ title: "Inventario" }}
      />
      <Tab.Screen
        name="Movimientos"
        component={MovimientosScreen}
        options={{ title: "Movimientos" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Rutas />
      </NavigationContainer>
      <Toast />
    </AppProvider>
  );
}
