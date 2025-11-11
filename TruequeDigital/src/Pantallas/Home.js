// src/Pantallas/Home.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Image, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp, getDocs, where } from "firebase/firestore";
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

  // Abrir o crear un chat 1:1 entre el usuario actual y otherId
  const openOrCreateChat = async (otherId, otherName = 'Usuario') => {
    try {
      const myId = auth.currentUser?.uid;
      if (!myId) return Alert.alert('Error', 'No has iniciado sesión.');
      if (otherId === myId) return Alert.alert('Info', 'No puedes chatear contigo mismo.');

      // buscar chats donde yo soy participante
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', myId));
      const snap = await getDocs(q);
      let found = null;
      snap.forEach((d) => {
        const data = d.data();
        const parts = data.participants || [];
        // si el chat contiene al otro usuario
        if (parts.includes(otherId) && parts.length === 2) {
          found = { id: d.id, ...data };
        }
      });

      if (found) {
        navigation.navigate('ChatRoom', { chatId: found.id, participants: found.participants || [] });
        return;
      }

      // crear nuevo chat 1:1
      const myName = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';
      const docRef = await addDoc(collection(db, 'chats'), {
        participants: [myId, otherId],
        participantNames: { [myId]: myName, [otherId]: otherName },
        lastMessage: '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: myId,
      });

      navigation.navigate('ChatRoom', { chatId: docRef.id, participants: [myId, otherId] });
    } catch (e) {
      console.error('openOrCreateChat error', e);
      Alert.alert('Error', e?.message || 'No se pudo iniciar el chat.');
    }
  };

  // Crear doc en 'solicitudes'
  const enviarSolicitud = async (ofertaTexto, done) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || !pubSeleccionada) return;
      setEnviando(true);
      // Ensure there is a 1:1 chat for these participants and get its id
      let chatId = null;
      try {
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data();
          const parts = data.participants || [];
          if (parts.includes(pubSeleccionada.userId) && parts.length === 2) {
            chatId = d.id;
          }
        });
      } catch (e) {
        console.warn('buscar chat existente falló', e);
      }

      if (!chatId) {
        try {
          const myName = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';
          const docRef = await addDoc(collection(db, 'chats'), {
            participants: [uid, pubSeleccionada.userId],
            participantNames: { [uid]: myName, [pubSeleccionada.userId]: pubSeleccionada.userName || pubSeleccionada.userDisplayName || '' },
            lastMessage: '',
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            createdBy: uid,
          });
          chatId = docRef.id;
        } catch (e) {
          console.warn('crear chat falló', e);
        }
      }

      await addDoc(collection(db, "solicitudes"), {
        publicacionId: pubSeleccionada.id,
        publicacionTitulo: pubSeleccionada.titulo || "",
        publicacionCategoria: pubSeleccionada.categoria || "",
        publicacionPrecio: typeof pubSeleccionada.precio === "number" ? pubSeleccionada.precio : null,

  ofertanteId: uid,
  destinatarioId: pubSeleccionada.userId,
  participants: [uid, pubSeleccionada.userId],
        propuesta: ofertaTexto,
        estado: "pendiente",
        chatId: chatId || null,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      done?.();
      setModalVisible(false);
      setPubSeleccionada(null);
      // Preguntar al usuario si quiere abrir el chat con el dueño
      Alert.alert(
        "Solicitud enviada",
        "El dueño recibirá tu propuesta. ¿Quieres ir al chat ahora?",
        [
          {
            text: 'Ir al chat',
            onPress: () => {
              const participants = [uid, pubSeleccionada.userId];
              if (chatId) navigation.navigate('ChatRoom', { chatId, participants });
              else openOrCreateChat(pubSeleccionada.userId, pubSeleccionada.userName || pubSeleccionada.userDisplayName || 'Usuario');
            }
          },
          { text: 'Cerrar', style: 'cancel' }
        ]
      );
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  const isOwner = (pub) => auth.currentUser?.uid && pub.userId === auth.currentUser.uid;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {/* Search on its own row for better spacing */}
      <View style={{ marginBottom: 10 }}>
        <TextInput
          placeholder="Buscar por palabra clave..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10, backgroundColor: '#fff' }}
        />
      </View>

      {/* Action buttons row below the search */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CrearPublicacion')}
            style={{ flex: 1, backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Nuevo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MisChats')}
            style={{ flex: 1, backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MisSolicitudes')}
            style={{ flex: 1, backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Mis Solicitudes</Text>
          </TouchableOpacity>
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
            {/* Botón para chatear con el dueño de la publicación */}
            {!isOwner(item) && (
              <View style={{ marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => openOrCreateChat(item.userId, item.userName || item.userDisplayName || 'Usuario')}
                  style={{ backgroundColor: '#6c5ce7', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Chatear</Text>
                </TouchableOpacity>
              </View>
            )}
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
