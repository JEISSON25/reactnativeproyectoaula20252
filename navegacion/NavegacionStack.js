import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LogInScreen from '../screens/LogInScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import Register from '../screens/Register';
import DetalleRecetaScreen from '../screens/DetalleRecetaScreen';

const Stack = createStackNavigator();
const NavegacionStack = () => {
 return (
 <Stack.Navigator initialRouteName="Inicio" screenOptions={{
headerShown: true }}>
    <Stack.Screen name="InicioSesion" component={LogInScreen} options={{
title: 'Iniciar sesion ' }} />
 <Stack.Screen name="Inicio" component={HomeScreen} options={{
title: 'Inicio ' }} />
 <Stack.Screen name="Detalle" component={DetailsScreen} options={{
title: 'Detalle ' }} />
 <Stack.Screen name="Registro" component={Register} options={{
title: 'Registro ' }} /> 
 <Stack.Screen name="DetalleRecetaScreen" component={DetalleRecetaScreen} options={{
title: 'DetalleRecetaScreen ' }} /> 
 </Stack.Navigator>
 );
};
export default NavegacionStack;