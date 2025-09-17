import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const DetalleRecetaScreen = ({ route }) => {
  const { nombre, foto, descripcion, ingredientes, pasos } = route.params;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Image source={foto} style={styles.imagen} />
      <Text style={styles.nombre}>{nombre}</Text>
      <Text style={styles.descripcion}>{descripcion}</Text>

      <Text style={styles.seccion}>Ingredientes:</Text>
      {ingredientes.map((item, index) => (
        <Text key={index} style={styles.texto}>• {item}</Text>
      ))}

      <Text style={styles.seccion}>Pasos:</Text>
      {pasos.map((item, index) => (
        <Text key={index} style={styles.texto}>{index + 1}. {item}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imagen: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
  seccion: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  texto: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default DetalleRecetaScreen;
