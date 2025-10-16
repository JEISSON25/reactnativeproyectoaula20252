import { NavigationContainer } from '@react-navigation/native'; // Contenedor principal de navegación
import { createStackNavigator } from '@react-navigation/stack'; // Navegación tipo Stack
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Hook personalizado para acceder al contexto de autenticación

// Importación de pantallas (screens)
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoutineDetailScreen from '../screens/RoutineDetailScreen';
import RoutinesScreen from '../screens/RoutinesScreen';

// Se crea un stack (navegador de pila)
const Stack = createStackNavigator();

// Pantalla de carga mientras se verifica el estado de autenticación
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

// Navegador de autenticación (cuando el usuario NO está logueado)
const AuthStack = () => (
  <Stack.Navigator 
    initialRouteName="Login" // Pantalla inicial
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF', // Color de fondo del header
      },
      headerTintColor: '#fff', // Color del texto del header
      headerTitleStyle: {
        fontWeight: 'bold', // Negrita para el título
      },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Iniciar Sesión' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ title: 'Crear Cuenta' }}
    />
  </Stack.Navigator>
);

// Navegador principal (cuando el usuario YA está logueado)
const AppStack = () => (
  <Stack.Navigator 
    initialRouteName="Home"
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Inicio' }}
    />
    <Stack.Screen 
      name="Routines" 
      component={RoutinesScreen} 
      options={{ title: 'Rutinas' }}
    />
    <Stack.Screen 
      name="RoutineDetail" 
      component={RoutineDetailScreen} 
      options={{ title: 'Detalle de Rutina' }}
    />
  </Stack.Navigator>
);

// Componente principal de navegación
const AppNavigator = () => {
  const { user, loading } = useAuth(); // Obtenemos usuario y estado de carga desde el AuthContext

  // Mientras se valida el usuario (Firebase tarda un poco en responder)
  if (loading) {
    return <LoadingScreen />;
  }

  // Si el usuario está logueado  AppStack
  // Si no está logueado  AuthStack
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Estilos de la pantalla de carga
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});

export default AppNavigator;
