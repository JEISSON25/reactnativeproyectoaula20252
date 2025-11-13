import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./src/screens/LoginScreen";
import Registro from "./src/screens/Registro";
import Home from "./src/screens/Home";
import ObservacionesMenu from "./src/screens/ObservacionesMenu";
import RegistrarObservacion from "./src/screens/RegistrarObservacion";
import ConsultarObservaciones from "./src/screens/ConsultarObservaciones";
import AlertasMenu from "./src/screens/AlertasMenu";
import RegistrarAlerta from "./src/screens/RegistrarAlerta";
import Settings from "./src/screens/Settings";
import { BackHandler, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthProvider } from "./src/context/AuthContext";

// NUEVO: Importar notificaciones
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuración de notificaciones (ya lo tenías)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function ObservacionesStack() {
  const InnerStack = createNativeStackNavigator();

  return (
    <InnerStack.Navigator>
      <InnerStack.Screen
        name="ObservacionesMenu"
        component={ObservacionesMenu}
        options={{ title: "Observaciones" }}
      />
      <InnerStack.Screen
        name="RegistrarObservacion"
        component={RegistrarObservacion}
        options={{ title: "Registrar Observación" }}
      />
      <InnerStack.Screen
        name="ConsultarObservaciones"
        component={ConsultarObservaciones}
        options={{ title: "Consultar Observaciones" }}
      />
    </InnerStack.Navigator>
  );
}

function AlertasStack() {
  const InnerStack = createNativeStackNavigator();

  return (
    <InnerStack.Navigator>
      <InnerStack.Screen
        name="AlertasMenu"
        component={AlertasMenu}
        options={{ title: "Alertas" }}
      />
      <InnerStack.Screen
        name="RegistrarAlerta"
        component={RegistrarAlerta}
        options={{ title: "Nueva Alerta" }}
      />
    </InnerStack.Navigator>
  );
}

function BottomTabNavigator() {
  React.useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      if (backHandler && backHandler.remove) {
        backHandler.remove();
      }
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Observaciones') {
            iconName = 'create';
          } else if (route.name === 'Alertas') {
            iconName = 'alert-circle';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Observaciones" component={ObservacionesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Alertas" component={AlertasStack} options={{ headerShown: false, tabBarLabel: 'Alertas' }} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  // NUEVO: Pedir permiso de notificaciones al abrir la app
  useEffect(() => {
    async function pedirPermisoNotificaciones() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Activa las notificaciones para recibir alertas climáticas',
          [{ text: 'OK' }]
        );
      }
    }
    pedirPermisoNotificaciones();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginScreen"
          screenOptions={{
            headerLeft: null,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{
              headerShown: false,
              headerLeft: null,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}