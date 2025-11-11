import React, { useEffect, useState } from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import ConnectionStatusBanner from "./src/components/ConnectionStatusBanner";
import NetInfo from "@react-native-community/netinfo";
import { syncOfflineTransactions } from "./src/services/transactionService";
import { syncOfflineUsers } from "./src/services/syncService";
import { syncOfflineGoals, getGoalsByUser } from "./src/services/goalService";
import { getDB } from "./src/services/database";
import * as Notifications from "expo-notifications";
import { checkGoalsProgress } from "./src/utils/checkGoals";
import { getTransactionsByUser } from "./src/services/transactionService";

function SyncHandler() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected) {
      console.log("Online activado");
      syncOfflineUsers();

      if (user?.uid) {
        // Sincronizacion general
        (async () => {
          await syncOfflineTransactions(user.uid);
          await syncOfflineGoals(user.uid);

          //Verificar progreso de metas después de sincronizar
          const [transactions, goals] = await Promise.all([
            getTransactionsByUser(user.uid),
            getGoalsByUser(user.uid),
          ]);

          await checkGoalsProgress(transactions, goals);
        })();
      }
    } else {
      console.log("Offline activado");
    }
  }, [isConnected, user]);

  return null;
}

export default function App() {
  useEffect(() => {
    (async () => {
      await getDB();

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("No tienes permisos de notificaciones");
      }

      //Configurar comportamiento de las notificaciones
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    })();
  }, []);

  return (
    <AuthProvider>
      <ConnectionStatusBanner />
      <SyncHandler />
      <RootNavigator />
    </AuthProvider>
  );
}
