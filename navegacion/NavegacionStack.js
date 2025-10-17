import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LogInScreen from '../screens/LogInScreen';
import HomeDrawer from './HomeDrawer';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import Register from '../screens/Register';
import DetalleRecetaScreen from '../screens/DetalleRecetaScreen';
import FavoritosScreen from '../screens/FavoritesScreen';
import AuthStack from './AuthStack';

const Stack = createStackNavigator();
const NavegacionStack = () => {
 return (
 <Stack.Navigator initialRouteName="Inicio" screenOptions={{
headerShown: true }}>

    <Stack.Screen name="InicioSesion" component={LogInScreen} options={{title: 'Iniciar sesion ' }} />

    <Stack.Screen name="register" component={Register} options={{title: 'registrarse'}} />

    <Stack.Screen name="Inicio" component={HomeDrawer} options={{headerShown: 'false' }} />

    <Stack.Screen name="Detalle" component={DetailsScreen} options={{title: 'Detalle ' }} />

    <Stack.Screen name="DetalleRecetaScreen" component={DetalleRecetaScreen} options={{title: 'DetalleRecetaScreen ' }} />

    <Stack.Screen name="FavoritosScreen" component={FavoritosScreen} options={{title: 'FavoritosScreen ' }} />
 </Stack.Navigator>
 );
};
export default NavegacionStack;