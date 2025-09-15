import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { addTransaction, updateTransaction } from "../services/transactionService";

const paymentMethods = ["efectivo", "tarjeta", "transferencia"];

const CATEGORIES = {
  expense: [
    "Alimentación","Transporte","Ocio","Salud","Vivienda",
    "Servicios","Educación","Deudas","Impuestos","Otros"
  ],
  income: [
    "Salario","Ventas","Intereses",
    "Inversiones","Regalos","Reembolsos","Otros"
  ],
};

export const useTransactionForm = (item, navigation) => {
  const editing = Boolean(item);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [type, setType] = useState(item?.type ?? "expense");
  const [amount, setAmount] = useState(String(item?.amount ?? ""));
  const [description, setDescription] = useState(item?.description ?? "");
  const [paymentMethod, setPaymentMethod] = useState(item?.paymentMethod ?? paymentMethods[0]);

  const initialDate = item?.transactionDate?.toDate
    ? item.transactionDate.toDate()
    : (item?.transactionDate ? new Date(item.transactionDate) : new Date());
  const [transactionDate, setTransactionDate] = useState(initialDate);

  const categoryOptions = CATEGORIES[type];
  const [category, setCategory] = useState(
    item?.category && CATEGORIES[item?.type ?? "expense"].includes(item.category)
      ? item.category
      : categoryOptions[0]
  );

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
    }
  }, [type]);

  const onSubmit = async () => {
    if (loading) return;
    if (!amount || isNaN(Number(amount))) {
      return Alert.alert("Datos incompletos", "Ingresa un monto numérico válido.");
    }
    if (!transactionDate || isNaN(transactionDate.getTime())) {
      return Alert.alert("Datos incompletos", "Selecciona una fecha válida.");
    }

    
    const payload = {
      type,
      category,
      amount: Number(amount),
      description,
      paymentMethod,
      transactionDate,
    };

    try {
      setLoading(true);
      if (editing) {
        await updateTransaction(item.id, payload);
      } else {
        await addTransaction(user?.uid, payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la transacción");
      console.log("Error en onSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
