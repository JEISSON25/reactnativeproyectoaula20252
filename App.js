import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './AuthContext'; // Ajusta la ruta
// Importar tus pantallas
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import TreeScreen from './screens/TreeScreen';
import AddPetScreen from './screens/AddPetScreen';
import EditPetScreen from './screens/EditPetScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {currentUser ? (
          // Usuario autenticado - mostrar pantallas principales
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Inicio',
                headerLeft: null,
                gestureEnabled: false
              }}
            />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={{ title: 'Detalles' }}
            />
            <Stack.Screen
              name="Tree"
              component={TreeScreen}
              options={{ title: 'Árbol' }}
            />
            <Stack.Screen
              name="AddPet"
              component={AddPetScreen}
              options={{ title: 'Agregar Mascota' }}
            />
            <Stack.Screen
              name="EditPet"
              component={EditPetScreen}
              options={{ title: 'Editar Mascota' }}
            />

          </>
        ) : (
          // Usuario no autenticado - mostrar pantallas de auth
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Iniciar Sesión' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Registrarse' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}