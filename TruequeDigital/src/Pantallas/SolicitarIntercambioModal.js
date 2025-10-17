import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";

export default function SolicitarIntercambioModal({ visible, onClose, onSubmit, loading }) {
  const [oferta, setOferta] = useState("");

  const enviar = () => {
    const txt = (oferta || "").trim();
    if (!txt) return;
    onSubmit(txt, () => setOferta(""));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 }}>
        <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>¿Qué ofreces para el trueque?</Text>
          <TextInput
            placeholder="Ej: Cambio por audífonos Sony, buen estado…"
            value={oferta}
            onChangeText={setOferta}
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10, textAlignVertical: "top", marginBottom: 12 }}
          />
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title={loading ? "Enviando..." : "Enviar"} onPress={enviar} disabled={loading || !oferta.trim()} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
