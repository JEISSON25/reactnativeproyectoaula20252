import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth, signOut } from 'firebase/auth';

import HomeScreen from '../screens/HomeScreen';
import FavoritosScreen from '../screens/FavoritesScreen';
import CrearRecetaScreen from '../screens/CrearRecetaScreen';
import MisRecetasScreen from '../screens/MisRecetasScreen';
import { useContext } from 'react';
import { AuthContexto } from '../contextos/AuthContexto';
import { auth } from '../firebaseConfig';
import PlanSemanalScreen from '../screens/PlanSemanalScreen';
import PlanesCreadosScreen from '../screens/PlanesCreadosScreen';

const Drawer = createDrawerNavigator();


function CustomDrawerContent(props) {

      const auth = getAuth();
      const {cerrarSesion} = useContext(AuthContexto);

      const handleLogout = async() => {
        try{
          await signOut(auth);
          cerrarSesion();
        }catch(error){
          console.error('error al iniciar sesion: ', error)
        }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}> Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function HomeDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Drawer.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{ title: 'Favoritos' }}
      />
      <Drawer.Screen
        name="CrearRecetaScreen"
        component={CrearRecetaScreen}
        options={{ title: 'Crear recetas' }}
      />
      <Drawer.Screen
        name="Mis Recetas"
        component={MisRecetasScreen}
        options={{ title: 'Mis Recetas' }}
      />
      <Drawer.Screen
        name="Plan Semanal"
        component={PlanSemanalScreen}
        options={{ title: 'Crear Plan' }}
      />
      <Drawer.Screen
        name="Planes Creados"
        component={PlanesCreadosScreen}
        options={{ title: 'Mi Plan' }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
