// hooks/useMonthlyReport.js
import { useMemo, useState } from "react";

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

const toNumber = (val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/\./g, "").replace(",", ".");
    const n = Number(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

const getTxDate = (tx) => {
  const raw = tx?.transactionDate ?? tx?.date ?? tx?.createdAt ?? null;
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

export const useMonthlyReport = (transactions = []) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthTransactions = useMemo(() => {
    const from = startOfMonth(selectedMonth);
    const to = endOfMonth(selectedMonth);
    return transactions.filter((tx) => {
      const d = getTxDate(tx);
      return d && d >= from && d <= to;
    });
  }, [transactions, selectedMonth]);

  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + toNumber(b.amount), 0);
    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + toNumber(b.amount), 0);
    return { income, expense, balance: income - expense };
  }, [monthTransactions]);

  const pieData = useMemo(() => {
    const data = [
      { name: "Ingresos", value: totals.income, color: "#4CAF50" },
      { name: "Gastos", value: totals.expense, color: "#E53935" },
    ].filter((d) => d.value > 0);

    return data.map((d) => ({
      ...d,
      population: d.value,
      legendFontColor: "#333",
      legendFontSize: 13,
    }));
  }, [totals]);

  return { selectedMonth, setSelectedMonth, monthTransactions, totals, pieData };
};
