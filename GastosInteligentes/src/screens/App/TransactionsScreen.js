import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Button, Pressable } from "react-native";
import {useAuth} from '../../context/AuthContext'
import { getTransactionByUser, deleteTransaction } from "../../services/transactionService";
import { Alert } from "react-native";

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;
      const data = await getTransactionByUser(user.uid);
      setTransactions(data);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTransactions);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar transacción", "Estas seguro de que quieres eliminar esta transaccion? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteTransaction(id);
              loadTransactions();
            } catch (error) {
              console.error("Error al eliminar:", error);
            }
          }
        }
      ]
    )
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
        flex:1,
        marginTop: 30,
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
        <Button
          title="Eliminar"
          color="red"
          onPress={() => handleDelete(item.id)}
        />
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
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={transactions.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }}
        ListEmptyComponent={
            <Text> No tienes transacciones aún.</Text>
        }
      />
    </View>
  );
};

export default TransactionsScreen;
