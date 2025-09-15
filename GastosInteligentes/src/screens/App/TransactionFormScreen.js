import React, { useState } from "react";
import { View, Text, TextInput, Button, Pressable, Platform } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Chip from "../../components/Chip";
import { useTransactionForm } from "../../hooks/useTransactionForm";


const toYMD = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const TransactionFormScreen = ({ route, navigation }) => {
  const item = route.params?.item;

  const {
    editing,
    type, setType,
    amount, setAmount,
    description, setDescription,
    paymentMethod, setPaymentMethod,
    transactionDate, setTransactionDate,
    category, setCategory,
    categoryOptions,
    paymentMethods,
    onSubmit,
    loading,
  } = useTransactionForm(item, navigation);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setTransactionDate(date);
    hideDatePicker();
  };

  const descriptionPlaceholder =
    type === "income" ? "Ej: salario, freelance" : "Ej: almuerzo, mercado";
  const categoryLabel = type === "income" ? "Categoría de ingreso" : "Categoría de gasto";

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Tipo */}
      <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Gasto/Ingreso (tipo)</Text>
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <Chip label="Gasto" active={type === "expense"} onPress={() => setType("expense")} />
        <Chip label="Ingreso" active={type === "income"} onPress={() => setType("income")} />
      </View>

      {/* Categoría */}
      <Text style={{ fontWeight: "bold" }}>{categoryLabel}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {categoryOptions.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      {/* Monto */}
      <Text style={{ fontWeight: "bold" }}>Monto</Text>
      <TextInput
        placeholder="0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
          padding: 10,
          marginBottom: 12,
        }}
      />

      {/* Descripcion */}
      <Text style={{ fontWeight: "bold" }}>Descripción</Text>
      <TextInput
        placeholder={descriptionPlaceholder}
        value={description}
        onChangeText={setDescription}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
          padding: 10,
          marginBottom: 12,
        }}
      />

      {/* Método de pago */}
      <Text style={{ fontWeight: "bold" }}>Método de pago</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {paymentMethods.map((m) => (
          <Chip key={m} label={m} active={paymentMethod === m} onPress={() => setPaymentMethod(m)} />
        ))}
      </View>

      {/* Fecha */}
      <Text style={{ fontWeight: "bold" }}>Fecha de transacción</Text>
      <Pressable
        onPress={showDatePicker}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Text>{toYMD(transactionDate)}</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={transactionDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        display={Platform.OS === "android" ? "calendar" : "spinner"}
      />

      <Button
        title={loading ? "Guardando..." : (editing ? "Guardar cambios" : "Crear transacción")}
        onPress={onSubmit}
        disabled={loading}
      />

    </View>
  );
};

export default TransactionFormScreen;
