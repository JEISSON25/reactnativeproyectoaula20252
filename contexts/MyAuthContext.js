import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import NetInfo from "@react-native-community/netinfo";
import {
    getCurrentUser,
    clearCurrentUser,
    saveCurrentUser,
    getUsersToSync
} from "../services/offline";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(true);

    //sincronizar usuarios offline con Firebase
    const syncOfflineUsers = async () => {
        try {
            const usersToSync = await getUsersToSync();

            if (usersToSync.length === 0) return;

            console.log(`Sincronizando ${usersToSync.length} usuarios pendientes...`);

            for (const userData of usersToSync) {
                try {
                    //esto es paraa intentar crear el usuario en firebase
                    await createUserWithEmailAndPassword(
                        auth,
                        userData.email,
                        userData.password
                    );
                    console.log(`✓ Usuario sincronizado: ${userData.email}`);
                } catch (error) {
                    if (error.code === "auth/email-already-in-use") {
                        console.log(`Usuario ${userData.email} ya existe en Firebase`);
                    } else {
                        console.error(`Error sincronizando ${userData.email}:`, error.message);
                    }
                }
            }

            const { clearUsersToSync } = await import("../services/offline");
            await clearUsersToSync();
            console.log("Sincronización de usuarios completada");
        } catch (error) {
            console.error("Error en sincronización de usuarios:", error);
        }
    };

    useEffect(() => {
        let unsubscribeAuth = null;
        let unsubscribeNetInfo = null;

        const initAuth = async () => {
            unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
                const online = state.isConnected;
                setIsOnline(online);


                if (online) {
                    await syncOfflineUsers();
                }
            });

            //mira si hay sesion local guardada
            const localUser = await getCurrentUser();

            if (localUser) {
                setUser({
                    email: localUser.email,
                    uid: localUser.uid,
                    isOffline: !localUser.isOnline
                });
                setLoading(false);
            }

            // mirar auth de firebase (online)
            unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const userData = {
                        email: firebaseUser.email,
                        uid: firebaseUser.uid,
                        isOffline: false
                    };

                    await saveCurrentUser({
                        email: firebaseUser.email,
                        uid: firebaseUser.uid,
                        isOnline: true
                    });

                    setUser(userData);
                } else {
                    const localUser = await getCurrentUser();
                    if (localUser) {
                        setUser({
                            email: localUser.email,
                            uid: localUser.uid,
                            isOffline: true
                        });
                    } else {
                        setUser(null);
                    }
                }
                setLoading(false);
            });
        };

        initAuth();
        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeNetInfo) unsubscribeNetInfo();
        };
    }, []);



    //actualiza usuario en context despues de login
    const updateUser = async (userData) => {
        setUser(userData);
        await saveCurrentUser(userData);
    };

    const logout = async () => {
        try {
            await clearCurrentUser();

            // Si está online, cerrar sesión en Firebase
            if (isOnline) {
                try {
                    await signOut(auth);
                } catch (error) {
                    console.log("Error cerrando sesión en Firebase:", error.message);
                }
            }

            setUser(null);
        } catch (error) {
            console.error("Error en logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isOnline, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};