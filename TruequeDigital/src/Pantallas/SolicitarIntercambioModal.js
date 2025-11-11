import React, { useState } from "react";
//modal muestra una ventana flotante en sobre la app
import { Modal, View, Text, TextInput, Button } from "react-native";

//Recibe props 
//visible: boolean -> Controla si el modal se muestra (true) o se oculta (false).
//onClose: funcion -> Se ejecuta al cerrar el modal (por botón o al presionar atrás).
//onSubmit: funcion -> Se ejecuta al enviar la oferta.
//loading: boolean -> Indica si la app está enviando una solicitud (para desactivar botones y mostrar “Enviando…”).
export default function SolicitarIntercambioModal({ visible, onClose, onSubmit, loading }) {
  const [oferta, setOferta] = useState("");

  //esta función combina validación, seguridad y comunicación entre componentes
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
          <TextInput placeholder="Ej: Cambio por audífonos Sony, buen estado…" value={oferta} onChangeText={setOferta} multiline
            numberOfLines={4} style={{ borderWidth: 1, borderRadius: 8, padding: 10, textAlignVertical: "top", marginBottom: 12 }}/>

          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title={loading ? "Enviando..." : "Enviar"} onPress={enviar} disabled={loading || !oferta.trim()} />
          </View>

        </View>
      </View>
      
    </Modal>
  );
}
