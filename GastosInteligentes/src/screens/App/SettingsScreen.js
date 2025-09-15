import React from 'react';
import { View, Text, Button } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import {useAuth} from '../../context/AuthContext'

const SettingsScreen = () => {

 const {user, logout} = useAuth();

  const handleLogout = async () => {
      try {
        await logout();
        console.log("Sesion cerrada")
      } catch (error){
        console.error("Error al cerrar sesión:", error.message)
      }
    }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{marginBottom:30, fontSize: 18}}>Correo: {user.email}</Text>
      <Button
       title="Cerrar Sesión"
       onPress={() => handleLogout()}
       />
    </View>
  )
}

export default SettingsScreen;