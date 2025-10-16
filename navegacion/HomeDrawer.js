import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth, signOut } from 'firebase/auth';

import HomeScreen from '../screens/HomeScreen';
import FavoritosScreen from '../screens/FavoritesScreen';

const Drawer = createDrawerNavigator();

// 🔹 Drawer personalizado
function CustomDrawerContent(props) {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 🔸 Regresa al login (que está en el stack superior)
      props.navigation.reset('InicioSesion'); 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
