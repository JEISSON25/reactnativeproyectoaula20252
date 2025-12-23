import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Animated, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";

import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, setDoc, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }) {
    const [inventario, setInventario] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [colaPendientes, setColaPendientes] = useState([]);
    const [user, setUser] = useState(null);

    const [cargandoUsuario, setCargandoUsuario] = useState(true);
    const [cargandoInventario, setCargandoInventario] = useState(true);
    const [cargando, setCargando] = useState(false);

    const [internetDisponible, setInternetDisponible] = useState(true);
    const [modoManualOffline, setModoManualOffline] = useState(false);
    const online = internetDisponible && !modoManualOffline;

    const setUserOnlineMode = (v) => {
        setModoManualOffline(!v);
        if (v) procesarColaPendiente();
    };

    const [toastMsg, setToastMsg] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastTranslate = useRef(new Animated.Value(12)).current;

    const showToast = (msg) => {
        setToastMsg(msg);
        setToastVisible(true);
        Animated.parallel([
            Animated.timing(toastOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.timing(toastTranslate, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(toastOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
                    Animated.timing(toastTranslate, { toValue: 12, duration: 220, useNativeDriver: true }),
                ]).start(() => setToastVisible(false));
            }, 1400);
        });
    };

    const ToastComponent = () => {
        if (!toastVisible) return null;
        return (
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.toast,
                    { opacity: toastOpacity, transform: [{ translateY: toastTranslate }] },
                ]}
            >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.toastText}>{toastMsg}</Text>
            </Animated.View>
        );
    };

    const KEY_INV = "inventarioLocal";
    const KEY_MOV = "movimientos";
    const KEY_COLA = "colaPendientes";

    const guardarInventarioLocal = async (lista) => {
        setInventario(lista);
        try { await AsyncStorage.setItem(KEY_INV, JSON.stringify(lista)); } catch {}
    };

    const guardarMovimientosLocal = async (lista) => {
        setMovimientos(lista);
        try { await AsyncStorage.setItem(KEY_MOV, JSON.stringify(lista)); } catch {}
    };

    const guardarColaLocal = async (cola) => {
        setColaPendientes(cola);
        try { await AsyncStorage.setItem(KEY_COLA, JSON.stringify(cola)); } catch {}
    };

    const guardarFotoLocal = async (uri, fileName) => {
        try {
            const newPath = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.copyAsync({ from: uri, to: newPath });
            return newPath;
        } catch {
            return null;
        }
    };

    const borrarFotoLocal = async (uri) => {
        try {
            if (uri && uri.startsWith(FileSystem.documentDirectory)) {
                await FileSystem.deleteAsync(uri, { idempotent: true });
            }
        } catch {}
    };

    const normalizarInventario = (lista) =>
        (lista || []).map((p) => {
            if (p.foto && !p.foto.startsWith(FileSystem.documentDirectory)) {
                return { ...p, foto: FileSystem.documentDirectory + p.foto };
            }
            if (p.fotoLocal && !p.foto) {
                const ruta = p.fotoLocal.startsWith(FileSystem.documentDirectory)
                    ? p.fotoLocal
                    : FileSystem.documentDirectory + p.fotoLocal;
                return { ...p, foto: ruta, fotoLocal: undefined };
            }
            return p;
        });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (usr) => {
            setUser(usr);
            if (usr) await inicializarTodo();
            else { setInventario([]); setMovimientos([]); }
            setCargandoUsuario(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const unsub = NetInfo.addEventListener((state) => {
            const conectado = Boolean(state.isConnected);
            setInternetDisponible(conectado);
            if (conectado && !modoManualOffline) procesarColaPendiente();
        });
        return unsub;
    }, [modoManualOffline]);

    const inicializarTodo = async () => {
        try {
            const inv = await AsyncStorage.getItem(KEY_INV);
            const mov = await AsyncStorage.getItem(KEY_MOV);
            const cola = await AsyncStorage.getItem(KEY_COLA);
            if (inv) setInventario(normalizarInventario(JSON.parse(inv)));
            if (mov) setMovimientos(JSON.parse(mov));
            if (cola) setColaPendientes(JSON.parse(cola));
            if (online) await sincronizarDesdeFirestore();
        } catch {}
        setCargandoInventario(false);
    };

    const sincronizarDesdeFirestore = async () => {
        try {
            const snap = await getDocs(collection(db, "productos"));
            const lista = snap.docs.map((d) => {
                const data = d.data();
                return {
                    ...data,
                    id: d.id,
                    codigo: d.id,
                    foto: data.foto ? FileSystem.documentDirectory + data.foto : null,
                };
            });
            await guardarInventarioLocal(normalizarInventario(lista));
        } catch {}
    };

    const procesarColaPendiente = async () => {
        if (!online || !colaPendientes.length) return;
        try {
            for (const item of colaPendientes) {
                if (item.type === "producto_set") await setDoc(doc(db, "productos", item.id), item.payload);
                else if (item.type === "producto_delete") await deleteDoc(doc(db, "productos", item.id));
                else if (item.type === "movimiento_add") await addDoc(collection(db, "movimientos"), item.payload);
                else if (item.type === "producto_update") await updateDoc(doc(db, "productos", item.id), item.payload);
            }
            await guardarColaLocal([]);
        } catch {}
    };

    const addProducto = async (producto) => {
        setCargando(true);
        try {
            const id = producto.codigo || Date.now().toString();
            const fotoPersistente = producto.foto ? await guardarFotoLocal(producto.foto, id) : null;
            const productoFinal = { ...producto, id, codigo: id, foto: fotoPersistente };
            const nuevoInv = [productoFinal, ...inventario];
            await guardarInventarioLocal(nuevoInv);

            const movimiento = {
                id: Date.now().toString(),
                tipo: "entrada",
                codigo: id,
                productoId: id,
                productoNombre: productoFinal.nombre,
                productoCodigo: id,
                cantidad: Number(productoFinal.cantidad) || 0,
                cantidadMovimiento: Number(productoFinal.cantidad) || 0,
                fecha: new Date().toISOString(),
                detalles: { antes: 0, despues: Number(productoFinal.cantidad) || 0 },
            };

            const nuevosMov = [movimiento, ...movimientos];
            await guardarMovimientosLocal(nuevosMov);

            const firestorePayload = {
                nombre: productoFinal.nombre,
                codigo: productoFinal.codigo,
                cantidad: Number(productoFinal.cantidad) || 0,
                stockMinimo: productoFinal.stockMinimo ?? 0,
                foto: fotoPersistente ? fotoPersistente.replace(FileSystem.documentDirectory, "") : null,
            };

            if (online) {
                await setDoc(doc(db, "productos", id), firestorePayload);
                await addDoc(collection(db, "movimientos"), movimiento);
            } else {
                const cola = [
                    ...colaPendientes,
                    { type: "producto_set", id, payload: firestorePayload },
                    { type: "movimiento_add", payload: movimiento },
                ];
                await guardarColaLocal(cola);
            }

            showToast("Entrada registrada");
            return productoFinal;
        } catch { throw e; } finally { setCargando(false); }
    };

    const editProducto = async (id, nuevosDatos) => {
        setCargando(true);
        try {
            const productoActual = inventario.find((p) => p.id === id);
            if (!productoActual) return false;

            const cantidadAntes = Number(productoActual.cantidad) || 0;
            const cantidadDespues = Number(nuevosDatos.cantidad) || 0;
            const diferencia = cantidadDespues - cantidadAntes;
            const tipo = diferencia >= 0 ? "entrada" : "salida";

            let fotoPersistente = productoActual.foto || null;
            if (nuevosDatos.foto) {
                const time = Date.now();
                const fileName = `${id}_${time}.jpg`;
                if (productoActual.foto && productoActual.foto.startsWith(FileSystem.documentDirectory)) {
                    await borrarFotoLocal(productoActual.foto);
                }
                fotoPersistente = await guardarFotoLocal(nuevosDatos.foto, fileName);
            }

            const productoEditado = { ...productoActual, ...nuevosDatos, cantidad: cantidadDespues, foto: fotoPersistente };
            const inventarioActualizado = inventario.map((p) => p.id === id ? productoEditado : p);
            await guardarInventarioLocal(inventarioActualizado);

            if (diferencia !== 0) {
                const movimiento = {
                    id: Date.now().toString(),
                    tipo,
                    productoId: id,
                    productoNombre: productoEditado.nombre,
                    productoCodigo: productoEditado.codigo,
                    cantidadAnterior: cantidadAntes,
                    cantidadNueva: cantidadDespues,
                    cantidadMovimiento: diferencia,
                    fecha: new Date().toISOString(),
                    detalles: { antes: cantidadAntes, despues: cantidadDespues },
                };
                const movimientosActualizados = [movimiento, ...movimientos];
                await guardarMovimientosLocal(movimientosActualizados);

                if (online) {
                    await addDoc(collection(db, "movimientos"), movimiento);
                } else {
                    const cola = [...colaPendientes, { type: "movimiento_add", payload: movimiento }];
                    await guardarColaLocal(cola);
                }
            }

            const payloadFirestore = {
                nombre: productoEditado.nombre,
                codigo: productoEditado.codigo,
                cantidad: cantidadDespues,
                stockMinimo: productoEditado.stockMinimo ?? 0,
                foto: productoEditado.foto ? productoEditado.foto.replace(FileSystem.documentDirectory, "") : null,
            };

            if (online) await updateDoc(doc(db, "productos", id), payloadFirestore);
            else {
                const cola = [...colaPendientes, { type: "producto_update", id, payload: payloadFirestore }];
                await guardarColaLocal(cola);
            }

            showToast("Producto actualizado correctamente");
            return true;
        } catch { throw e; } finally { setCargando(false); }
    };

    const deleteProducto = async (productoId) => {
        setCargando(true);
        try {
            const productoActual = inventario.find((p) => p.id === productoId);
            if (!productoActual) return;
            const { foto, nombre, cantidad } = productoActual;

            if (foto && foto.startsWith(FileSystem.documentDirectory)) {
                await borrarFotoLocal(foto);
            }

            const nuevoInv = inventario.filter((p) => p.id !== productoId);
            await guardarInventarioLocal(nuevoInv);

            const cant = Number(cantidad) || 0;
            const movimiento = {
                id: Date.now().toString(),
                tipo: "salida",
                codigo: productoId,
                productoId,
                productoNombre: nombre,
                productoCodigo: productoId,
                cantidad: cant,
                cantidadMovimiento: -cant,
                fecha: new Date().toISOString(),
                detalles: { antes: cant, despues: 0 },
            };

            const nuevosMov = [movimiento, ...movimientos];
            await guardarMovimientosLocal(nuevosMov);

            if (online) {
                await deleteDoc(doc(db, "productos", productoId));
                await addDoc(collection(db, "movimientos"), movimiento);
            } else {
                const cola = [...colaPendientes, { type: "producto_delete", id: productoId }, { type: "movimiento_add", payload: movimiento }];
                await guardarColaLocal(cola);
            }

            showToast("Producto eliminado correctamente");
        } catch {} finally { setCargando(false); }
    };

    const cerrarSesion = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem(KEY_INV);
            await AsyncStorage.removeItem(KEY_COLA);
            setInventario([]);
            setColaPendientes([]);
            showToast("Sesión cerrada");
        } catch { showToast("Error al cerrar sesión"); }
    };

    return (
        <AppContext.Provider
            value={{
                inventario,
                movimientos,
                colaPendientes,
                cargando,
                user,
                cargandoUsuario,
                cargandoInventario,
                online,
                modoManualOffline,
                setUserOnlineMode,
                addProducto,
                editProducto,
                deleteProducto,
                cerrarSesion,
                showToast,
            }}
        >
            {children}
            <ToastComponent />
        </AppContext.Provider>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "rgba(0,0,0,0.8)",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 999,
    },
    toastText: {
        color: "#fff",
        fontSize: 15,
    },
});

export default AppContext;
