// App.js
import React, { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import NetInfo from "@react-native-community/netinfo";
import { Provider as PaperProvider, Button } from "react-native-paper";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "./firebaseConfig";

import Home from "./src/Pantallas/Home";
import LoginUsuario from "./src/Pantallas/LoginUsuario";
import RegistroUsuario from "./src/Pantallas/RegistroUsuario";
import CrearPublicacion from "./src/Pantallas/crearPublicacion";
import MisSolicitudes from "./src/Pantallas/MisSolicitudes";
import MisChats from "./src/Pantallas/MisChats";
import ChatRoom from "./src/Pantallas/ChatRoom";
import CalificarUsuario from "./src/Pantallas/CalificarUsuario";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [networkOnline, setNetworkOnline] = useState(false);
  const [forceOffline, setForceOffline] = useState(false);

  // Detectar sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  // Estado de red
  const effectiveOnline = useMemo(
    () => !forceOffline && networkOnline,
    [forceOffline, networkOnline]
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        !!state.isConnected && (state.isInternetReachable !== false);
      setNetworkOnline(connected);
    });
    return unsubscribe;
  }, []);

  // Controlar red local/offline
  useEffect(() => {
    if (forceOffline) {
      disableNetwork(db).catch(() => {});
    } else {
      enableNetwork(db).catch(() => {});
    }
  }, [forceOffline]);

  const toggleOffline = () => {
    setForceOffline((prev) => !prev);
  };

  // Cargando sesión
  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {!effectiveOnline && (
          <View style={{ backgroundColor: "red", padding: 10 }}>
            <Text style={{ color: "white", textAlign: "center" }}>
              Modo Offline
            </Text>
          </View>
        )}

        <Button mode="contained" onPress={toggleOffline} style={{ margin: 12 }}>
          {forceOffline
            ? "Activar Online (quitar modo offline)"
            : "Activar Offline"}
        </Button>

        <NavigationContainer>
          {user ? (
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ title: "Publicaciones" }}
              />
              <Stack.Screen
                name="CrearPublicacion"
                component={CrearPublicacion}
                options={{ title: "Nueva publicación" }}
              />
              <Stack.Screen
                name="MisSolicitudes"
                component={MisSolicitudes}
                options={{ title: "Mis solicitudes" }}
              />
              <Stack.Screen
                name="MisChats"
                component={MisChats}
                options={{ title: "Mis chats" }}
              />
              <Stack.Screen
                name="ChatRoom"
                component={ChatRoom}
                options={{ title: "Chat" }}
              />
              <Stack.Screen
                name="CalificarUsuario"
                component={CalificarUsuario}
                options={{ title: "Calificar Usuario" }}
              />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator>
              <Stack.Screen
                name="Login"
                component={LoginUsuario}
                options={{ title: "Iniciar sesión" }}
              />
              <Stack.Screen
                name="Registro"
                component={RegistroUsuario}
                options={{ title: "Crear cuenta" }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
}
