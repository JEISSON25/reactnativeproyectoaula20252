import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { getOfflineRecipes, saveOfflineRecipe } from '../database';
import { Ionicons } from '@expo/vector-icons';

const FavoritesScreen = ({ navigation }) => {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const usuarioActual = auth.currentUser?.email;
    if (!usuarioActual) return;

    const cargarLocales = async () => {
      const locales = await getOfflineRecipes();
      return locales.filter((r) => r.favorito);
    };

    const q = query(collection(firestore, 'recetas'), where('favorito', '==', true));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const firestoreData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filtradasFirestore = firestoreData.filter(
        (r) =>
          r.usuario === usuarioActual || 
          r.usuarioEmail === usuarioActual || 
          r.usuarioEmail === 'publico'
      );

      const localesFavoritas = await cargarLocales();

      const todas = [...filtradasFirestore, ...localesFavoritas];
      const unique = Array.from(new Map(todas.map((r) => [r.id, r])).values());

      setFavoritos(unique);
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorito = async (receta) => {
    const actualizado = { ...receta, favorito: !receta.favorito };
    
    // actualizar
    await saveOfflineRecipe(actualizado);

    // actualizar firestore por id
    if (receta.id) {
      await setDoc(doc(collection(firestore, 'recetas'), receta.id.toString()), {
        ...actualizado,
        usuarioEmail: auth.currentUser.email,
      });
    }

    // actualizar estado de la receta, si es favorita o no
    setFavoritos((prev) =>
      prev.map((r) => (r.id === receta.id ? actualizado : r)).filter(r => r.favorito)
    );
  };

  if (favoritos.length === 0) {
    return (
      <View style={styles.vacioContainer}>
        <Text style={styles.vacioTexto}>No tienes recetas favoritas aun</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const imagenUrl = item.foto || item.imagen || 'https://cdn.pixabay.com/photo/2017/02/23/13/05/smoothie-2096909_1280.jpg';
    return (
      <Pressable
        onPress={() => navigation.navigate('DetalleRecetaScreen', { receta: item })}
        style={styles.itemContainer}
      >
        <Image source={{ uri: imagenUrl }} style={styles.imagen} />
        <View style={styles.textoContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        </View>

        {/* boton de favorito */}
        <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.botonFavorito}>
          <Ionicons
            name={item.favorito ? 'heart' : 'heart-outline'}
            size={26}
            color={item.favorito ? 'red' : 'gray'}
          />
        </TouchableOpacity>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={favoritos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  vacioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  vacioTexto: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  botonFavorito: {
    padding: 10,
  },
});

export default FavoritesScreen;
