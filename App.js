import { MaterialIcons } from "@expo/vector-icons";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { OfflineProvider, useOffline } from "./context/OfflineContext";

import CreateRoutineScreen from "./screens/CreateRoutineScreen";
import GraficsScreen from "./screens/GraficsScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import MenuHamburguesa from "./screens/MenuHamburguesa";
import MyRoutinesScreen from "./screens/MyRoutinesScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RoutineDetailScreen from "./screens/RoutineDetailScreen";
import RoutinesScreen from "./screens/RoutinesScreen";
import Splash from "./screens/SplashScreen";


// att camilo: esto es el stack principal donde se maneja todo el flujo de pantallas
const Stack = createStackNavigator();


// titulo del header que devuelve al home
const HeaderTitle = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.headerCenter}>
      <Text style={styles.headerText}>TRAINFO</Text>
    </TouchableOpacity>
  );
};


// boton para activar modo offline o volver online
// esto lo dejo andre pq siempre se le iba el wifi jaja
const OfflineToggle = () => {
  const { isForcedOffline, toggleForcedOffline } = useOffline();
  const iconName = isForcedOffline ? "cloud-off" : "cloud-queue";
  const color = isForcedOffline ? "#FF6B00" : "#34C759";

  return (
    <TouchableOpacity onPress={toggleForcedOffline} style={{ marginRight: 10 }}>
      <MaterialIcons name={iconName} size={22} color={color} />
    </TouchableOpacity>
  );
};


// stack para login y registro
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);


// stack de la app cuando el usuario ya esta logueado
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#121212" },
      headerTintColor: "#FF6B00",
      headerTitleAlign: "center",

      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <OfflineToggle />
          <MenuHamburguesa />
        </View>
      ),

      headerTitle: () => <HeaderTitle />,
    }}
  >

    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Routines" component={RoutinesScreen} />
    <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
    <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
    <Stack.Screen name="MyRoutines" component={MyRoutinesScreen} />
    <Stack.Screen name="Grafics" component={GraficsScreen} />

  </Stack.Navigator>
);


// verifica si hay usuario o muestra login
const AuthChecker = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <AppStack /> : <AuthStack />;
};


// componente principal que controla splash y navegacion
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // att brahian: esto hace que el splash se quite despues de 3 seg
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <NavigationContainer>
      <AuthChecker />
    </NavigationContainer>
  );
};


// att santiago: si se cae la app aca, revisar el OfflineProvider qeu a veces no carga
export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <AppContent />
      </OfflineProvider>
    </AuthProvider>
  );
}


// estilos basicos del header
const styles = StyleSheet.create({

  headerCenter: { justifyContent: "center", alignItems: "center" },

  headerText: {
    color: "#FF6B00",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

});
