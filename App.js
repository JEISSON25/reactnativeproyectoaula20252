import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import NavegacionStack from './navegacion/NavegacionStack';
import AuthStack from './navegacion/AuthStack';
import { ProveedorAuth, AuthContexto } from './contextos/AuthContexto';
import { ProveedorFavoritos } from './contextos/FavoritosContexto';
export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [forceOffline, setForceOffline] = useState(false);

  // detectar internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!forceOffline) {
        setIsOnline(state.isConnected);
      }
    });
    return unsubscribe;
  }, [forceOffline]);

  const toggleOffline = () => {
    setForceOffline(!forceOffline);
    setIsOnline(forceOffline); 
  };

  const Rutas = () => {
    const { usuario } = React.useContext(AuthContexto);
    return usuario ? <NavegacionStack /> : <AuthStack />;
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {!isOnline && (
          <View style={{ backgroundColor: 'red', padding: 10 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Modo offline: los cambios se verán reflejados cuando te conectes
            </Text>
          </View>
        )}
        <Button
          title={forceOffline ? 'Activar online' : 'Activar offline'}
          onPress={toggleOffline}
        />
        <NavigationContainer>
          <ProveedorAuth>
            <ProveedorFavoritos>
              <Rutas />
            </ProveedorFavoritos>
          </ProveedorAuth>
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
}
