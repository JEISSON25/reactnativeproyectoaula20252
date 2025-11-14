import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCTS_KEY = "my_app_products_v1";
const PENDING_KEY = "my_app_pending_movements_v1";
const USERS_KEY = "my_app_users_v1";
const CURRENT_USER_KEY = "my_app_current_user_v1";


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


/**
 * Obtiene todos los usuarios registrados localmente
 */
export async function getStoredUsers() {
    try {
        const raw = await AsyncStorage.getItem(USERS_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error("getStoredUsers error", e);
        return [];
    }
}



export async function saveUserLocally(email, password) {
    try {
        const users = await getStoredUsers();

        const exists = users.find(u => u.email === email);
        if (exists) {
            throw new Error("El usuario ya existe localmente");
        }

        const newUser = {
            email,
            password,
            createdAt: new Date().toISOString(),
            uid: `offline_${Date.now()}_${Math.random()}`
        };

        users.push(newUser);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

        return newUser;
    } catch (e) {
        console.error("saveUserLocally error", e);
        throw e;
    }
}


export async function verifyUserLocally(email, password) {
    try {
        const users = await getStoredUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error("Credenciales incorrectas");
        }

        return user;
    } catch (e) {
        console.error("verifyUserLocally error", e);
        throw e;
    }
}


export async function saveCurrentUser(user) {
    try {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.error("saveCurrentUser error", e);
    }
}


export async function getCurrentUser() {
    try {
        const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error("getCurrentUser error", e);
        return null;
    }
}


export async function clearCurrentUser() {
    try {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
        console.error("clearCurrentUser error", e);
    }
}


export async function markUserForSync(email, password) {
    try {
        const SYNC_KEY = "my_app_users_to_sync_v1";
        const raw = await AsyncStorage.getItem(SYNC_KEY);
        const toSync = raw ? JSON.parse(raw) : [];

        toSync.push({ email, password, timestamp: new Date().toISOString() });
        await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(toSync));
    } catch (e) {
        console.error("markUserForSync error", e);
    }
}


export async function getUsersToSync() {
    try {
        const SYNC_KEY = "my_app_users_to_sync_v1";
        const raw = await AsyncStorage.getItem(SYNC_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("getUsersToSync error", e);
        return [];
    }
}


export async function clearUsersToSync() {
    try {
        const SYNC_KEY = "my_app_users_to_sync_v1";
        await AsyncStorage.removeItem(SYNC_KEY);
    } catch (e) {
        console.error("clearUsersToSync error", e);
    }
}