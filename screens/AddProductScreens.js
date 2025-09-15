import React, { useState } from "react";
import { View, TextInput, Button, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function AddProductScreens({ navigation }) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [quantity, setQuantity] = useState("");
    const [image, setImage] = useState(null);

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

    function handleSave() {
        if (!name || !code || !quantity || !image) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        console.log("Producto guardado ", { name, code, quantity, image });
        Alert.alert("Exito", "Producto guardado");

        setName("");
        setCode("");
        setQuantity("");
        setImage(null);

        navigation.navigate("Home");
    }

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Nombre del producto"
                value={name}
                onChangeText={setName}
                style={{ marginBottom: 15, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
            />
            <TextInput
                placeholder="Código"
                value={code}
                onChangeText={setCode}
                style={{ marginBottom: 15, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
            />
            <TextInput
                placeholder="Cantidad"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={{ marginBottom: 15, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
            />

            <Button title="Seleccionar Imagen" onPress={pickImage} />

            {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, marginVertical: 10 }} />}

            <Button title="Guardar Producto" onPress={handleSave} />
        </View>
    );
}