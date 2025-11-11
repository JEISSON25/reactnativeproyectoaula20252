import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const ConexionContexto = createContext();

export const ProveedorConexion = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });
    return unsubscribe;
  }, []);

  return (
    <ConexionContexto.Provider value={{ isOnline }}>
      {children}
    </ConexionContexto.Provider>
  );
};
