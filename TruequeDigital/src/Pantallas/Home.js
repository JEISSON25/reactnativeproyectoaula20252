// src/Pantallas/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Image, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../firebaseConfig";
import SolicitarIntercambioModal from "./SolicitarIntercambioModal";

export default function Home({ navigation }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pubSeleccionada, setPubSeleccionada] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "publicaciones"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPublicaciones(items);
    });
    return unsubscribe;
  }, []);

  const filtradas = useMemo(() => {
    const t = (busqueda || "").trim().toLowerCase();
    if (!t) return publicaciones;
    return publicaciones.filter((p) =>
      (p.titulo || "").toLowerCase().includes(t) ||
      (p.descripcion || "").toLowerCase().includes(t)
    );
  }, [busqueda, publicaciones]);

  // Abrir modal (evita solicitar tu propia publicación)
  const abrirModal = (pub) => {
    if (pub.userId === auth.currentUser?.uid) {
      return Alert.alert("No permitido", "No puedes solicitar tu propia publicación.");
    }
    setPubSeleccionada(pub);
    setModalVisible(true);
  };

  // Crear doc en 'solicitudes'
  const enviarSolicitud = async (ofertaTexto, done) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || !pubSeleccionada) return;
      setEnviando(true);

      await addDoc(collection(db, "solicitudes"), {
        publicacionId: pubSeleccionada.id,
        publicacionTitulo: pubSeleccionada.titulo || "",
        publicacionCategoria: pubSeleccionada.categoria || "",
        publicacionPrecio: typeof pubSeleccionada.precio === "number" ? pubSeleccionada.precio : null,

        ofertanteId: uid,
        destinatarioId: pubSeleccionada.userId,
        propuesta: ofertaTexto,
        estado: "pendiente",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      done?.();
      setModalVisible(false);
      setPubSeleccionada(null);
      Alert.alert("Solicitud enviada", "El dueño recibirá tu propuesta.");
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  const isOwner = (pub) => auth.currentUser?.uid && pub.userId === auth.currentUser.uid;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Buscar por palabra clave..."
            value={busqueda}
            onChangeText={setBusqueda}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
          />
        </View>
        <Button title="Nuevo" onPress={() => navigation.navigate("CrearPublicacion")} />
        <Button title="Mis Solicitudes" onPress={() => navigation.navigate("MisSolicitudes")} />
      </View>

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 24 }}>No hay publicaciones aún.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
            {item.imagenUrl ? (
              <Image source={{ uri: item.imagenUrl }} style={{ width: "100%", height: 180, borderRadius: 8 }} />
            ) : null}
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>{item.titulo}</Text>
            <Text style={{ marginTop: 4 }}>{item.descripcion}</Text>

            {/* Botón para abrir el modal */}
            <View style={{ marginTop: 8 }}>
              <Button
                title={isOwner(item) ? "Es tu publicación" : "Solicitar intercambio"}
                onPress={() => abrirModal(item)}
                disabled={isOwner(item)}
              />
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={{ marginTop: 8 }}>
        <Button title="Cerrar sesión" onPress={() => signOut(auth)} />
      </View>

      {/* Modal */}
      <SolicitarIntercambioModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPubSeleccionada(null);
        }}
        onSubmit={enviarSolicitud}
        loading={enviando}
      />
    </View>
  );
}
