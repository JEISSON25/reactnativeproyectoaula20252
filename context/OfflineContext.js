import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { doc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { db as firestoreDb } from "../firebaseConfig";
import sqlite from "./sqlite";

//contexto del modo offline o online 
const OfflineContext = createContext();

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  // Nuevo estado para el modo offline forzado
  const [isForcedOffline, setIsForcedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  //evita que se ejecuten otras sincronizaciones al mismo tiempo
  const syncingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const nowConnected = !!state.isConnected;
      const wasConnected = isConnected;
      setIsConnected(nowConnected);

      //si vuelve el internet, intenta sincronizar los datos pendientes
      if (!wasConnected && nowConnected) {
        console.log("Conexión restablecida, sincronizando...");
        syncPending();
      }
    });

    //carga si el modo offline forzado estaba activo
    const loadForcedOffline = async () => {
      try {
        const stored = await AsyncStorage.getItem("isForcedOffline");
        if (stored !== null) setIsForcedOffline(JSON.parse(stored));
      } catch (e) {
        console.error("Error cargando estado offline:", e);
      }
    };

    loadForcedOffline();
    return () => unsubscribe();
  }, []);

  //activa o desactiva manualmente el modes ofline
  const toggleForcedOffline = async () => {
    const newState = !isForcedOffline;
    setIsForcedOffline(newState);
    try {
      await AsyncStorage.setItem("isForcedOffline", JSON.stringify(newState));
      console.log("Modo offline forzado:", newState);
    } catch (e) {
      console.error("Error guardando estado offline:", e);
    }
  };

  //verifica si la app esta online
  const isAppOnline = isConnected && !isForcedOffline;

  //sincroniza los datos de sqlite con firebase
  const syncPending = async () => {
    if (!isAppOnline) {
      console.log("Sin conexión. Sincronización omitida.");
      return;
    }
    //esto es para que no haya otra sincronizacion al mismo tiempo
    if (syncingRef.current) {
      console.log("Sincronización en curso, se omite duplicado.");
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      console.log("Iniciando sincronización local...");
      await sqlite.initDB();

      const pendingUsers = await sqlite.getPendingLocalUsers();
      if (pendingUsers.length) {
        console.log("Usuarios pendientes:", pendingUsers.length);
      }

      for (const u of pendingUsers) {
        try {
          if (!u.uid) {
            console.warn("Usuario sin UID, se omite:", u.email);
          }
        } catch (e) {
          console.error("Error sincronizando usuario:", e);
        }
      }

      const pendingRoutines = await sqlite.getPendingRoutines();
      if (pendingRoutines.length) {
        console.log("Rutinas pendientes:", pendingRoutines.length);
      }

      for (const r of pendingRoutines) {
        try {
          const payload = r.payload;

          await setDoc(doc(firestoreDb, "customRoutines", payload.id), {
            ...payload,
            isOffline: false,
            userId: payload.userId,
          });
          //rutina sincronizada en sql
          await sqlite.markRoutinePendingSynced(payload.id);
          await sqlite.saveRoutineFromFirebase({
            id: payload.id,
            userId: payload.userId,
            name: payload.name,
            level: payload.level,
            duration: payload.duration,
            exercises: payload.exercises,
            createdAt: payload.createdAt,
          });

          console.log("Rutina sincronizada:", payload.name);
        } catch (e) {
          console.error("Error sincronizando rutina:", e);
        }
      }

      console.log("Sincronización completada.");
    } catch (e) {
      console.error("Error general durante sincronización:", e);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  };

  //los valores que se comparte al contexto
  const value = {
    isConnected,
    isForcedOffline,
    isAppOnline,
    isSyncing,
    toggleForcedOffline,
    syncPending,
  };

  //retorna el contexto
  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
