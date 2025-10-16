import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ConsultarObservaciones() {
  const [user, setUser] = useState(null);
  const [observaciones, setObservaciones] = useState([]);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [modo, setModo] = useState("inicio");

  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [ciudad, setCiudad] = useState(""); // 👈 nuevo filtro

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
    });
    return unsubscribe;
  }, []);

  const cargarObservaciones = async (uid, inicio, fin, city) => {
  try {
    const condiciones = [where("uid", "==", uid)];

    if (inicio && fin) {
      condiciones.push(where("fecha", ">=", inicio));
      condiciones.push(where("fecha", "<=", fin));
    }
    if (city && city.trim() !== "") {
      condiciones.push(where("ubicacion", "==", city.trim()));
    }

    // 🔹 1️⃣ Consulta a "observaciones"
    const q1 = query(collection(db, "observaciones"), ...condiciones);
    const snapshot1 = await getDocs(q1);
    const data1 = snapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      origen: "observaciones",
    }));

    // 🔹 2️⃣ Consulta a "historicalWeather"
    const q2 = query(collection(db, "historicalWeather"), ...condiciones);
    const snapshot2 = await getDocs(q2);
    const data2 = snapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      origen: "historicalWeather",
    }));

    // 🔹 3️⃣ Unir y ordenar por fecha (más recientes primero)
    const todas = [...data1, ...data2].sort(
      (a, b) => b.fecha?.seconds - a.fecha?.seconds
    );

    setObservaciones(todas);
  } catch (error) {
    Alert.alert("Error", "No se pudieron obtener las observaciones");
    console.error(error);
  }
};


  const aplicarFiltro = () => {
    if (!fechaInicio || !fechaFin) {
      Alert.alert("Atención", "Selecciona ambas fechas antes de filtrar.");
      return;
    }
    if (!user) return;

    const inicioTS = Timestamp.fromDate(new Date(fechaInicio.setHours(0, 0, 0, 0)));
    const finTS = Timestamp.fromDate(new Date(fechaFin.setHours(23, 59, 59, 999)));

    cargarObservaciones(user.uid, inicioTS, finTS, ciudad);
    setFiltroAplicado(true);
  };

  const abrirPicker = (tipo) => {
    setModo(tipo);
    setPickerVisible(true);
  };

  const confirmarFecha = (date) => {
    setPickerVisible(false);
    if (modo === "inicio") setFechaInicio(date);
    else setFechaFin(date);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis Observaciones</Text>

      {/* 🔍 FILTROS */}
      <View style={styles.filterBox}>
        <TouchableOpacity style={styles.dateButton} onPress={() => abrirPicker("inicio")}>
          <Text style={styles.dateText}>
            📅 Desde: {fechaInicio ? fechaInicio.toLocaleDateString("es-CO") : "Seleccionar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton} onPress={() => abrirPicker("fin")}>
          <Text style={styles.dateText}>
            📅 Hasta: {fechaFin ? fechaFin.toLocaleDateString("es-CO") : "Seleccionar"}
          </Text>
        </TouchableOpacity>

        {/* 🏙️ Filtro por ciudad */}
        <TextInput
          style={styles.input}
          placeholder="Ciudad (ej: Medellin)"
          value={ciudad}
          onChangeText={setCiudad}
        />

        <TouchableOpacity style={styles.filterBtn} onPress={aplicarFiltro}>
          <Text style={styles.filterBtnText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="date"
        onConfirm={confirmarFecha}
        onCancel={() => setPickerVisible(false)}
      />

      {/* 🧾 RESULTADOS */}
      {filtroAplicado ? (
        observaciones.length === 0 ? (
          <Text style={styles.text}>No hay observaciones en ese rango o ciudad.</Text>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {observaciones.length} observación(es) encontrada(s)
            </Text>
            {observaciones.map((obs) => (
              <View key={obs.id} style={styles.card}>
                <Text style={styles.cardText}>📍 {obs.ubicacion}</Text>
                {obs.fecha && (
                  <Text style={styles.fecha}>
                    🕒 {new Date(obs.fecha.seconds * 1000).toLocaleString("es-CO")}
                  </Text>
                )}
                {obs.temperatura && <Text>🌡️ {obs.temperatura} °C</Text>}
                {obs.humedad && <Text>💧 {obs.humedad} %</Text>}
                {obs.presion && <Text>⚖️ {obs.presion} hPa</Text>}
                {obs.descripcion && <Text>📝 {obs.descripcion}</Text>}
              </View>
            ))}
          </>
        )
      ) : (
        <Text style={styles.text}>Selecciona fechas y ciudad para ver tus observaciones.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, color: "#666", marginVertical: 10 },
  resultCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  filterBox: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#eef6ff",
    borderWidth: 1,
    borderColor: "#cce0ff",
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fdfdfd",
  },
  dateText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fdfdfd",
  },
  filterBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  filterBtnText: { color: "#fff", fontWeight: "bold" },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  cardText: { fontWeight: "bold", marginBottom: 5 },
});
