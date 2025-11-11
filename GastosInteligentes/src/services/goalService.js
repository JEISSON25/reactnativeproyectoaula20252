import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, where, query, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

//Agrega meta online/offline
export const addGoal = async (userId, goal) => {
    const net = await NetInfo.fetch();
    const newGoal = {
        ...goal,
        userId,
        createdAt: serverTimestamp(),
        reached: false,
        deleted: false,
        progress: 0
    };

    if (!net.isConnected) {
        const local = JSON.parse(await AsyncStorage.getItem("offline_goals")) || [];
        local.push({ ...newGoal, _action: "add" });
        await AsyncStorage.setItem("offline_goals", JSON.stringify(local));

        const cached = JSON.parse(await AsyncStorage.getItem("cached_goals")) || [];
        cached.push(newGoal);
        await AsyncStorage.setItem("cached_goals", JSON.stringify(cached));

        await AsyncStorage.setItem("goal_progress", JSON.stringify(0));
        return "offline_saved";
    }

    const docRef = await addDoc(collection(db, "goals"), newGoal);
    return docRef.id;
};

export const updateGoal = async (id, data) => {
    const net = await NetInfo.fetch();

    if (!net.isConnected) {
        const local = JSON.parse(await AsyncStorage.getItem("offline_goal_updates")) || [];
        local.push({ id, data, _action: "update" });
        await AsyncStorage.setItem("offline_goal_updates", JSON.stringify(local));

        const cached = JSON.parse(await AsyncStorage.getItem("cached_goals")) || [];
        const idx = cached.findIndex(g => g.id === id);
        if (idx !== -1) cached[idx] = { ...cached[idx], ...data };
        await AsyncStorage.setItem("cached_goals", JSON.stringify(cached));
        return "offline_updated";
    }

    await updateDoc(doc(db, "goals", id), { ...data, updatedAt: serverTimestamp() });
    return "online_updated";
};


//Elimina meta online/offline
export const deleteGoal = async (id) => {
  const net = await NetInfo.fetch();

  if (!net.isConnected) {
    const local = JSON.parse(await AsyncStorage.getItem("offline_goal_deletes")) || [];
    local.push({ id, _action: "delete" });
    await AsyncStorage.setItem("offline_goal_deletes", JSON.stringify(local));

    // Soft delete en cache local
    const cached = JSON.parse(await AsyncStorage.getItem("cached_goals")) || [];
    const idx = cached.findIndex(g => g.id === id);
    if (idx !== -1) cached[idx].deleted = true;
    await AsyncStorage.setItem("cached_goals", JSON.stringify(cached));

    await AsyncStorage.setItem("goal_progress", JSON.stringify(0));
    return "offline_deleted";
  }

  // Soft delete online
  await updateDoc(doc(db, "goals", id), { deleted: true, updatedAt: serverTimestamp() });

  // Reiniciar progreso local
  await AsyncStorage.setItem("goal_progress", JSON.stringify(0));
  return "online_deleted";
};

//Obtiene metas online/offline
export const getGoalsByUser = async (userId) => {
  const net = await NetInfo.fetch();
  const cached = JSON.parse(await AsyncStorage.getItem("cached_goals")) || [];

  if (!net.isConnected) return cached.filter(g => !g.deleted);

  const q = query(collection(db, "goals"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const goals = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(g => !g.deleted);

  await AsyncStorage.setItem("cached_goals", JSON.stringify(goals));
  return goals;
};



//Sincroniza metas offline al conectarse
export const syncOfflineGoals = async (userId) => {
    const adds = JSON.parse(await AsyncStorage.getItem("offline_goals")) || [];
    const updates = JSON.parse(await AsyncStorage.getItem("offline_goal_updates")) || [];
    const deletes = JSON.parse(await AsyncStorage.getItem("offline_goal_deletes")) || [];

    for (const g of adds) await addDoc(collection(db, "goals"), { ...g, userId, syncedAt: serverTimestamp() });
    for (const u of updates) await updateDoc(doc(db, "goals", u.id), { ...u.data, syncedAt: serverTimestamp() });
    for (const d of deletes) await deleteDoc(doc(db, "goals", d.id));

    await AsyncStorage.multiRemove(["offline_goals", "offline_goal_updates", "offline_goal_deletes"]);
};
