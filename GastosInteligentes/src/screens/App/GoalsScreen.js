import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from "react-native";
import { useGoals } from "../../hooks/useGoals";
import { useFocusEffect } from "@react-navigation/native";
import { updateGoal } from "../../services/goalService";

const GoalsScreen = () => {
    const { goals, loading, handleAddGoal, handleDeleteGoal, refreshGoals } = useGoals();
    const [name, setName] = useState("");
    const [target, setTarget] = useState("");

    const activeGoal = goals?.[0];

    useFocusEffect(
        useCallback(() => {
            refreshGoals();
        }, [])
    );

    useEffect(() => {
        if (activeGoal) {
            setName(activeGoal.name);
            setTarget(String(activeGoal.target));
        } else {
            setName("");
            setTarget("");
        }
    }, [activeGoal]);

    const addGoal = async () => {
        if (!name || !target) {
            Alert.alert("Campos incompletos", "Por favor completa todos los campos");
            return;
        }

        try {
            if (activeGoal) {
                // Editar meta activa
                await updateGoal(activeGoal.id, {
                    name,
                    target: Number(target),
                });
            } else {
                // Crear nueva meta
                await handleAddGoal({
                    name,
                    target: Number(target),
                    progress: 0,
                    reached: false,
                });
            }
            setName("");
            setTarget("");
            refreshGoals();
        } catch (error) {
            console.error("Error al guardar meta:", error);
            Alert.alert("Error", "No se pudo guardar la meta.");
        }
    };

    const deleteGoalHandler = async (id) => {
        Alert.alert("Eliminar meta", "¿Seguro que deseas eliminar esta meta?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => handleDeleteGoal(id) },
        ]);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Cargando metas...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16 }}>
            {activeGoal && (
                <View
                    style={{
                        backgroundColor: activeGoal.reached ? "#d4edda" : "#e8f2ff",
                        padding: 20,
                        borderRadius: 10,
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
                        🎯 Meta Activa
                    </Text>
                    <Text style={{ fontSize: 16 }}>Progreso: ${activeGoal.progress ?? 0}</Text>
                    {activeGoal.reached && (
                        <Text style={{ color: "green", marginBottom: 10 }}>
                            ✅ ¡Meta alcanzada!
                        </Text>
                    )}
                    <Button
                        title="Eliminar meta"
                        color="red"
                        onPress={() => deleteGoalHandler(activeGoal.id)}
                    />
                </View>
            )}

            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
                {activeGoal ? "Editar meta" : "Crear nueva meta de ahorro"}
            </Text>

            <TextInput
                placeholder="Nombre de la meta"
                value={name}
                onChangeText={setName}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 8,
                    borderRadius: 6,
                }}
            />

            <TextInput
                placeholder="Monto objetivo"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 12,
                    borderRadius: 6,
                }}
            />

            <Button
                title={activeGoal ? "Guardar cambios" : "Guardar meta"}
                onPress={addGoal}
            />
        </View>
    );
};

export default GoalsScreen;
