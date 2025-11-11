import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { addGoal, updateGoal, deleteGoal, getGoalsByUser } from "../services/goalService";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshGoals = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getGoalsByUser(user.uid);
    setGoals(data);
    setLoading(false);
  };

  const handleAddGoal = async (goal) => {
    try {
      await addGoal(user.uid, goal);
      refreshGoals();
    } catch {
      Alert.alert("Error", "No se pudo guardar la meta");
    }
  };

  const handleUpdateGoal = async (id, data) => {
    try {
      await updateGoal(id, data);
      refreshGoals();
    } catch {
      Alert.alert("Error", "No se pudo actualizar la meta");
    }
  };

  const handleDeleteGoal = async (id) => {
    Alert.alert("Eliminar meta", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteGoal(id);
          refreshGoals();
        },
      },
    ]);
  };

  useEffect(() => {
    refreshGoals();
  }, [user]);

  return { goals, loading, handleAddGoal, handleUpdateGoal, handleDeleteGoal, refreshGoals };
};
