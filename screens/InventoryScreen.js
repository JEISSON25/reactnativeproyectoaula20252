import React, { useState } from "react";
import { View, Text, FlatList, TextInput, Image } from "react-native";

export default function InventoryScreen() {
    const [search, setSearch] = useState("");

    // Datos de ejemplo locales en lugar de Firestore
    const [products] = useState([
        {
            id: "1",
            name: "Producto Ejemplo",
            code: "100",
            quantity: "10",
            imageUrl: "https://placehold.co/50x50"
        },
        {
            id: "2",
            name: "Otro Producto",
            code: "101",
            quantity: "5",
            imageUrl: "https://placehold.co/50x50"
        },
        {
            id: "3",
            name: "Otro Producto",
            code: "102",
            quantity: "12",
            imageUrl: "https://placehold.co/50x50"
        },
        {
            id: "4",
            name: "Otro Producto",
            code: "103",
            quantity: "1",
            imageUrl: "https://placehold.co/50x50"
        },
        {
            id: "5",
            name: "Otro Producto",
            code: "104",
            quantity: "8",
            imageUrl: "https://placehold.co/50x50"
        },
        {
            id: "6",
            name: "Otro Producto",
            code: "105",
            quantity: "20",
            imageUrl: "https://placehold.co/50x50"
        }
    ]);

    const filteredProducts = products.filter((product) => {
        return (
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.code.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <TextInput
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
                style={{ marginBottom: 15, padding: 8, borderWidth: 1 }}
            />

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 15, paddingBottom: 10 }}>
                        {item.imageUrl && (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={{ width: 50, height: 50, marginBottom: 5 }}
                            />
                        )}
                        <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                        <Text>Código: {item.code}</Text>
                        <Text>Cantidad: {item.quantity}</Text>
                    </View>
                )}
            />
        </View>
    );
}