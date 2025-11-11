import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LogInScreen from '../screens/LogInScreen';
import HomeDrawer from './HomeDrawer';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import Register from '../screens/Register';
import DetalleRecetaScreen from '../screens/DetalleRecetaScreen';
import FavoritosScreen from '../screens/FavoritesScreen';
import CrearRecetaScreen from '../screens/CrearRecetaScreen';
import MisRecetasScreen from '../screens/MisRecetasScreen';
import PlanSemanalScreen from '../screens/PlanSemanalScreen';
import PlanesCreadosScreen from '../screens/PlanesCreadosScreen';
import AuthStack from './AuthStack';

const Stack = createStackNavigator();
const NavegacionStack = () => {
 return (
 <Stack.Navigator initialRouteName="Inicio" screenOptions={{headerShown: true }}>

    <Stack.Screen name="InicioSesion" component={LogInScreen} options={{title: 'Iniciar sesion ' }} />
    <Stack.Screen name="register" component={Register} options={{title: 'registrarse'}} />
    <Stack.Screen name="Inicio" component={HomeDrawer} options={{headerShown: false }} />
    <Stack.Screen name="Detalle" component={DetailsScreen} options={{title: 'Detalle ' }} />
    <Stack.Screen name="DetalleRecetaScreen" component={DetalleRecetaScreen} options={{title: 'DetalleRecetaScreen ' }} />
    <Stack.Screen name="FavoritosScreen" component={FavoritosScreen} options={{title: 'FavoritosScreen ' }} />
    <Stack.Screen name="CrearRecetaScreen" component={CrearRecetaScreen} options={{title: 'CrearRecetaScreen ' }} />
    <Stack.Screen name="MisRecetasScreen" component={MisRecetasScreen} options={{title: 'MisRecetasScreen ' }} />
    <Stack.Screen name="PlanSemanalScreen" component={PlanSemanalScreen} options={{title: 'PlanSemanalScreen ' }} />
    <Stack.Screen name="PlanesCreadosScreen" component={PlanesCreadosScreen} options={{title: 'PlanesCreadosScreen ' }} />

 </Stack.Navigator>
 );
};
export default NavegacionStack;