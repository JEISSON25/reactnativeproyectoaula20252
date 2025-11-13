import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './AuthContext';

const OfflineContext = createContext();

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Estado de conexión cambió:', state.isConnected);
      const wasOffline = !isOnline;
      setIsOnline(state.isConnected);
      
      // Si recuperamos conexión y había acciones pendientes
      if (state.isConnected && wasOffline) {
        console.log('Conexión recuperada. Sincronizando...');
        setTimeout(() => {
          syncPendingActions();
        }, 1000); // Pequeño delay para asegurar conexión estable
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // Cargar acciones pendientes al iniciar
  useEffect(() => {
    loadPendingActions();
  }, []);

  // Sincronizar cuando cambie el usuario o las acciones pendientes
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && currentUser && !isSyncing) {
      console.log('Hay acciones pendientes, sincronizando...');
      syncPendingActions();
    }
  }, [isOnline, currentUser]);

  const loadPendingActions = async () => {
    try {
      const stored = await AsyncStorage.getItem('pendingActions');
      if (stored) {
        const actions = JSON.parse(stored);
        console.log('Acciones pendientes cargadas:', actions.length);
        setPendingActions(actions);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = async (actions) => {
    try {
      await AsyncStorage.setItem('pendingActions', JSON.stringify(actions));
      setPendingActions(actions);
      console.log('Acciones pendientes guardadas:', actions.length);
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const addPendingAction = async (action) => {
    const newAction = { 
      ...action, 
      timestamp: Date.now(),
      id: action.id || `pending_${Date.now()}_${Math.random()}`
    };
    const newActions = [...pendingActions, newAction];
    await savePendingActions(newActions);
    console.log('Acción agregada a pendientes:', action.type);
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) {
      console.log('⏸No se puede sincronizar:', { isOnline, pendingCount: pendingActions.length, isSyncing });
      return;
    }

    console.log('Iniciando sincronización de', pendingActions.length, 'acciones...');
    setIsSyncing(true);

    const successfulActions = [];
    const failedActions = [];

    for (const action of pendingActions) {
      try {
        console.log('Procesando acción:', action.type, action.id);
        
        switch (action.type) {

          case 'ADD_APPOINTMENT':
            const appointmentRef = await addDoc(collection(db, 'appointments'), action.data);
            console.log('Cita creada en Firebase:', appointmentRef.id);
            successfulActions.push(action);
            break;

          case 'UPDATE_APPOINTMENT':
            if (action.id && !action.id.startsWith('pending_') && !action.id.startsWith('temp_')) {
              await updateDoc(doc(db, 'appointments', action.id), action.data);
              console.log('Cita actualizada en Firebase:', action.id);
              successfulActions.push(action);
            } else {
              console.log('ID temporal, buscando cita por datos...');
              failedActions.push(action);
            }
            break;

          case 'DELETE_APPOINTMENT':
            if (action.id && !action.id.startsWith('pending_') && !action.id.startsWith('temp_')) {
              await deleteDoc(doc(db, 'appointments', action.id));
              console.log('Cita eliminada en Firebase:', action.id);
              successfulActions.push(action);
            } else {
              console.log('ID temporal, no se puede eliminar');
              successfulActions.push(action); 
            }
            break;

          case 'ADD_MEDICAL_RECORD':
            const recordRef = await addDoc(collection(db, 'medicalRecords'), action.data);
            console.log('Registro médico creado en Firebase:', recordRef.id);
            successfulActions.push(action);
            break;

          case 'UPDATE_MEDICAL_RECORD':
            if (action.id && !action.id.startsWith('pending_') && !action.id.startsWith('temp_')) {
              await updateDoc(doc(db, 'medicalRecords', action.id), action.data);
              console.log('Registro médico actualizado en Firebase:', action.id);
              successfulActions.push(action);
            } else {
              console.log('ID temporal de registro médico');
              failedActions.push(action);
            }
            break;

          case 'DELETE_MEDICAL_RECORD':
            if (action.id && !action.id.startsWith('pending_') && !action.id.startsWith('temp_')) {
              await deleteDoc(doc(db, 'medicalRecords', action.id));
              console.log('Registro médico eliminado en Firebase:', action.id);
              successfulActions.push(action);
            } else {
              console.log('ID temporal, no se puede eliminar');
              successfulActions.push(action);
            }
            break;

          default:
            console.log('Tipo de acción desconocido:', action.type);
            failedActions.push(action);
        }
      } catch (error) {
        console.error('Error syncing action:', action.type, error);
        failedActions.push(action);
      }
    }

    // Remover acciones exitosas y mantener las fallidas
    const remainingActions = failedActions;
    await savePendingActions(remainingActions);
    
    console.log('Sincronización completada:', {
      exitosas: successfulActions.length,
      fallidas: failedActions.length,
      restantes: remainingActions.length
    });

    setIsSyncing(false);

    // Limpiar cachés relevantes para forzar recarga
    if (successfulActions.length > 0) {
      await AsyncStorage.removeItem('appointments');
      console.log('Caché de appointments limpiado');
      
      // Limpiar cachés de registros médicos por mascota
      const medicalRecordActions = successfulActions.filter(a => 
        a.type.includes('MEDICAL_RECORD')
      );
      
      if (medicalRecordActions.length > 0) {
        const petIds = new Set(medicalRecordActions.map(a => a.data?.petId).filter(Boolean));
        for (const petId of petIds) {
          await AsyncStorage.removeItem(`medical_records_${petId}`);
          console.log(`Caché de registros médicos limpiado para pet: ${petId}`);
        }
      }
    }
  };

  // Guardar datos en caché local
  const cacheData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log('Datos cacheados:', key);
    } catch (error) {
      console.error('Error datos en caché:', error);
    }
  };

  // Obtener datos de caché
  const getCachedData = async (key) => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        console.log('Datos obtenidos de caché:', key);
      }
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  };

  // Limpiar datos específicos del caché
  const clearCache = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log('Caché limpiado:', key);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Limpiar todo el caché
  const clearAllCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        !key.includes('pendingActions') && !key.includes('auth')
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('Todo el caché limpiado');
    } catch (error) {
      console.error('Error al borrar caché:', error);
    }
  };

  const value = {
    isOnline,
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    clearCache,
    clearAllCache
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}