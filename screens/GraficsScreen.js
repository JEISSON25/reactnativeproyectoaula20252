import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import { db } from "../firebaseConfig";

const GraficsScreen = () => {
  const { user } = useAuth();
  const { isAppOnline } = useOffline();
  const [chartData, setChartData] = useState({ daily: [], detailed: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // hecho por camilo pa mostrar graficas de progreso, tanto online como offline, lo que hice fue utilizar sobre todo chart kit qeu es una libreria de react para la grafica
  useEffect(() => {
    loadProgressData();
  }, [user, isAppOnline]);

  //funcion para convertir fechas que vienen raras como en string
  const parseDate = (raw) => {
    if (!raw) return null;
    if (raw?.toDate) return raw.toDate();
     const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
  };

  //cargar los datos del progreso, como de firebase y local
  const loadProgressData = async () => {
     setLoading(true);
    try {
      console.log("cargando datos del progreso");
      let allProgress = [];

      if (isAppOnline && user) {
        console.log("trayendo datos desde firebase...");
         const q = query(collection(db, "progress"), where("userId", "==", user.uid));
         const snap = await getDocs(q);

        allProgress = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } else {
        //si no hay internet se usan los datos guardados localment
        console.log("sin conexion, usando datos guardados localmente");

         const keys = await AsyncStorage.getAllKeys();
        
         const summaries = keys.filter((k) => k.endsWith("_summary"));

        for (const key of summaries) {const item = await AsyncStorage.getItem(key);
          if (item) {
            try {
              allProgress.push(JSON.parse(item));
            } catch (err) {
              console.log("error leyendo progreso local:", err);
            }
          }
        }
      }

      allProgress = allProgress.filter((p) => p.status === "completed");

      if (allProgress.length === 0) {
        console.log("no hay rutinas completadas todavia");
        setChartData({ daily: [], detailed: [] });
        return;
      }

      const detailedList = [];

      for (const entry of allProgress) {
        let calories = entry.CaloriasTotales ?? 0;
        let name = entry.routineName || entry.name || "rutina";
        let completedAt = parseDate(entry.completedAt);

        if ((calories === 0 || name === "rutina") && entry.routineId && isAppOnline) {
          try {
            const ref = doc(db, "routines", entry.routineId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              calories = data.CaloriasTotales ?? calories;
              name = data.name || name;
            }
          } catch (err) {
            console.log("error al traer rutina de firebase:", err);
          }
        }
// como su nombre lo dice es para hacer push a la lista que aparece abajo en la app 
        detailedList.push({
          id: entry.id || Math.random().toString(36),
          name,
          calories: Math.round(calories),
          completedAt,
        });
      }

      // Ordenar por fecha, mas recientes primero
      detailedList.sort((a, b) => b.completedAt - a.completedAt);
      const lastThree = detailedList.slice(0, 3);
      const daily = lastThree.map((d, i) => ({ index: i + 1, calories: d.calories }));// estas partes las  busque para que funcione, igual en los dos graficos qeu  puse

      console.log("datos cargados correctamente, mostrando graficas...");
      setChartData({ daily, detailed: lastThree });
    } catch (e) {
      console.log("error cargando datos de graficas:", e);
      setChartData({ daily: [], detailed: [] });
    } finally {
        setLoading(false);
    }
  };

   //indicador de carga
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF6B00" />
        <Text style={styles.text}>cargando datos..</Text>
      </View>
    );
  }

  //si no hay datos
  if (!chartData.daily.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.textSmall}>no hay rutinas completadas todavia</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width - 40;
  const data = chartData.daily.map((d) => d.calories);
  const labels = chartData.detailed.map((d, i) =>
    d.name.length > 10 ? `${d.name.slice(0, 8)}…` : d.name
  );
  const totalCalories = data.reduce((s, v) => s + v, 0);
  const avgCalories = data.length ? Math.round(totalCalories / data.length) : 0;

  const renderItem = ({ item }) => {
    const date = item.completedAt ? item.completedAt.toLocaleDateString() : "--";
    return (
      <Pressable style={styles.item} onPress={() => setSelectedItem(item)}>
        <Text style={styles.text}>{item.name}</Text>
        <Text style={styles.textSmall}>{date}</Text>
        <Text style={styles.textSmall}>{item.calories} kcal</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>estadisticas</Text>

      <View style={styles.row}>
        <Text style={styles.textSmall}>total: {totalCalories} kcal</Text>
        <Text style={styles.textSmall}>promedio: {avgCalories} kcal</Text>
        <Text style={styles.textSmall}>rutinas: {data.length}</Text>
      </View>

      <BarChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth}
        height={200}
        fromZero
        chartConfig={{
          backgroundGradientFrom: "#121212",
          backgroundGradientTo: "#121212",
          color: () => "#FF6B00",
          labelColor: () => "#fff",
          decimalPlaces: 0,
        }}
        style={styles.chart}
      />

      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth}
        height={180}
        fromZero
        chartConfig={{
          backgroundGradientFrom: "#121212",
          backgroundGradientTo: "#121212",
          color: () => "#34C759",
          labelColor: () => "#fff",
          decimalPlaces: 0,
        }}
        bezier
        style={styles.chart}
      />

      <Text style={styles.subtitle}>ultimas rutinas</Text>

      <FlatList data={chartData.detailed} renderItem={renderItem} keyExtractor={(i) => i.id} />

      <Modal visible={!!selectedItem} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.text}>{selectedItem?.name}</Text>
            <Text style={styles.textSmall}>
              calorias: {selectedItem?.calories} kcal
            </Text>
            <Text style={styles.textSmall}>
              fecha:{" "}
              {selectedItem?.completedAt
                ? selectedItem.completedAt.toLocaleString()
                : "--"}
            </Text>
            <Pressable style={styles.button} onPress={() => setSelectedItem(null)}>
              <Text style={styles.buttonText}>cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// att andrey: reviso que las graficas quedaran suaves y centradas bien en todas las pantallas
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#FF6B00", fontSize: 20, textAlign: "center", marginBottom: 10 },
  subtitle: { color: "#fff", fontSize: 16, marginTop: 10, marginBottom: 4 },
  text: { color: "#fff" },
  textSmall: { color: "#ccc", fontSize: 12, marginVertical: 2 },
  row: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  chart: { marginVertical: 10 },
  item: { marginVertical: 6, padding: 8, backgroundColor: "#1a1a1a" },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#1a1a1a", padding: 16, width: "80%", alignItems: "center" },
  button: { backgroundColor: "#FF6B00", padding: 8, marginTop: 10, alignItems: "center", width: "60%" },
  buttonText: { color: "#fff" },
});

export default GraficsScreen;
