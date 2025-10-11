import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Picker } from "react-native";
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function MovementScreen() {
    const [productName, setProductName] = useState("");
    const [type, setType] = useState("entrada");
    const [quantity, setQuantity] = useState("");

    const handleRegisterMovement = async () => {
        if (!productName || !quantity) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        try {
            const q = query(collection(db, "products"), where("name", "==", productName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Alert.alert("Error", "No se encontró el producto");
                return;
            }

            const productDoc = querySnapshot.docs[0];
            const productData = productDoc.data();
            let newQuantity = parseInt(productData.quantity);

            if (type === "entrada") {
                newQuantity += parseInt(quantity);
            } else if (type === "salida") {
                if (newQuantity < quantity) {
                    Alert.alert("Error", "Cantidad insuficiente en inventario");
                    return;
                }
                newQuantity -= parseInt(quantity);
            }

            const productRef = doc(db, "products", productDoc.id);
            await updateDoc(productRef, { quantity: newQuantity });



            await addDoc(collection(db, "movements"), {
                productName,
                type,
                quantity: parseInt(quantity),
                date: Timestamp.now(),
            });

            Alert.alert("Éxito", "Movimiento registrado y stock actualizado");
            setProductName("");
            setQuantity("");
            setType("entrada");

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo registrar el movimiento");
        }
    };



    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 15 }}>Registrar Movimiento</Text>

            <TextInput
                placeholder="Nombre del producto"
                value={productName}
                onChangeText={setProductName}
                style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
            />

            <Text>Tipo de movimiento:</Text>
            <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                style={{ marginBottom: 15 }}
            >
                <Picker.Item label="Entrada" value="entrada" />
                <Picker.Item label="Salida" value="salida" />
            </Picker>

            <TextInput
                placeholder="Cantidad"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
            />

            <Button title="Registrar Movimiento" onPress={handleRegisterMovement} />
        </View>
    );
}
