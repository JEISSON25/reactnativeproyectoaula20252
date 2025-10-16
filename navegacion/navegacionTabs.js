import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LogInScreen from '../screens/LogInScreen';
import ConfigScreen from '../screens/ConfigScreen';
import DetailsScreen from '../screens/DetailsScreen';
import HomeScreen from '../screens/HomeScreen';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const NavegacionTabs = () => {
 return (
 <Tab.Navigator initialRouteName="Inicio" screenOptions={({ route })=> ({
 tabBarIcon: ({ color, size }) => {
 let icono;
 if (route.name === 'Inicio') {
 icono = 'home';
 } else if (route.name === 'Configuracion') {
 icono = 'settings';
 }
 return <Ionicons name={icono} size={size} color={color} />;
 },
 })}>

 <Tab.Screen name="Inicio" component={LogInScreen} options={{
title: 'Inicio ' }} />

 <Tab.Screen name="Configuracion" component={ConfigScreen}
options={{ title: 'Configuración ' }} />

<Tab.Screen name="Casa" component={HomeScreen}
options={{ title: 'Casa ' }} />

 </Tab.Navigator>
 );
};
export default NavegacionTabs;