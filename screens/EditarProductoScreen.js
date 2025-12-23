import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import HeaderApp from "../components/HeaderApp";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";

export default function EditarProductoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { producto } = route.params;
  const { editProducto, deleteProducto, online, showToast } = useAppContext();

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [codigo, setCodigo] = useState(producto?.codigo ?? "");
  const [cantidad, setCantidad] = useState(String(producto?.cantidad ?? ""));
  const [stockMinimo, setStockMinimo] = useState(String(producto?.stockMinimo ?? "0"));
  const [nuevaFotoUri, setNuevaFotoUri] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async (useCamera) => {
    try {
      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        Toast.show({
          type: "error",
          text1: "Permiso denegado",
          text2: "No puedes acceder a la cámara o galería.",
        });
        return;
      }

      const opts = { allowsEditing: true, quality: 0.7 };
      const result = useCamera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);

      if (!result.canceled && result.assets?.length > 0) {
        setNuevaFotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo seleccionar la imagen.",
      });
    }
  };

  const guardarCambios = async () => {
    if (!nombre || !codigo || !cantidad || stockMinimo === "") {
      Toast.show({
        type: "error",
        text1: "Campos incompletos",
        text2: "Todos los campos son obligatorios.",
      });
      return;
    }

    setCargando(true);

    try {
      const dataToUpdate = {
        nombre,
        codigo,
        cantidad: Number(cantidad),
        stockMinimo: Number(stockMinimo),
      };

      if (nuevaFotoUri) dataToUpdate.foto = nuevaFotoUri;

      await editProducto(producto.id, dataToUpdate);

      Toast.show({
        type: "success",
        text1: "Producto actualizado",
        text2: "Los cambios fueron guardados correctamente.",
      });

      navigation.goBack();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron guardar los cambios.",
      });
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = async () => {
    setModalVisible(false);
    setCargando(true);
    try {
      await deleteProducto(producto.id);
      showToast("Producto eliminado con éxito");
      navigation.goBack();
    } catch {
      showToast("Error al eliminar");
    } finally {
      setCargando(false);
    }
  };

  const uriMostrar = nuevaFotoUri
    ? nuevaFotoUri
    : producto?.foto
      ? producto.foto.startsWith(FileSystem.documentDirectory)
        ? producto.foto
        : FileSystem.documentDirectory + producto.foto
      : null;

  return (
    <View style={{ flex: 1 }}>
      <HeaderApp />
      <LinearGradient colors={["#ffffff", "#eef2ff"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>Editar Producto</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

          <Text style={styles.label}>Código</Text>
          <TextInput style={styles.input} value={codigo} onChangeText={setCodigo} />

          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Stock mínimo</Text>
          <TextInput
            style={styles.input}
            value={stockMinimo}
            onChangeText={setStockMinimo}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Foto del Producto</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.photoButton, { marginRight: 10 }]}
              onPress={() => pickImage(false)}
            >
              <Text style={styles.buttonText}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.buttonText}>Cámara</Text>
            </TouchableOpacity>
          </View>

          {uriMostrar ? (
            <Image source={{ uri: uriMostrar }} style={styles.imagen} />
          ) : (
            <View style={[styles.imagen, styles.imagenPlaceholder]}>
              <Text style={{ color: "#999" }}>Sin foto</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.botonGuardar, cargando && { opacity: 0.6 }]}
            onPress={guardarCambios}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoGuardar}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>

          {!online && (
            <Text style={styles.offlineMsg}>
              Estás en modo Offline — los cambios se guardarán localmente.
            </Text>
          )}
        </ScrollView>
      </LinearGradient>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>¿Eliminar producto?</Text>
            <Text style={styles.modalTexto}>Esta acción no se puede deshacer.</Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.modalCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalEliminar}
                onPress={confirmarEliminar}
              >
                <Text style={styles.modalEliminarTexto}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80 },
  titulo: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginBottom: 20, textAlign: "center" },
  deleteButton: { alignSelf: "flex-end", padding: 8, marginBottom: 10 },
  deleteText: { fontSize: 26, color: "red" },
  label: { fontSize: 16, marginBottom: 8, color: "#333", fontWeight: "500" },
  input: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#D1D1D6" },
  buttonGroup: { flexDirection: "row", marginBottom: 20 },
  photoButton: { flex: 1, backgroundColor: "#4C6EF5", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  imagen: { width: 170, height: 170, marginBottom: 25, alignSelf: "center", borderRadius: 14, borderWidth: 2, borderColor: "#c7d2fe" },
  imagenPlaceholder: { backgroundColor: "#f2f3f7", alignItems: "center", justifyContent: "center" },
  botonGuardar: { backgroundColor: "#34C759", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  textoGuardar: { color: "#fff", fontWeight: "700", fontSize: 17 },
  offlineMsg: { marginTop: 18, textAlign: "center", color: "#FF9500", fontWeight: "600" },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCaja: { backgroundColor: "#fff", width: "80%", padding: 20, borderRadius: 15, alignItems: "center" },
  modalTitulo: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalTexto: { fontSize: 15, color: "#444", textAlign: "center" },
  modalBotones: { flexDirection: "row", marginTop: 20, width: "100%", justifyContent: "space-between" },
  modalCancelar: { flex: 1, backgroundColor: "#ccc", padding: 12, borderRadius: 10, marginRight: 10 },
  modalCancelarTexto: { textAlign: "center", fontWeight: "600" },
  modalEliminar: { flex: 1, backgroundColor: "red", padding: 12, borderRadius: 10 },
  modalEliminarTexto: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
