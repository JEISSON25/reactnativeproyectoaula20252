import React, { useEffect, useState } from 'react';
import {View,Text,FlatList,TouchableOpacity,ActivityIndicator,Image,TextInput,StyleSheet,Alert,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { getOfflineRecipes } from '../database'; 

export default function MisRecetasScreen({ navigation }) {
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarRecetas = async () => {
    const auth = getAuth();
    const usuarioEmail = auth.currentUser?.email ?? '';
    if (!usuarioEmail) return [];

    // cargar recetas offline
    const offline = await getOfflineRecipes();
    const misOffline = offline.filter(r => r.usuario === usuarioEmail);

    // escuhar firestore
    return new Promise((resolve) => {
      const q = query(collection(firestore, 'recetas'), where('usuario', '==', usuarioEmail));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const online = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // para evitar duplicados
        const combinadas = [...online];
        misOffline.forEach(rOffline => {
          if (!combinadas.some(r => r.id === rOffline.id)) {
            combinadas.push(rOffline);
          }
        });

        setRecetas(combinadas);
        setCargando(false);
        resolve(unsubscribe);
      });
    });
  };

  useEffect(() => {
    let unsubscribeFn;
    cargarRecetas().then((unsub) => { unsubscribeFn = unsub; });
    return () => { if (unsubscribeFn) unsubscribeFn(); };
  }, []);

  const recetasFiltradas = recetas.filter((r) => {
    const texto = busqueda.toLowerCase();
    return (
      r.nombre.toLowerCase().includes(texto) ||
      r.descripcion.toLowerCase().includes(texto) ||
      r.ingredientes.some((ing) => ing.toLowerCase().includes(texto))
    );
  });

  const eliminarReceta = async (id) => {
    Alert.alert(
      'Eliminar receta',
      '¿Seguro que deseas eliminar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'recetas', id));
              setRecetas(prev => prev.filter(r => r.id !== id));
            } catch (error) {
              console.error('Error eliminando receta:', error);
              Alert.alert('Error', 'No se pudo eliminar la receta.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleFavorito = async (receta) => {
    try {
      const actualizado = { ...receta, favorito: !receta.favorito };
      await setDoc(doc(firestore, 'recetas', receta.id), actualizado);
      setRecetas((prev) => prev.map((r) => (r.id === receta.id ? actualizado : r)));
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar favorito.');
    }
  };

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 10 }}>Cargando tus recetas</Text>
      </View>
    );
  }

  if (recetas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Aun no tienes recetas creadas.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CrearRecetaScreen')}
          style={styles.btnCrear}
        >
          <Text style={styles.btnCrearTexto}>Crear mi primera receta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.recetaContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('DetalleRecetaScreen', { receta: item })}
        style={{ flexDirection: 'row', flex: 1 }}
      >
        <Image
          source={{
            uri:
              item.imagen ||
              'https://cdn.pixabay.com/photo/2017/02/23/13/05/smoothie-2096909_1280.jpg',
          }}
          style={styles.imagen}
        />
        <View style={styles.textoContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.botonFavorito}>
        <Ionicons
          name={item.favorito ? 'heart' : 'heart-outline'}
          size={26}
          color={item.favorito ? 'red' : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => eliminarReceta(item.id)} style={styles.botonEliminar}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7fff7', padding: 16 }}>
      <Text style={styles.titulo}>Mis Recetas</Text>

      <View style={styles.barraBusqueda}>
        <TextInput
          placeholder="Buscar por nombre o ingrediente..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={styles.input}
        />
      </View>

      <FlatList
        data={recetasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  barraBusqueda: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, borderColor: '#ccc', paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 12 },
  input: { flex: 1, padding: 8 },
  recetaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#dbf7d8', borderRadius: 10, overflow: 'hidden', elevation: 2 },
  imagen: { width: 100, height: 100 },
  textoContainer: { flex: 1, padding: 10, justifyContent: 'center' },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  descripcion: { color: '#000', marginTop: 5 },
  botonFavorito: { padding: 10 },
  botonEliminar: { padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#555', textAlign: 'center' },
  btnCrear: { marginTop: 20, backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  btnCrearTexto: { color: '#fff', fontWeight: 'bold' },
});
