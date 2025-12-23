import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import HeaderApp from "../components/HeaderApp";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";

export default function ListaInventarioScreen() {
  const navigation = useNavigation();
  const { inventario, online, deleteProducto } = useAppContext();

  const [busqueda, setBusqueda] = useState("");
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const eliminarProducto = async () => {
    if (!productoSeleccionado) return;

    try {
      await deleteProducto(productoSeleccionado.id);
      setModalVisible(false);
      setProductoSeleccionado(null);

      Toast.show({
        type: "success",
        text1: "Producto eliminado",
        text2: "Se eliminó correctamente ✔",
        position: "bottom",
      });
    } catch (e) {
      console.log("Error eliminarProducto:", e);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo eliminar el producto",
        position: "bottom",
      });
    }
  };

  const confirmarEliminar = (item) => {
    setProductoSeleccionado(item);
    setModalVisible(true);
  };

  useEffect(() => {
    filtrar(busqueda);
  }, [busqueda, inventario]);

  const filtrar = (texto) => {
    if (!texto) {
      setListaFiltrada(inventario || []);
      return;
    }

    const termino = texto.toLowerCase();
    const filtro = (inventario || []).filter((item) => {
      const nombre = (item?.nombre || "").toLowerCase();
      const codigo = (item?.codigo || "").toLowerCase();
      return nombre.includes(termino) || codigo.includes(termino);
    });

    setListaFiltrada(filtro);
  };

  const exportarInventarioPDF = async () => {
    if (!inventario.length) {
      Toast.show({
        type: "info",
        text1: "Inventario vacío",
        text2: "No hay productos para exportar",
        position: "bottom",
      });
      return;
    }

    const filas = inventario
      .map(
        (p) => `
        <tr>
          <td>${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>${p.stockMinimo ?? 0}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <html>
        <body>
          <h1>Inventario Completo</h1>
          <table border="1" style="border-collapse: collapse; width: 100%; text-align:center;">
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Stock Mínimo</th>
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
      console.log("Error exportarInventarioPDF:", e);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo generar el PDF",
        position: "bottom",
      });
    }
  };

  const renderItem = ({ item }) => {
    const fotoUri = item?.foto
      ? item.foto.startsWith(FileSystem.documentDirectory)
        ? item.foto
        : FileSystem.documentDirectory + item.foto
      : null;

    return (
      <View style={styles.card}>
        {fotoUri ? (
          <Image
            source={{ uri: fotoUri }}
            style={styles.imagen}
            key={fotoUri}
          />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Text style={{ color: "#999" }}>Sin foto</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.nombre}>{item?.nombre}</Text>
          <Text style={styles.codigo}>Código: {item?.codigo}</Text>
          <Text style={styles.cantidad}>Stock: {item?.cantidad}</Text>
          <Text style={styles.stockMinimo}>Stock Mínimo: {item?.stockMinimo}</Text>

          {Number(item?.cantidad) <= Number(item?.stockMinimo) && (
            <View style={styles.alertaContainer}>
              <Text style={styles.alerta}>⚠ Stock Bajo</Text>
            </View>
          )}

          <View style={styles.crudRow}>
            <TouchableOpacity
              style={[styles.crudBtn, { backgroundColor: "#007AFF" }]}
              onPress={() =>
                navigation.navigate("EditarProducto", { producto: item })
              }
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crudBtn, { backgroundColor: "#FF3B30" }]}
              onPress={() => confirmarEliminar(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderApp />

      <LinearGradient colors={["#ffffff", "#e6ecff"]} style={styles.background}>
        {!online && (
          <Text style={styles.offline}>
            Modo Offline — Los cambios se guardarán localmente.
          </Text>
        )}

        <TextInput
          style={styles.search}
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <TouchableOpacity style={styles.pdfBtn} onPress={exportarInventarioPDF}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.pdfTexto}>Exportar Inventario PDF</Text>
        </TouchableOpacity>

        <FlatList
          data={listaFiltrada}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={renderItem}
          extraData={listaFiltrada}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AgregarProducto")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Ionicons
                name="warning-outline"
                size={50}
                color="#FF3B30"
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.modalTitulo}>¿Eliminar producto?</Text>
              <Text style={styles.modalTexto}>
                {productoSeleccionado?.nombre}
              </Text>

              <View style={styles.modalBotones}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.btnCancelar]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnTextoCancelar}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.btnEliminar]}
                  onPress={eliminarProducto}
                >
                  <Text style={styles.modalBtnTextoEliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 15,
  },

  offline: {
    backgroundColor: "#ff9500",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    color: "#fff",
    marginBottom: 12,
    fontWeight: "700",
  },

  pdfBtn: {
    flexDirection: "row",
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  pdfTexto: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDE1F0",
  },

  imagen: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },

  imagenPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#f2f3f7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  info: { flex: 1 },

  nombre: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },

  codigo: {
    color: "#6b6b6b",
    marginBottom: 4,
  },

  cantidad: {
    fontSize: 16,
  },

  stockMinimo: {
    fontSize: 14,
    color: "#FF6347",
    marginTop: 5,
  },

  alertaContainer: {
    marginTop: 6,
    backgroundColor: "#FFEBEE",
    padding: 6,
    borderRadius: 6,
  },

  alerta: {
    color: "#FF3B30",
    fontWeight: "bold",
    fontSize: 14,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 17,
    color: "#777",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  fabText: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: -3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },

  modalTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  modalTexto: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
  },

  modalBotones: {
    flexDirection: "row",
    marginTop: 15,
    gap: 12,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  btnCancelar: {
    backgroundColor: "#E5E5EA",
  },

  btnEliminar: {
    backgroundColor: "#FF3B30",
  },

  modalBtnTextoCancelar: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalBtnTextoEliminar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  crudRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  crudBtn: {
    padding: 10,
    borderRadius: 10,
  },
});
