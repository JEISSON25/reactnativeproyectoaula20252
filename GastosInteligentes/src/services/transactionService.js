import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import NetInfo from "@react-native-community/netinfo";

// Guardar transacción (offline o online)
export const addTransaction = async (userId, transaction) => {
  try {
    const netInfo = await NetInfo.fetch();

    const newTransaction = {
      ...transaction,
      userId,
      createdAt: serverTimestamp(),
    };

    if (!netInfo.isConnected) {
      // Guardar localmente si no hay conexión
      const local = JSON.parse(await AsyncStorage.getItem("offline_transactions")) || [];
      local.push(newTransaction);
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

// Sincronizar cuando hay internet
export const syncOfflineTransactions = async (userId) => {
  const local = JSON.parse(await AsyncStorage.getItem("offline_transactions")) || [];
  if (local.length === 0) return;

  console.log(`Sincronizando ${local.length} transacciones pendientes...`);

  for (const t of local) {
    await addDoc(collection(db, "transactions"), {
      ...t,
      userId,
      syncedAt: serverTimestamp(),
    });
  }

  await AsyncStorage.removeItem("offline_transactions");
  console.log("Sincronización completada");
};

// Obtener transacciones online
export const getTransactionByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("transactionDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    throw error;
  }
};
