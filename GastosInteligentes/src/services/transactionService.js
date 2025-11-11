import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import NetInfo from "@react-native-community/netinfo";

//Agregar transaccion
export const addTransaction = async (userId, transaction) => {
  try {
    const netInfo = await NetInfo.fetch();

    const newTransaction = {
      ...transaction,
      userId,
      createdAt: serverTimestamp(),
    };

    if (!netInfo.isConnected) {
      const local = JSON.parse(await AsyncStorage.getItem("offline_transactions")) || [];
      local.push({ ...newTransaction, _action: "add" });
      await AsyncStorage.setItem("offline_transactions", JSON.stringify(local));
      console.log("Guardado localmente (sin conexión)");
      return "offline_saved";
    } else {
      const docRef = await addDoc(collection(db, "transactions"), newTransaction);
      console.log("Guardado online");
      return docRef.id;
    }
  } catch (error) {
    console.error("Error al agregar transacción:", error);
    throw error;
  }
};

//actualizar transaccuin
export const updateTransaction = async (id, updatedData) => {
  try {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      // Guardar la actualizacion para sincronizar luego
      const local = JSON.parse(await AsyncStorage.getItem("offline_updates")) || [];
      local.push({ id, updatedData, _action: "update" });
      await AsyncStorage.setItem("offline_updates", JSON.stringify(local));
      console.log("Actualización guardada localmente (sin conexión)");
      return "offline_updated";
    } else {
      const docRef = doc(db, "transactions", id);
      await updateDoc(docRef, { ...updatedData, updatedAt: serverTimestamp() });
      console.log("Transacción actualizada online");
      return "online_updated";
    }
  } catch (error) {
    console.error("Error al actualizar transacción:", error);
    throw error;
  }
};

//Eliminar transaccion
export const deleteTransaction = async (id) => {
  try {
    const netInfo = await NetInfo.fetch();

//Eliminar también del cache local
    const cached = JSON.parse(await AsyncStorage.getItem("cached_transactions")) || [];
    const updatedCache = cached.filter(t => t.id !== id);
    await AsyncStorage.setItem("cached_transactions", JSON.stringify(updatedCache));

    if (!netInfo.isConnected) {
      const local = JSON.parse(await AsyncStorage.getItem("offline_deletes")) || [];
      local.push({ id, _action: "delete" });
      await AsyncStorage.setItem("offline_deletes", JSON.stringify(local));
      console.log("Eliminación guardada localmente (sin conexion)");
      return "offline_deleted";
    } else {
      await deleteDoc(doc(db, "transactions", id));
      console.log("Transaccion eliminada online");
      return "online_deleted";
    }
  } catch (error) {
    console.error("Error al eliminar transaccion:", error);
    throw error;
  }
};

//sincronizacion cuando haya internet
export const syncOfflineTransactions = async (userId) => {
  //sincronizar agregados
  const localAdds = JSON.parse(await AsyncStorage.getItem("offline_transactions")) || [];
  if (localAdds.length > 0) {
    console.log(`Sincronizando ${localAdds.length} transacciones agregadas...`);
    for (const t of localAdds) {
      await addDoc(collection(db, "transactions"), {
        ...t,
        userId,
        syncedAt: serverTimestamp(),
      });
    }
    await AsyncStorage.removeItem("offline_transactions");
    console.log("Sincronización de agregados completada");
  }

  //sincronizar actualizaciones
  const localUpdates = JSON.parse(await AsyncStorage.getItem("offline_updates")) || [];
  if (localUpdates.length > 0) {
    console.log(`Sincronizando ${localUpdates.length} actualizaciones...`);
    for (const u of localUpdates) {
      const docRef = doc(db, "transactions", u.id);
      await updateDoc(docRef, { ...u.updatedData, syncedAt: serverTimestamp() });
    }
    await AsyncStorage.removeItem("offline_updates");
    console.log("Sincronización de actualizaciones completada");
  }

  //sincronizar eliminaciones
  const localDeletes = JSON.parse(await AsyncStorage.getItem("offline_deletes")) || [];
  if (localDeletes.length > 0) {
    console.log(`Sincronizando ${localDeletes.length} eliminaciones...`);
    for (const d of localDeletes) {
      await deleteDoc(doc(db, "transactions", d.id));
    }
    await AsyncStorage.removeItem("offline_deletes");
    console.log("Sincronización de eliminaciones completada");
  }
};

//obtener transaciones

export const getTransactionByUser = async (userId) => {
  try {
    const netInfo = await NetInfo.fetch();

//Siempre cargamos el cache local
    const cached = JSON.parse(await AsyncStorage.getItem("cached_transactions")) || [];
    const localAdds = JSON.parse(await AsyncStorage.getItem("offline_transactions")) || [];
    const localUpdates = JSON.parse(await AsyncStorage.getItem("offline_updates")) || [];
    const localDeletes = JSON.parse(await AsyncStorage.getItem("offline_deletes")) || [];

    let merged = [...cached];

 // Aplicar eliminaciones locales
    for (const d of localDeletes) {
      merged = merged.filter(t => t.id !== d.id);
    }

//Aplicar actualizaciones locales
    for (const u of localUpdates) {
      const idx = merged.findIndex(t => t.id === u.id);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...u.updatedData, offline: true };
    }

 //Agregar nuevas transacciones locales
    for (const t of localAdds) {
      merged.push({
        ...t,
        id: t.id || Math.random().toString(36).slice(2),
        offline: true
      });
    }

    if (!netInfo.isConnected) {
      console.log("Mostrando datos locales (sin conexión)");
      return merged.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
    }

 //Si hay conexion hacemos get de Firebase
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("transactionDate", "desc")
    );

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

//Guardar en cache
    await AsyncStorage.setItem("cached_transactions", JSON.stringify(transactions));
    console.log("Datos online obtenidos y guardados localmente");

    return transactions;
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    const cached = JSON.parse(await AsyncStorage.getItem("cached_transactions")) || [];
    return cached;
  }
};
