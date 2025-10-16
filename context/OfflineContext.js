import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfflineContext = createContext();

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isForcedOffline, setIsForcedOffline] = useState(false); // Nuevo estado para el modo offline forzado
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Suscripción a los cambios de conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Cargar el estado de modo offline forzado desde AsyncStorage
    const loadForcedOfflineState = async () => {
      try {
        const forcedState = await AsyncStorage.getItem('isForcedOffline');
        if (forcedState !== null) {
          setIsForcedOffline(JSON.parse(forcedState));
        }
      } catch (e) {
        console.error('Error loading forced offline state:', e);
      }
    };

    loadForcedOfflineState();

    return () => unsubscribe();
  }, []);

  // Función para alternar el modo offline forzado
  const toggleForcedOffline = async () => {
    const newState = !isForcedOffline;
    setIsForcedOffline(newState);
    try {
      await AsyncStorage.setItem('isForcedOffline', JSON.stringify(newState));
    } catch (e) {
      console.error('Error saving forced offline state:', e);
    }
  };

  // El estado final de la aplicación (online/offline)
  const isAppOnline = isConnected && !isForcedOffline;

  const value = {
    isConnected,
    isForcedOffline,
    isAppOnline,
    isSyncing,
    setIsSyncing,
    toggleForcedOffline,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
