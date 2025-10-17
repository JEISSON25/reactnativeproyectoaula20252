import React, { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import ConnectionStatusBanner from "./src/components/ConnectionStatusBanner";
import { syncOfflineTransactions } from "./src/services/transactionService";

//componente para poder usar el useAuth() envolviendolo por el AuthProvider 
function SyncHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && user?.uid) {
        console.log("Conexión detectada, sincronizando...");
        syncOfflineTransactions(user.uid);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ConnectionStatusBanner />
      <SyncHandler />
      <RootNavigator />
    </AuthProvider>
  );
}
