import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import NetInfo from "@react-native-community/netinfo";

import { useProducts } from "../contexts/ProductsContext";

import {
    addPendingMovement,
    getPendingMovements,
    savePendingMovements,
    clearPendingMovements,
} from "../services/offline";


export default function MovementScreen() {
    const [productName, setProductName] = useState("");
    const [type, setType] = useState("entrada");
    const [quantity, setQuantity] = useState("");
    const { products, updateProductQuantity } = useProducts();
    const [isConnected, setIsConnected] = useState(true);
    const [syncing, setSyncing] = useState(false);


    useEffect(() => {

        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected = !!state.isConnected;
            setIsConnected(connected);
            if (connected) {
                doSyncPending();
            }
        })

        return () => {
            unsubscribe();
        };
    }, []);


    async function doSyncPending() {
        setSyncing(true);
        try {
            const pending = await getPendingMovements();
            if (pending.length === 0) {
                setSyncing(false);
                return;
            }

            await clearPendingMovements();

            Alert.alert("Sincronización", "Movimientos pendientes sincronizados correctamente.");
        } catch (e) {
            console.error("doSyncPending error", e);
        } finally {
            setSyncing(false);
        }
    }


    const handleRegisterMovement = async () => {
        if (!productName || !quantity) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        const q = parseInt(quantity, 10);
        if (isNaN(q) || q <= 0) {
            Alert.alert("Error", "La cantidad debe ser un número entero positivo");
            return;
        }

        const productToUpdate = products.find(p =>
            p.name.toLowerCase() === productName.toLowerCase()
        );

        if (!productToUpdate) {
            Alert.alert("Error", "Producto no encontrado. Revisa el nombre.");
            return;
        }

        const currentQuantity = Number(productToUpdate.quantity);
        let newQuantity;

        if (type === "entrada") {
            newQuantity = currentQuantity + q;
        } else {
            if (currentQuantity < q) {
                Alert.alert("Error", `Cantidad insuficiente. Stock actual de ${productToUpdate.name}: ${currentQuantity}`);
                return;
            }
            newQuantity = currentQuantity - q;
        }

        try {

            await updateProductQuantity(productToUpdate.id, newQuantity);

            const newMovement = {
                id: Date.now().toString(),
                productId: productToUpdate.id,
                productName: productToUpdate.name,
                type,
                quantity: q,
                date: new Date().toISOString(),
                synced: isConnected,
            };

            if (isConnected) {
                await addPendingMovement(newMovement);
                await doSyncPending();
            } else {
                await addPendingMovement({ ...newMovement, synced: false });
                Alert.alert("Offline", "Movimiento guardado localmente y se sincronizará cuando vuelvas a tener conexión.");
            }

            Alert.alert("Éxito", `Movimiento de ${q} unidades de ${productToUpdate.name} registrado.`);

            setProductName("");
            setQuantity("");
            setType("entrada");


        } catch (error) {
            console.error("Error registrando movimiento:", error);
            Alert.alert("Error", "No se pudo registrar el movimiento de stock.");
        }
    };



    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 15 }}>Registrar Movimiento</Text>

            <Text>Producto (escribe el nombre):</Text>
            <TextInput
                placeholder="Nombre del producto"
                value={productName}
                onChangeText={setProductName}
                style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
            />

            <Text>Tipo de movimiento:</Text>
            <Picker selectedValue={type} onValueChange={(v) => setType(v)} style={{ marginBottom: 15 }}>
                <Picker.Item label="Entrada (Aumentar stock)" value="entrada" />
                <Picker.Item label="Salida (Disminuir stock)" value="salida" />
            </Picker>

            <TextInput
                placeholder="Cantidad"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
            />

            <Button title="Registrar Movimiento" onPress={handleRegisterMovement} />

            <View style={{ height: 12 }} />
            <Text>Estado de conexión: {isConnected ? "Conectado" : "Sin conexión (offline)"}</Text>
            {syncing && <Text>Sincronizando pendientes...</Text>}
        </View>
    );
}