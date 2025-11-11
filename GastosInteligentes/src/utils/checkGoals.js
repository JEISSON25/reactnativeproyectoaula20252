import * as Notifications from "expo-notifications";
import { updateGoal } from "../services/goalService";

/**
 * Calcula el progreso de las metas basado en los ingresos posteriores a la creación de cada meta.
 * @param {Object|Array} transactions - Transacción única o array de transacciones
 * @param {Array} goals - Array de metas del usuario
 */
export const checkGoalsProgress = async (transactions, goals) => {
  if (!transactions) return;
  if (!Array.isArray(transactions)) transactions = [transactions];

//Eliminar posibles valores undefined/null
  transactions = transactions.filter(Boolean);

  for (const goal of goals) {
    if (goal.deleted) continue; 

    const relevantTransactions = transactions.filter(t => {
      if (!t || t.type !== "income") return false;

      const tDate = t.createdAt?.seconds
        ? new Date(t.createdAt.seconds * 1000)
        : t.createdAt
        ? new Date(t.createdAt)
        : new Date(); 

      const goalDate = goal.createdAt?.seconds
        ? new Date(goal.createdAt.seconds * 1000)
        : goal.createdAt
        ? new Date(goal.createdAt)
        : new Date(0); 

      return tDate.getTime() >= goalDate.getTime();
    });

    //Sumar todos los montos
    const progress = relevantTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const reached = progress >= goal.target;

//Solo actualizar si cambio el progreso o si se alcanzo la meta
    if (progress !== goal.progress || reached !== goal.reached) {
      await updateGoal(goal.id, { progress, reached });

//notificaciones si se alcanza la meta
      if (reached && !goal.reached) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "¡Meta alcanzada!",
            body: `Has alcanzado tu meta de ahorro: ${goal.name}`,
          },
          trigger: null,
        });
      }
    }
  }
};
