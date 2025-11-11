import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const DetalleRecetaScreen = ({ route }) => {
  const { receta } = route.params;

  if (!receta) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No se encontró la receta.</Text>
      </View>
    );
  }

  // extraccion de datos
  const { nombre, descripcion, categoria, ingredientes, pasos, imagen, usuario } = receta;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {imagen ? (
        <Image source={{ uri: imagen }} style={styles.imagen} />
      ) : (
        <Image
          source={require('../assets/recursos/ensalada-quinoa.jpg')}
          style={styles.imagen}
        />
      )}

      {/* info principal de la receta*/}
      <Text style={styles.nombre}>{nombre}</Text>
      {categoria && <Text style={styles.categoria}>{categoria}</Text>}
      <Text style={styles.descripcion}>{descripcion}</Text>

      {/* ingredientes de la receta */}
      <Text style={styles.seccion}>Ingredientes</Text>
      {Array.isArray(ingredientes) && ingredientes.length > 0 ? (
        ingredientes.map((item, index) => (
          <Text key={index} style={styles.texto}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.texto}>No hay ingredientes registrados.</Text>
      )}

      {/* pasos de la receta */}
      <Text style={styles.seccion}>Pasos</Text>
      {Array.isArray(pasos) && pasos.length > 0 ? (
        pasos.map((item, index) => (
          <Text key={index} style={styles.texto}>{index + 1}. {item}</Text>
        ))
      ) : (
        <Text style={styles.texto}>No hay pasos registrados.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  imagen: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 16,
  },
  nombre: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  categoria: {
    fontSize: 16,
    color: '#22c55e',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  autor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  seccion: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#111',
  },
  texto: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  error: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});

export default DetalleRecetaScreen;
