import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { serverTimestamp } from "firebase/firestore";

export const addTransaction = async(userId, transaction) => {
    try {
        console.log(`Registrando transaccion... userId: ${userId} Transaction: ${transaction}`);
        const docRef = await addDoc(collection(db, "transactions"), {
            ...transaction,
            userId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error al agregar transacción:", error);
        throw error;
    }
}

export const getTransactionByUser = async (userId) => {
    try{
        const q = query(
            collection(db, "transactions"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error){
        console.error("Error al obtener transacciones:", error);
        throw error;
    }
}

export const updateTransaction = async (id, updates) => {
    try {
        const docRef = doc(db, "transactions", id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        })
    } catch (error) {
        console.error("Error al actualizar transaccion", error)
        throw error;
    }
}

export const deleteTransaction = async (id) => {
    try{
        const docRef = doc(db, "transactions", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error al eliminar transaccion:", error)
        throw error;
    }
}