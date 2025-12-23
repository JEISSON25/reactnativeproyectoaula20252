import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import HeaderApp from "../components/HeaderApp";
import { LinearGradient } from "expo-linear-gradient";

export default function AgregarProductoScreen() {
  const navigation = useNavigation();
  const { addProducto, online } = useAppContext();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);

  const pickImage = async (useCamera) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Permiso denegado", "No puedes acceder a la cámara/galería.");
      return;
    }

    const opts = { allowsEditing: true, quality: 0.7 };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (!result.canceled) setFoto(result.assets[0].uri);
  };

  const guardar = async () => {
    if (!nombre || !codigo || !cantidad) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);

    await addProducto({
      nombre,
      codigo,
      cantidad: parseInt(cantidad, 10),
      stockMinimo: parseInt(stockMinimo, 10),
      foto,
    });

    setCargando(false);
    Alert.alert("Éxito", "Producto agregado correctamente.");
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderApp />
      <LinearGradient colors={["#ffffff", "#eef2ff"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.titulo}>Agregar Producto</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput
            placeholder="Nombre del producto"
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Código</Text>
          <TextInput
            placeholder="Código"
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
          />

          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            placeholder="Cantidad"
            style={styles.input}
            value={cantidad}
            keyboardType="numeric"
            onChangeText={setCantidad}
          />

          <Text style={styles.label}>Stock Mínimo</Text>
          <TextInput
            placeholder="Stock mínimo"
            style={styles.input}
            value={stockMinimo}
            keyboardType="numeric"
            onChangeText={setStockMinimo}
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

          {foto && <Image source={{ uri: foto }} style={styles.imagen} />}

          <TouchableOpacity
            style={[styles.botonGuardar, cargando && { opacity: 0.6 }]}
            onPress={guardar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoGuardar}>Guardar Producto</Text>
            )}
          </TouchableOpacity>

          {!online && (
            <Text style={styles.offlineMsg}>
              Estás en modo Offline — se guardará localmente.
            </Text>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80 },
  titulo: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginBottom: 20, textAlign: "center" },
  backButton: { marginBottom: 15, padding: 10, backgroundColor: "#E5E5E5", borderRadius: 8, alignItems: "center", width: 100 },
  backButtonText: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  label: { fontSize: 16, marginBottom: 8, color: "#333", fontWeight: "500" },
  input: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#D1D1D6" },
  buttonGroup: { flexDirection: "row", marginBottom: 20 },
  photoButton: { flex: 1, backgroundColor: "#4C6EF5", padding: 14, borderRadius: 12, alignItems: "center", elevation: 3 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  imagen: { width: 170, height: 170, marginBottom: 25, alignSelf: "center", borderRadius: 14, borderWidth: 2, borderColor: "#c7d2fe" },
  botonGuardar: { backgroundColor: "#34C759", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10, elevation: 3 },
  textoGuardar: { color: "#fff", fontWeight: "700", fontSize: 17 },
  offlineMsg: { marginTop: 18, textAlign: "center", color: "#FF9500", fontWeight: "600" },
});
