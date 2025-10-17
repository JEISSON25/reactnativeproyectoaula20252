// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { OfflineProvider } from "./context/OfflineContext";
import CreateRoutineScreen from "./screens/CreateRoutineScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import MenuHamburguesa from "./screens/MenuHamburguesa";
import MyRoutinesScreen from "./screens/MyRoutinesScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RoutineDetailScreen from "./screens/RoutineDetailScreen";
import RoutinesScreen from "./screens/RoutinesScreen";
import Splash from "./screens/SplashScreen";

// Nuevas pantallas de información
import MotivacionScreen from "./Screens-info/MotivacionScreen";
import NutricionScreen from "./Screens-info/NutricionScreen";
import SaludBienestarScreen from "./Screens-info/SaludBienestarScreen";

// Para usar navegación dentro del header
import { useNavigation } from "@react-navigation/native";
import { useOffline } from "./context/OfflineContext";
import { MaterialIcons } from "@expo/vector-icons";

const Stack = createStackNavigator();

// Componente para el título del header
const HeaderTitle = () => {
  const navigation = useNavigation(); // hook para navegación

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Home")}
      activeOpacity={0.7}
      style={localStyles.centerContainer}
    >
      <Text style={localStyles.headerAppName}>TRAINFO</Text>
    </TouchableOpacity>
  );
};

// Componente para el botón de modo offline
const OfflineToggle = () => {
  const { isForcedOffline, toggleForcedOffline, isConnected } = useOffline();
  const iconName = isForcedOffline ? "cloud-off" : "cloud-queue";
  const color = isForcedOffline ? "#FF6B00" : "#34C759"; // Naranja para offline, Verde para online forzado
  const tooltip = isForcedOffline ? "Modo Offline Forzado" : "Modo Online";

  return (
    <TouchableOpacity
      onPress={toggleForcedOffline}
      style={{ marginRight: 10 }}
      activeOpacity={0.7}
    >
      <MaterialIcons name={iconName} size={24} color={color} />
    </TouchableOpacity>
  );
};

// Stack para autenticación (login / register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Stack principal de la app
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "#121212",
        shadowColor: "transparent",
        elevation: 0,
      },
      headerTintColor: "#FF6B00",
      headerTitleAlign: "center",
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <OfflineToggle />
          <MenuHamburguesa />
        </View>
      ),
      headerRightContainerStyle: { paddingRight: 8 },
      headerTitle: () => <HeaderTitle />,
    }}
  >
    {/* Pantallas principales */}
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Routines" component={RoutinesScreen} />
    <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
    <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
    <Stack.Screen name="MyRoutines" component={MyRoutinesScreen} />

    {/* Pantallas de información */}
    <Stack.Screen name="Nutricion" component={NutricionScreen} />
    <Stack.Screen name="SaludBienestar" component={SaludBienestarScreen} />
    <Stack.Screen name="Motivacion" component={MotivacionScreen} />
  </Stack.Navigator>
);

// Comprobador de autenticación
const AuthChecker = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <AppStack /> : <AuthStack />;
};

// Componente principal de la app
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <NavigationContainer>
      <AuthChecker />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <AppContent />
      </OfflineProvider>
    </AuthProvider>
  );
}

// Estilos locales
const localStyles = StyleSheet.create({
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerAppName: {
    color: "#FF6B00",
    fontSize: 17,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
