// src/utils/OfflineObservations.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const OFFLINE_KEY = 'offline_observations';
const SYNCED_FLAG = '_synced'; // Para marcar sincronizadas

export const OfflineObservations = {
  // Guardar observación offline
  save: async (observacion) => {
    try {
      const pendientes = await OfflineObservations.getAll();
      pendientes.push({
        ...observacion,
        _offline: true,
        _timestamp: Date.now()
      });
      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(pendientes));
      console.log('Guardado offline:', observacion.ubicacion);
    } catch (error) {
      console.error('Error al guardar offline:', error);
    }
  },

  // Obtener todas las pendientes
  getAll: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al leer offline:', error);
      return [];
    }
  },

  // Sincronizar con Firestore
  sync: async () => {
    const pendientes = await OfflineObservations.getAll();
    if (pendientes.length === 0) return 0;

    let count = 0;
    for (const obs of pendientes) {
      if (obs[SYNCED_FLAG]) continue; // Ya sincronizada

      try {
        await addDoc(collection(db, 'observaciones'), {
          uid: obs.uid,
          ubicacion: obs.ubicacion,
          temperature_2m: obs.temperature_2m,
          relative_humidity_2m: obs.relative_humidity_2m,
          fecha: serverTimestamp(),
        });

        obs[SYNCED_FLAG] = true; // Marcar como sincronizada
        count++;
      } catch (error) {
        console.log('Error al subir:', error);
        break; // Parar si hay error
      }
    }

    // Guardar cambios (marcadas como sincronizadas)
    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(pendientes));
    console.log(`Sincronizadas: ${count} observaciones`);
    return count;
  },

  // Limpiar sincronizadas
  clearSynced: async () => {
    const pendientes = await OfflineObservations.getAll();
    const noSincronizadas = pendientes.filter(obs => !obs[SYNCED_FLAG]);
    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(noSincronizadas));
    console.log('Limpieza: sincronizadas eliminadas');
  }
};