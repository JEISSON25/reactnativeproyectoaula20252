import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../context/AppContext";
import HeaderApp from "../components/HeaderApp";

export default function MovimientosScreen() {
  const { movimientos, online } = useAppContext();

  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const [pickerInicio, setPickerInicio] = useState(false);
  const [pickerFin, setPickerFin] = useState(false);
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    filtrarMovimientos();
  }, [movimientos, inicio, fin]);

  const filtrarMovimientos = () => {
    let data = [...movimientos];
    if (inicio) data = data.filter((m) => new Date(m.fecha) >= inicio);
    if (fin) data = data.filter((m) => new Date(m.fecha) <= fin);
    setFiltrados(data);
  };

  const generarPDF = async () => {
    if (filtrados.length === 0)
      return Alert.alert("Error", "No hay movimientos en el rango seleccionado");

    const filas = filtrados
      .map((m) => {
        const movimiento = m.detalles.despues - m.detalles.antes;
        return `
        <tr>
          <td>${m.tipo.toUpperCase()}</td>
          <td>${m.productoCodigo}</td>
          <td>${m.productoNombre}</td>
          <td>${m.detalles.antes}</td>
          <td>${m.detalles.despues}</td>
          <td>${movimiento >= 0 ? "+" : ""}${movimiento}</td>
          <td>${m.detalles.despues}</td>
          <td>${new Date(m.fecha).toLocaleString()}</td>
        </tr>
      `;
      })
      .join("");

    const html = `
    <html>
      <body>
        <h1>Reporte de Movimientos</h1>
        <table border="1" style="border-collapse: collapse; width: 100%; text-align:center;">
          <tr>
            <th>Tipo</th>
            <th>Código</th>
            <th>Producto</th>
            <th>Anterior</th>
            <th>Nuevo</th>
            <th>Movimiento</th>
            <th>Stock actual</th>
            <th>Fecha</th>
          </tr>
          ${filas}
        </table>
      </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.log("Error generando PDF:", e);
      Alert.alert("Error", "No se pudo generar el PDF");
    }
  };

  const renderItem = ({ item }) => {
    const cantidadMovimiento = item.detalles.despues - item.detalles.antes;
    const colorMovimiento =
      cantidadMovimiento >= 0 ? styles.movEntrada : styles.movSalida;

    return (
      <View
        style={[
          styles.card,
          cantidadMovimiento >= 0 ? styles.cardEntrada : styles.cardSalida,
        ]}
      >
        <Text style={styles.cardTipo}>{item.tipo.toUpperCase()}</Text>
        <Text style={styles.cardCodigo}>Código: {item.productoCodigo}</Text>
        <Text style={styles.cardNombre}>Producto: {item.productoNombre}</Text>
        <Text style={styles.cardDetalles}>
          Anterior: {item.detalles.antes} → Nuevo: {item.detalles.despues}
        </Text>
        <Text style={[styles.cardMovimiento, colorMovimiento]}>
          Movimiento: {cantidadMovimiento >= 0 ? "+" : ""}
          {cantidadMovimiento}
        </Text>
        <Text style={styles.cardStock}>
          Stock actual: {item.detalles.despues}
        </Text>
        <Text style={styles.cardFecha}>
          {new Date(item.fecha).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderApp title="Movimientos" />

      <Text style={styles.sectionTitle}>Filtrar por fecha</Text>

      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setPickerInicio(true)}
        >
          <Text>{inicio ? inicio.toLocaleDateString() : "Inicio"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setPickerFin(true)}
        >
          <Text>{fin ? fin.toLocaleDateString() : "Fin"}</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={pickerInicio}
        mode="date"
        onConfirm={(d) => {
          setInicio(d);
          setPickerInicio(false);
        }}
        onCancel={() => setPickerInicio(false)}
      />

      <DateTimePickerModal
        isVisible={pickerFin}
        mode="date"
        onConfirm={(d) => {
          setFin(d);
          setPickerFin(false);
        }}
        onCancel={() => setPickerFin(false)}
      />

      <TouchableOpacity style={styles.pdfBtn} onPress={generarPDF}>
        <Text style={styles.pdfText}>Exportar PDF</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Historial</Text>

      <FlatList
        data={filtrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>No hay movimientos registrados</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  dateRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  dateBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  pdfBtn: {
    backgroundColor: "#FF9500",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  pdfText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  cardEntrada: { borderLeftWidth: 6, borderLeftColor: "#34C759" },
  cardSalida: { borderLeftWidth: 6, borderLeftColor: "#FF3B30" },

  cardTipo: { fontWeight: "bold", fontSize: 16 },
  cardCodigo: { color: "#444", marginTop: 2 },
  cardNombre: { color: "#444", marginTop: 2 },

  cardDetalles: { marginTop: 5, color: "#555" },

  cardMovimiento: { fontWeight: "bold", marginTop: 5 },
  movEntrada: { color: "#34C759" },
  movSalida: { color: "#FF3B30" },

  cardStock: { marginTop: 3, fontWeight: "600", color: "#000" },

  cardFecha: { color: "#777", marginTop: 6, fontSize: 12 },

  empty: { textAlign: "center", color: "#777", marginTop: 40 },
});
