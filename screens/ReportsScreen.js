import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPendingMovements } from "../services/offline";

export default function ReportsScreen() {
    const [movements, setMovements] = useState([]);
    const [dateFilter, setDateFilter] = useState("");
    const [filtered, setFiltered] = useState([]);


    useFocusEffect(
        useCallback(() => {
            const fetchMovements = async () => {
                const stored = await getPendingMovements();

                //ordena los movimientos del mas reciente al mas antiguo
                const sorted = (stored || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setMovements(sorted);
                setFiltered(sorted);
            };

            fetchMovements();
            setDateFilter("");

            return () => { };
        }, [])
    );

    const filterByDate = () => {
        if (!dateFilter) {
            setFiltered(movements);
            return;
        }

        const filteredList = movements.filter((m) => {
            const moveDate = new Date(m.date).toISOString().split("T")[0];
            return moveDate === dateFilter;
        });

        setFiltered(filteredList);
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>📊 Reporte de Movimientos</Text>

            <Text style={{ marginBottom: 5 }}>Filtrar por fecha (YYYY-MM-DD):</Text>
            <TextInput
                placeholder="Ej: 2025-10-16"
                value={dateFilter}
                onChangeText={setDateFilter}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 10,
                }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 }}>
                <Button title="Filtrar" onPress={filterByDate} />
                <Button title="Limpiar Filtro" onPress={() => {
                    setDateFilter("");
                    setFiltered(movements);
                }} color="#888" />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderColor: "#ddd",
                        }}
                    >
                        <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                        <Text>
                            Tipo: {item.type === "entrada" ? "Entrada ➕" : "Salida ➖"}
                        </Text>
                        <Text>Cantidad: {item.quantity}</Text>
                        <Text>Fecha: {new Date(item.date).toLocaleString()}</Text>
                        <Text>
                            Estado: {item.synced ? "Sincronizado ✅" : "Pendiente ⏳"}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, textAlign: "center" }}>
                        No hay movimientos para mostrar o que coincidan con el filtro.
                    </Text>
                }
            />
        </View>
    );
}