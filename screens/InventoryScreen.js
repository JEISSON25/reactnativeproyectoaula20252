import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, Image, ActivityIndicator } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function InventoryScreen() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsList);
            setLoading(false);
        });


        return () => unsubscribe();
    }, []);




    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Cargando inventario...</Text>
            </View>
        );
    }


    return (
        <View style={{ flex: 1, padding: 20 }}>
            <TextInput
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
                style={{ marginBottom: 15, padding: 8, borderWidth: 1 }}
            />

            {filteredProducts.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                    No hay productos para mostrar
                </Text>
            ) : (
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
            )}
        </View>
    );
}
