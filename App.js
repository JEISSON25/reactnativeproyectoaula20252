import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./src/screens/LoginScreen";
import Registro from "./src/screens/Registro";
import Home from "./src/screens/Home";
import ObservacionesMenu from "./src/screens/ObservacionesMenu";
import RegistrarObservacion from "./src/screens/RegistrarObservacion";
import ConsultarObservaciones from "./src/screens/ConsultarObservaciones";
import Settings from "./src/screens/Settings";
import {BackHandler} from "react-native"; // Para cerrar la aplicación
import Icon from "react-native-vector-icons/Ionicons";
import { AuthProvider } from "./src/context/AuthContext";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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


function BottomTabNavigator() {
  React.useEffect(() =>{
    const backAction = () =>{
      // cierra la aplicacion en vez de volver al login
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
      } else if (route.name === 'ObservacionesMenu') {
        iconName = 'create'; // ícono de escribir
      } else if (route.name === 'Settings') {
        iconName = 'settings';
      }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Observaciones" component={ObservacionesStack} options={{ headerShown: false }}/>
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
        initialRouteName="LoginScreen"
        screenOptions={{ 
          headerLeft: null, // deshabilita el boton devolver//
          gestureEnabled: false, // deshabilita el gesto para devolver//
          }}>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen 
          name="Main" 
          component={BottomTabNavigator} 
          options={{
             headerShown: false,
             headerLeft: null, //Sin botón de devolver
             gestureEnabled: false, //Sin gesto de devolver
             }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
