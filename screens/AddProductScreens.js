import React, { useState } from "react";
import { View, TextInput, Button, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useProducts } from "../contexts/ProductsContext";

export default function AddProductScreens({ navigation }) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [quantity, setQuantity] = useState("");
    const [image, setImage] = useState(null);
    const { addProduct } = useProducts();

    async function pickImage() {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo seleccionar la imagen");
        }
    }



    async function handleSave() {
        if (!name || !code || !quantity) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        const quantityInt = parseInt(quantity, 10);
        if (isNaN(quantityInt) || quantityInt < 0) {
            Alert.alert("Error", "La cantidad debe ser un número válido (cero o más).");
            return;
        }

        try {

            const newProduct = {
                id: Date.now().toString(),
                name,
                code,
                quantity: quantityInt,
                imageUrl: image || "https://placehold.co/50x50",
            };

            await addProduct(newProduct);

            Alert.alert("Éxito", "Producto guardado correctamente");

            setName("");
            setCode("");
            setQuantity("");
            setImage(null);
            navigation.navigate("Home");

        } catch (error) {
            console.error("Error guardando producto:", error);
            Alert.alert("Error", "No se pudo guardar el producto");
        }
    }

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Nombre del producto"
                value={name}
                onChangeText={setName}
                style={{
                    marginBottom: 15,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            />
            <TextInput
                placeholder="Código"
                value={code}
                onChangeText={setCode}
                style={{
                    marginBottom: 15,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            />
            <TextInput
                placeholder="Cantidad (stock inicial)"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={{
                    marginBottom: 15,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            />

            <Button title="Seleccionar Imagen" onPress={pickImage} />

            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: 100, height: 100, marginVertical: 10 }}
                />
            )}

            <View style={{ marginTop: 20 }}>
                <Button title="Guardar Producto" onPress={handleSave} />
            </View>
        </View>
    );
}