import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesScreen = ({ navigation }) => {
  const [favoritos, setFavoritos] = useState([]);

  // Cargar favoritos desde AsyncStorage al montar la pantalla
  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const favoritosGuardados = await AsyncStorage.getItem('favoritos');
        if (favoritosGuardados) {
          setFavoritos(JSON.parse(favoritosGuardados));
        }
      } catch (error) {
        console.log('Error al cargar favoritos:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', cargarFavoritos);
    return unsubscribe;
  }, [navigation]);

  if (favoritos.length === 0) {
    return (
      <View style={styles.vacioContainer}>
        <Text style={styles.vacioTexto}>No tienes recetas favoritas aún 💔</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoritos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('DetalleRecetaScreen', { ...item })}
          style={styles.itemContainer}
        >
          <Image source={item.foto} style={styles.imagen} />
          <View style={styles.textoContainer}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
          </View>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  vacioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vacioTexto: {
    fontSize: 16,
    color: 'gray',
  },
  itemContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#dbf7d8',
    borderRadius: 9,
    overflow: 'hidden',
    elevation: 2,
  },
  imagen: {
    width: 100,
    height: 100,
  },
  textoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  descripcion: {
    color: '#000',
    marginTop: 5,
  },
});

export default FavoritesScreen;
