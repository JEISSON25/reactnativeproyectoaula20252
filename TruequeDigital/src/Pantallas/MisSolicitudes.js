// src/Pantallas/MisSolicitudes.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, TouchableOpacity, FlatList, Alert } from "react-native";
import { auth, db } from "../../firebaseConfig";
import {collection, onSnapshot, orderBy, query, updateDoc, doc, where, serverTimestamp, addDoc, getDocs} from "firebase/firestore";

export default function MisSolicitudes( { navigation } ) {
  const uid = auth.currentUser?.uid;
  const [tab, setTab] = useState("recibidas"); // "recibidas" | "enviadas"
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q =
      tab === "recibidas"
        ? query(collection(db, "solicitudes"), where("destinatarioId", "==", uid), orderBy("createdAt", "desc"))
        : query(collection(db, "solicitudes"), where("ofertanteId", "==", uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setSolicitudes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [uid, tab]);

  const actualizarEstado = async (s, estado) => {
    try {
      await updateDoc(doc(db, "solicitudes", s.id), { estado, updatedAt: serverTimestamp() });
      console.log("Solicitud actualizada:", s);
      Alert.alert("Listo", `Solicitud ${estado}.`);
      if ( s.destinatarioId === uid) {
        // Ensure there's a chat between ofertante and destinatario and navigate to it
        try {
          let chatId = s.chatId || null;
          // validate ofertante and destinatario ids
          const ofertante = s.ofertanteId;
          const destinatario = s.destinatarioId;
          if (!ofertante || !destinatario) {
            console.warn('Faltan ids de participantes en la solicitud', s);
          } else {
            if (!chatId) {
              // search for existing 1:1 chat
              const q = query(collection(db, 'chats'), where('participants', 'array-contains', ofertante));
              const snap = await getDocs(q);
              snap.forEach((d) => {
                const data = d.data();
                const parts = data.participants || [];
                if (parts.includes(destinatario) && parts.length === 2) {
                  chatId = d.id;
                }
              });

              // if not found, create chat
              if (!chatId) {
                const creator = uid; // quien acepta la solicitud
                const myName = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';
                const docRef = await addDoc(collection(db, 'chats'), {
                  participants: [ofertante, destinatario],
                  participantNames: { [ofertante]: '', [destinatario]: myName },
                  lastMessage: '',
                  updatedAt: serverTimestamp(),
                  createdAt: serverTimestamp(),
                  createdBy: creator,
                });
                chatId = docRef.id;
              }

              // persist chatId in solicitud for future reference
              if (chatId) {
                await updateDoc(doc(db, 'solicitudes', s.id), { chatId, updatedAt: serverTimestamp() });
              }
            }

            if (chatId) {
              const participants = Array.isArray(s.participants) && s.participants.length ? s.participants : [ofertante, destinatario];
              navigation.navigate('ChatRoom', { chatId, participants });
            }
          }
        } catch (e) {
          console.error('Error asegurando chat desde MisSolicitudes', e);
        }
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo actualizar la solicitud.");
    }
  };

  const Item = ({ s }) => {
    const recibida = tab === "recibidas";
    return (
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold" }}>{s.publicacionTitulo || s.publicacionId}</Text>
        <Text style={{ marginTop: 6 }}>Oferta: {s.propuesta || "(sin oferta)"}</Text>
        <Text style={{ marginTop: 6, opacity: 0.8 }}>Estado: {s.estado}</Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {recibida && s.estado === "pendiente" ? (
            <>
              <Button title="Aceptar" onPress={() => actualizarEstado(s, "aceptada")} />
              <Button title="Rechazar" onPress={() => actualizarEstado(s, "rechazada")} />
            </>
          ) : null}
          {!recibida && s.estado === "pendiente" ? (
            <Button title="Cancelar" onPress={() => actualizarEstado(s, "cancelada")} />
          ) : null}
        </View>
          { s.estado === "aceptada" && (
          <Button
          title="Calificar usuario"
          onPress={() =>
          navigation.navigate("CalificarUsuario", {
          evaluadoId: tab === "recibidas" ? s.ofertanteId : s.destinatarioId,
          solicitudId: s.id,
            })
          }/>
)}

      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setTab("recibidas")}
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: tab === "recibidas" ? "#eee" : "transparent",
          }}
        >
          <Text style={{ textAlign: "center" }}>Recibidas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("enviadas")}
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: tab === "enviadas" ? "#eee" : "transparent",
          }}
        >
          <Text style={{ textAlign: "center" }}>Enviadas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 24 }}>No hay solicitudes.</Text>}
        renderItem={({ item }) => <Item s={item} />}
      />
    </View>
  );
}
