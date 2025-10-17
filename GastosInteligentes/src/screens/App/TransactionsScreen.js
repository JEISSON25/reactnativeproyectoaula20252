import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Button, Pressable, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTransactions } from "../../hooks/useTransactions";

const TransactionsScreen = ({ navigation }) => {
  const {
    loading,
    filtered,
    loadTransactions,
    handleDelete,
    typeFilter,
    setTypeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters,
  } = useTransactions();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTransactions);
    return unsubscribe;
  }, [navigation]);

  const confirmDelete = (id) => {
    Alert.alert(
      "Eliminar transacción",
      "¿Estás seguro de eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => handleDelete(id),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("TransactionForm", { item })}
      style={{
        padding: 16,
        marginHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#d3d5d6ff",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        marginTop: 20,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>
        {item.type === "expense" ? "💸 Gasto" : "💰 Ingreso"} - {item.category}
      </Text>
      <Text>Monto: ${item.amount}</Text>
      <Text>Método: {item.paymentMethod}</Text>
      <Text>{item.description}</Text>
      <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
        <Button
          title="Editar"
          onPress={() => navigation.navigate("TransactionForm", { item })}
        />
        <Button title="Eliminar" color="red" onPress={() => confirmDelete(item.id)} />
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 12 }}>
      {/* Filtros */}
      <View
        style={{
          padding: 12,
          marginHorizontal: 12,
          marginBottom: 10,
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Filtrar por:</Text>

        {/* Tipo */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 8 }}>
          <Button
            title="Todos"
            onPress={() => setTypeFilter("all")}
            color={typeFilter === "all" ? "#007AFF" : "#999"}
          />
          <Button
            title="Gastos"
            onPress={() => setTypeFilter("expense")}
            color={typeFilter === "expense" ? "#007AFF" : "#999"}
          />
          <Button
            title="Ingresos"
            onPress={() => setTypeFilter("income")}
            color={typeFilter === "income" ? "#007AFF" : "#999"}
          />
        </View>

        {/* Fechas */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Button
              title={startDate ? `Desde: ${startDate.toLocaleDateString()}` : "Desde"}
              onPress={() => setShowStartPicker(true)}
            />
            <DateTimePickerModal
              isVisible={showStartPicker}
              mode="date"
              date={startDate || new Date()}
              onConfirm={(date) => {
                setStartDate(date);
                setShowStartPicker(false);
              }}
              onCancel={() => setShowStartPicker(false)}
            />
          </View>

          <View>
            <Button
              title={endDate ? `Hasta: ${endDate.toLocaleDateString()}` : "Hasta"}
              onPress={() => setShowEndPicker(true)}
            />
            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="date"
              date={endDate || new Date()}
              onConfirm={(date) => {
                setEndDate(date);
                setShowEndPicker(false);
              }}
              onCancel={() => setShowEndPicker(false)}
            />
          </View>
        </View>

        {(startDate || endDate || typeFilter !== "all") && (
          <View style={{ marginTop: 10 }}>
            <Button title="Limpiar filtros" color="#ff3b30" onPress={resetFilters} />
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0 && { flex: 1, justifyContent: "center", alignItems: "center" }
        }
        ListEmptyComponent={<Text>No hay transacciones con los filtros aplicados.</Text>}
      />
    </View>
  );
};

export default TransactionsScreen;