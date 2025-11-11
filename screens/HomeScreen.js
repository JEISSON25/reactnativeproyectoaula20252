import React, { useState, useEffect } from 'react';
import {View,Text,FlatList,Image,StyleSheet,Pressable,TextInput,TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import {saveOfflineRecipe,getOfflineRecipes,clearSyncedRecipes,markRecipeSynced,} from '../database';
import { firestore, auth } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

const recetasPrecargadas = [
  {
    id: '1',
    nombre: 'Ensalada de Quinoa',
    descripcion: 'Quinoa con vegetales frescos y aderezo ligero.',
    foto: 'https://res.cloudinary.com/dt2kwkgch/image/upload/v1762871839/ensalada-quinoa_lxgwhj.jpg',
    categoria: 'Saludable',
    ingredientes: ['Quinoa', 'Tomate', 'Pepino', 'Zanahoria', 'Aceite de oliva'],
    pasos: [
      'Cocinar la quinoa.',
      'Picar los vegetales.',
      'Mezclar todo con aceite de oliva.',
      'Servir fresco.',
    ],
    favorito: false,
  },
  {
    id: '2',
    nombre: 'Smoothie Verde',
    descripcion: 'Batido de espinaca, plátano y manzana.',
    foto: 'https://res.cloudinary.com/dt2kwkgch/image/upload/v1762871846/smoothie-verde_akueq3.jpg',
    categoria: 'Bebida',
    ingredientes: ['Espinaca', 'Plátano', 'Manzana', 'Agua', 'Hielo'],
    pasos: [
      'Colocar todos los ingredientes en la licuadora.',
      'Licuar hasta obtener una mezcla homogénea.',
      'Servir en un vaso grande.',
    ],
    favorito: false,
  },
  {
    id: '3',
    nombre: 'Bowl de Avena',
    descripcion: 'Avena cocida con frutas y nueces.',
    foto: 'https://res.cloudinary.com/dt2kwkgch/image/upload/v1762871824/bowl-avena_mh7flv.jpg',
    categoria: 'Desayuno',
    ingredientes: ['Avena', 'Leche', 'Frutas', 'Nueces', 'Miel'],
    pasos: [
      'Cocinar la avena con leche.',
      'Agregar frutas picadas y nueces.',
      'Endulzar con miel al gusto.',
      'Servir caliente o frío.',
    ],
    favorito: false,
  },
];

const HomeScreen = ({ navigation }) => {
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    cargarRecetas();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
      if (state.isConnected) sincronizarRecetas();
    });

    return () => unsubscribe();
  }, []);

  const cargarRecetas = async () => {
    try {
      const existentes = await getOfflineRecipes();

      if (existentes.length === 0) {
        for (let r of recetasPrecargadas) {
          await saveOfflineRecipe(r);
        }
      }

      const todas = await getOfflineRecipes();
      setRecetas(
        todas.map((r) => ({
          ...r,
          id: r.id || Math.random().toString(), // por si no hay id
          nombre: r.nombre || 'Sin nombre',
          descripcion: r.descripcion || '',
          foto:
            r.foto ||
            'https://cdn.pixabay.com/photo/2017/02/23/13/05/smoothie-2096909_1280.jpg',
          ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes : [],
          pasos: Array.isArray(r.pasos) ? r.pasos : [],
          favorito: r.favorito ?? false,
          categoria: r.categoria || 'Otra',
        }))
      );
    } catch (error) {
      console.error('Error cargando recetas:', error);
    }
  };

  const sincronizarRecetas = async () => {
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return;

      const todas = await getOfflineRecipes();

      for (let receta of todas) {
        await setDoc(
          doc(
            collection(firestore, 'recetas'),
            receta.id?.toString() || new Date().getTime().toString()
          ),
          {
            ...receta,
            usuarioEmail: auth.currentUser?.email || 'anonimo',
            nombre: receta.nombre || 'Sin nombre',
            descripcion: receta.descripcion || '',
            foto:
              receta.foto ||
              'https://cdn.pixabay.com/photo/2017/02/23/13/05/smoothie-2096909_1280.jpg',
            ingredientes: Array.isArray(receta.ingredientes)
              ? receta.ingredientes
              : [],
            pasos: Array.isArray(receta.pasos) ? receta.pasos : [],
            favorito: receta.favorito ?? false,
            categoria: receta.categoria || 'Otra',
          }
        );
        await markRecipeSynced(receta.id);
      }

      await clearSyncedRecipes();
      console.log('✅ Recetas sincronizadas correctamente');

      await cargarRecetas(); //refrescar lista para sincronizar
    } catch (error) {
      console.error('Error sincronizando recetas:', error);
    }
  };

  const toggleFavorito = async (receta) => {
    const actualizado = {
      ...receta,
      favorito: !receta.favorito,
    };
    await saveOfflineRecipe(actualizado);
    setRecetas((prev) =>
      prev.map((r) => (r.id === receta.id ? actualizado : r))
    );

    if (isOnline) {
      await setDoc(
        doc(
          collection(firestore, 'recetas'),
          receta.id?.toString() || new Date().getTime().toString()
        ),
        {
          ...actualizado,
          usuarioEmail: auth.currentUser?.email || 'anonimo',
        }
      );
    }
  };

  const recetasFiltradas = recetas.filter((r) => {
    const coincideBusqueda =
      r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ingredientes?.some((ing) =>
        ing.toLowerCase().includes(busqueda.toLowerCase())
      );
    const coincideCategoria = categoriaSeleccionada
      ? r.categoria === categoriaSeleccionada
      : true;
    return coincideBusqueda && coincideCategoria;
  });

  const renderItem = ({ item }) => (
    <View style={styles.recetaContainer}>
      <Pressable
        onPress={() => navigation.navigate('DetalleRecetaScreen', { receta: item })}
        style={{ flexDirection: 'row', flex: 1 }}
      >
        <Image
          source={{
            uri:
              item.foto ||
              'https://cdn.pixabay.com/photo/2017/02/23/13/05/smoothie-2096909_1280.jpg',
          }}
          style={styles.imagen}
        />
        <View style={styles.textoContainer}>
          <Text style={styles.nombre}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={styles.descripcion}>{item.descripcion || ''}</Text>
        </View>
      </Pressable>

      <TouchableOpacity
        onPress={() => toggleFavorito(item)}
        style={styles.botonFavorito}
      >
        <Ionicons
          name={item.favorito ? 'heart' : 'heart-outline'}
          size={26}
          color={item.favorito ? 'red' : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f7fff7' }}>
      {!isOnline && (
        <View style={{ backgroundColor: 'red', padding: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Modo offline: los cambios se sincronizarán cuando tengas internet
          </Text>
        </View>
      )}

      <View style={styles.barraBusqueda}>
        <TextInput
          placeholder="Buscar por nombre o ingrediente..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setBusqueda('')}>
          <Ionicons name="search" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtros}>
        {['Saludable', 'Bebida', 'Desayuno'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.botonFiltro,
              categoriaSeleccionada === cat && styles.botonActivo,
            ]}
            onPress={() =>
              setCategoriaSeleccionada(categoriaSeleccionada === cat ? null : cat)
            }
          >
            <Text
              style={[
                styles.textoFiltro,
                categoriaSeleccionada === cat && styles.textoActivo,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {recetasFiltradas.length > 0 ? (
        <FlatList
          data={recetasFiltradas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          style={{ marginTop: 10 }}
        />
      ) : (
        <Text style={styles.sinResultados}>No se encontraron recetas.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  input: { flex: 1, padding: 8 },
  filtros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  botonFiltro: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#5bb450',
  },
  botonActivo: { backgroundColor: '#5bb450' },
  textoFiltro: { color: '#333' },
  textoActivo: { color: '#fff', fontWeight: 'bold' },
  recetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#dbf7d8',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  imagen: { width: 100, height: 100 },
  textoContainer: { flex: 1, padding: 10, justifyContent: 'center' },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  descripcion: { color: '#000', marginTop: 5 },
  botonFavorito: { padding: 10 },
  sinResultados: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#777' },
});

export default HomeScreen;
