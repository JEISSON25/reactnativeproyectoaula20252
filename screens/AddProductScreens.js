import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Image,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useProducts } from "../contexts/ProductsContext";

export default function AddProductScreen({ navigation }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);

    const { addProduct } = useProducts();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSaveProduct = () => {
        if (!name || !description || !price || !image) {
            Alert.alert("Error", "Completa todos los campos y selecciona una foto");
            return;
        }

        const newProduct = {
            id: Date.now().toString(),
            name,
            description,
            price,
            image,
        };

        addProduct(newProduct);
        Alert.alert("Éxito", "Producto agregado ✅");
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agregar Producto</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
            />

            <TextInput
                style={styles.input}
                placeholder="Precio"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />

            <Button title="Seleccionar Foto" onPress={pickImage} />
            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: 200, height: 200, marginVertical: 10 }}
                />
            )}

            <Button title="Guardar Producto" onPress={handleSaveProduct} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
});