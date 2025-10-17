import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function CrearPublicacion({ navigation }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState(""); 
  const [saving, setSaving] = useState(false);

  const CATEGORIAS = [
    "Tecnología",
    "Hogar",
    "Servicios",
    "Ropa",
    "Libros",
    "Otros",
  ];

  const onGuardar = async () => {
    try {
      if (!auth.currentUser?.uid) {
        return Alert.alert("Sesión", "Debes iniciar sesión para publicar.");
      }
      const t = titulo.trim();
      const d = descripcion.trim();
      const c = categoria.trim();
      const p = parseFloat(precio.toString().replace(",", "."));

      if (!t || !d || !c || !precio) {
        return Alert.alert("Campos requeridos", "Completa título, descripción, categoría y precio.");
      }
      if (Number.isNaN(p) || p < 0) {
        return Alert.alert("Precio inválido", "Ingresa un precio válido (número positivo).");
      }

      setSaving(true);

      await addDoc(collection(db, "publicaciones"), {
        titulo: t,
        descripcion: d,
        categoria: c,
        precio: p, 
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Éxito", "Publicación creada.");
      navigation.goBack();
    } catch (e) {
      console.log("Error al crear publicación:", e);
      Alert.alert("Error", e?.message || "No se pudo crear la publicación.");
    } finally {
      setSaving(false);
    }



  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        Nueva publicación
      </Text>

      <Text style={{ marginBottom: 6 }}>Título</Text>
      <TextInput
        placeholder="Ej: Intercambio teclado mecánico"
        value={titulo}
        onChangeText={setTitulo}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Descripción</Text>
      <TextInput
        placeholder="Describe el estado, condiciones del trueque, etc."
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          textAlignVertical: "top",
          marginBottom: 12,
        }}
      />

      <Text style={{ marginBottom: 6 }}>Categoría</Text>
      
      <View style={{borderWidth: 1, borderRadius: 8, marginBottom: 12, overflow: "hidden",}}>
        <Picker selectedValue={categoria} onValueChange={(val) => setCategoria(val)}>
          <Picker.Item label="Selecciona una categoría..." value="" />
          {CATEGORIAS.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={{ marginBottom: 6 }}>Precio</Text>
      <TextInput
        placeholder="Ej: 150000"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
      />

      <Button
        title={saving ? "Guardando..." : "Publicar"}
        onPress={onGuardar}
        disabled={saving}
      />
    </View>
  );
}
