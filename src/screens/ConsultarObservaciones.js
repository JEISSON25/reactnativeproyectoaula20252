import React, { useEffect, useState } from "react";
import { View,Text,StyleSheet,ScrollView,Alert,TouchableOpacity,TextInput,useColorScheme,} from "react-native";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ConsultarObservaciones() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [user, setUser] = useState(null);
  const [observaciones, setObservaciones] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [modo, setModo] = useState("inicio");
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [ciudad, setCiudad] = useState("");

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

      const q1 = query(collection(db, "observaciones"), ...condiciones);
      const snapshot1 = await getDocs(q1);
      const data1 = snapshot1.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        origen: "observaciones",
      }));

      const q2 = query(collection(db, "historicalWeather"), ...condiciones);
      const snapshot2 = await getDocs(q2);
      const data2 = snapshot2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        origen: "historicalWeather",
      }));

      const todas = [...data1, ...data2].sort(
        (a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0)
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

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    text: {
      fontSize: 16,
      color: isDark ? '#94a3b8' : '#666',
      marginVertical: 10,
      textAlign: 'center',
    },
    resultCount: {
      fontSize: 16,
      fontWeight: "bold",
      color: '#3b82f6',
      marginBottom: 12,
      textAlign: 'center',
    },
    filterBox: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#eef6ff',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#cce0ff',
    },
    dateButton: {
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#aaa',
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: isDark ? '#1e293b' : '#fdfdfd',
    },
    dateText: {
      fontSize: 16,
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    input: {
      backgroundColor: isDark ? '#1e293b' : '#fdfdfd',
      color: isDark ? '#e2e8f0' : '#1e293b',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#aaa',
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
      fontSize: 16,
    },
    filterBtn: {
      backgroundColor: '#3b82f6',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    filterBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    card: {
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#ccc',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      backgroundColor: isDark ? '#1e293b' : '#f9f9f9',
    },
    cardText: {
      fontWeight: "bold",
      marginBottom: 6,
      color: isDark ? '#e2e8f0' : '#1e293b',
    },
    fecha: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#666',
      marginBottom: 8,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis Observaciones</Text>

      {/* FILTROS */}
      <View style={styles.filterBox}>
        <TouchableOpacity style={styles.dateButton} onPress={() => abrirPicker("inicio")}>
          <Text style={styles.dateText}>
            Desde: {fechaInicio ? fechaInicio.toLocaleDateString("es-CO") : "Seleccionar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton} onPress={() => abrirPicker("fin")}>
          <Text style={styles.dateText}>
            Hasta: {fechaFin ? fechaFin.toLocaleDateString("es-CO") : "Seleccionar"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ciudad (ej: Medellín)"
          placeholderTextColor={isDark ? '#94a3b8' : '#94a3b8'}
          value={ciudad}
          onChangeText={setCiudad}
          autoCapitalize="words"
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

      {/* RESULTADOS */}
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
                <Text style={styles.cardText}>Ubicación: {obs.ubicacion}</Text>
                {obs.fecha && (
                  <Text style={styles.fecha}>
                    {new Date(obs.fecha.seconds * 1000).toLocaleString("es-CO")}
                  </Text>
                )}
                {obs.temperatura && <Text>Temperatura: {obs.temperatura} °C</Text>}
                {obs.humedad && <Text>Humedad: {obs.humedad} %</Text>}
                {obs.presion && <Text>Presión: {obs.presion} hPa</Text>}
                {obs.descripcion && <Text>Descripción: {obs.descripcion}</Text>}
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