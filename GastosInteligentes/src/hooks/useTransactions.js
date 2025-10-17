import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTransactionByUser, deleteTransaction } from "../services/transactionService";

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;
      const data = await getTransactionByUser(user.uid);
      setTransactions(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...transactions];

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (startDate) {
      result = result.filter(
        (t) =>
          new Date(t.transactionDate?.seconds * 1000 || t.transactionDate) >=
          startDate
      );
    }

    if (endDate) {
      result = result.filter(
        (t) =>
          new Date(t.transactionDate?.seconds * 1000 || t.transactionDate) <=
          endDate
      );
    }

    setFiltered(result);
  }, [typeFilter, startDate, endDate, transactions]);

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await loadTransactions();
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setStartDate(null);
    setEndDate(null);
  };

  return {
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
  };
};
