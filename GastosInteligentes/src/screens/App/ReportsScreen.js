// screens/ReportsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PieChart } from "react-native-chart-kit";
import { useTransactions } from "../../hooks/useTransactions";
import { useMonthlyReport } from "../../hooks/useMonthlyReport";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
};

export default function ReportsScreen() {
  const { filtered, loading, loadTransactions } = useTransactions();
  const { selectedMonth, setSelectedMonth, totals, pieData } = useMonthlyReport(filtered);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChangeMonth = (_e, date) => {
    setShowPicker(false);
    if (date) setSelectedMonth(date);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.muted}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes del mes</Text>

      <Button title="Cambiar mes" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={selectedMonth}
          mode="date"
          display="calendar"
          onChange={handleChangeMonth}
        />
      )}

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingresos</Text>
          <Text style={styles.amount}>${totals.income.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gastos</Text>
          <Text style={styles.amount}>${totals.expense.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={[styles.amount, totals.balance >= 0 ? styles.ok : styles.bad]}>
            {(totals.balance >= 0 ? "+" : "")}${totals.balance.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>
        Ingresos vs Gastos ({selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })})
      </Text>

      {pieData.length === 0 ? (
        <Text style={styles.muted}>No hay datos para este mes.</Text>
      ) : (
        <PieChart
          data={pieData}
          width={screenWidth - 16}
          height={240}
          accessor="population"
          backgroundColor="transparent"
          chartConfig={chartConfig}
          paddingLeft="8"
          absolute
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  section: { marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: "600", textAlign: "center" },
  muted: { color: "#666", textAlign: "center", marginTop: 16 },
  cards: { flexDirection: "row", gap: 8, marginVertical: 16 },
  card: { flex: 1, backgroundColor: "#f2f2f2", padding: 12, borderRadius: 12 },
  cardTitle: { color: "#555", marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: "700" },
  ok: { color: "green" },
  bad: { color: "crimson" },
});
