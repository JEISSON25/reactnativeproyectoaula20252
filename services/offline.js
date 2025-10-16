import AsyncStorage from "@react-native-async-storage/async-storage";
const PRODUCTS_KEY = "my_app_products_v1";
const PENDING_KEY = "my_app_pending_movements_v1";


export async function getStoredProducts() {
    try {
        const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error("getStoredProducts error", e);
        return null;
    }
}

export async function saveProducts(products) {
    try {
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        console.error("saveProducts error", e);
    }
}

export async function getPendingMovements() {
    try {
        const raw = await AsyncStorage.getItem(PENDING_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error("getPendingMovements error", e);
        return [];
    }
}

export async function savePendingMovements(list) {
    try {
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("savePendingMovements error", e);
    }
}

export async function addPendingMovement(movement) {
    try {
        const list = await getPendingMovements();
        list.push(movement);
        await savePendingMovements(list);
    } catch (e) {
        console.error("addPendingMovement error", e);
    }
}

export async function clearPendingMovements() {
    try {
        await AsyncStorage.removeItem(PENDING_KEY);
    } catch (e) {
        console.error("clearPendingMovements error", e);
    }
}
