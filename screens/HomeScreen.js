/*import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContexto } from '../contextos/AuthContexto';
const HomeScreen = () => {
 const { usuario, cerrarSesion } = useContext(AuthContexto);
 return (
 <View style={{ flex: 1, justifyContent: 'center', alignItems:
'center' }}>
 {usuario ? (
 <>
 <Text>¡Bienvenido, {usuario.nombre}! </Text>
 <Button title="Cerrar sesión " onPress={cerrarSesion} />

 </>
 ) : (
 <Text>No has iniciado sesión </Text>
 )}
 </View>
 );
};
export default HomeScreen;*/
import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const recetas = [
  {
    id: '1',
    nombre: 'Ensalada de Quinoa',
    descripcion: 'Quinoa con vegetales frescos y aderezo ligero.',
    foto: require('../assets/recursos/ensalada-quinoa.jpg'),
    categoria: 'Saludable',
    ingredientes: ['Quinoa', 'Tomate', 'Pepino', 'Zanahoria', 'Aceite de oliva'],
    pasos: [
      'Cocinar la quinoa.',
      'Picar los vegetales.',
      'Mezclar todo con aceite de oliva.',
      'Servir fresco.',
    ],
  },
  {
    id: '2',
    nombre: 'Smoothie Verde',
    descripcion: 'Batido de espinaca, plátano y manzana.',
    foto: require('../assets/recursos/smoothie-verde.jpg'),
    categoria: 'Bebida',
    ingredientes: ['Espinaca', 'Plátano', 'Manzana', 'Agua', 'Hielo'],
    pasos: [
      'Colocar todos los ingredientes en la licuadora.',
      'Licuar hasta obtener una mezcla homogénea.',
      'Servir en un vaso grande.',
    ],
  },
  {
    id: '3',
    nombre: 'Bowl de Avena',
    descripcion: 'Avena cocida con frutas y nueces.',
    foto: require('../assets/recursos/bowl-avena.jpg'),
    categoria: 'Desayuno',
    ingredientes: ['Avena', 'Leche', 'Frutas', 'Nueces', 'Miel'],
    pasos: [
      'Cocinar la avena con leche.',
      'Agregar frutas picadas y nueces.',
      'Endulzar con miel al gusto.',
      'Servir caliente o frío.',
    ],
  },
];

const HomeScreen = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [favoritos, setFavoritos] = useState([]);

  // 🔹 Cargar favoritos guardados (offline)
  useEffect(() => {
    const cargarFavoritos = async () => {
      const data = await AsyncStorage.getItem('favoritos');
      if (data) setFavoritos(JSON.parse(data));
    };
    cargarFavoritos();
  }, []);

  // 🔹 Guardar favoritos cuando cambian
  useEffect(() => {
    AsyncStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // 🔹 Agregar o quitar favoritos
  const toggleFavorito = (receta) => {
    const esFavorita = favoritos.some((f) => f.id === receta.id);
    if (esFavorita) {
      setFavoritos(favoritos.filter((f) => f.id !== receta.id));
    } else {
      setFavoritos([...favoritos, receta]);
    }
  };

  // 🔹 Icono de menú hamburguesa
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 15 }}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      ),
      title: 'Recetas Saludables',
    });
  }, [navigation]);

  // 🔹 Filtro de recetas
  const recetasFiltradas = recetas.filter((r) => {
    const coincideBusqueda =
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ingredientes.some((ing) =>
        ing.toLowerCase().includes(busqueda.toLowerCase())
      );
    const coincideCategoria = categoriaSeleccionada
      ? r.categoria === categoriaSeleccionada
      : true;
    return coincideBusqueda && coincideCategoria;
  });

  // 🔹 Renderizar cada receta
  const renderItem = ({ item }) => {
    const esFavorita = favoritos.some((f) => f.id === item.id);
    return (
      <View style={styles.recetaContainer}>
        <Pressable
          onPress={() => navigation.navigate('DetalleRecetaScreen', { ...item })}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          <Image source={item.foto} style={styles.imagen} />
          <View style={styles.textoContainer}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
          </View>
        </Pressable>

        {/* ❤️ Botón de favorito */}
        <TouchableOpacity
          onPress={() => toggleFavorito(item)}
          style={styles.botonFavorito}
        >
          <Ionicons
            name={esFavorita ? 'heart' : 'heart-outline'}
            size={26}
            color={esFavorita ? 'red' : 'gray'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f7fff7' }}>
      {/* 🔍 Barra de búsqueda */}
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

      {/* 🟢 Filtros */}
      <View style={styles.filtros}>
        {['Saludable', 'Bebida', 'Desayuno'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.botonFiltro,
              categoriaSeleccionada === cat && styles.botonActivo,
            ]}
            onPress={() =>
              setCategoriaSeleccionada(
                categoriaSeleccionada === cat ? null : cat
              )
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

      {/* 📋 Lista de recetas */}
      {recetasFiltradas.length > 0 ? (
        <FlatList
          data={recetasFiltradas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 10 }}
        />
      ) : (
        <Text style={styles.sinResultados}>No se encontraron recetas.</Text>
      )}
    </View>
  );
};

// 🎨 Estilos
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
  input: {
    flex: 1,
    padding: 8,
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  botonFiltro: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#5bb450',
  },
  botonActivo: {
    backgroundColor: '#5bb450',
  },
  textoFiltro: {
    color: '#333',
  },
  textoActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#dbf7d8',
    borderRadius: 10,
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
  sinResultados: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#777',
  },
});

export default HomeScreen;
