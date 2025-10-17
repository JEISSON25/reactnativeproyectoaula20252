import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigation = useNavigation();
  const { user, logout, loading } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.navigate("Home");
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }, [navigation])
  );

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('LoginScreen');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Configuraciones</Text>
      
      {/* Información del usuario */}
      <View style={styles.userSection}>
        <Text style={styles.sectionTitle}>👤 Información del Usuario</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Email:</Text>
          <Text style={styles.userValue}>{user?.email || 'No disponible'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Nombre:</Text>
          <Text style={styles.userValue}>{user?.displayName || 'Usuario'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>ID:</Text>
          <Text style={styles.userValue}>{user?.uid?.substring(0, 8) || 'N/A'}...</Text>
        </View>
      </View>

      {/* Configuraciones de la app */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>🔧 Configuraciones de la App</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notificaciones:</Text>
          <Text style={styles.settingValue}>Activadas</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Tema:</Text>
          <Text style={styles.settingValue}>Claro</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Idioma:</Text>
          <Text style={styles.settingValue}>Español</Text>
        </View>
      </View>

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}> Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  userSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  userValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    flex: 2,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});