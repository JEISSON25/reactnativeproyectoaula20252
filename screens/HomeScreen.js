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
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Pressable } from 'react-native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const recetas = [
  {
    id: '1',
    nombre: 'Ensalada de Quinoa',
    descripcion: 'Quinoa con vegetales frescos y aderezo ligero.',
    foto: require('../assets/recursos/ensalada-quinoa.jpg'),
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
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('DetalleRecetaScreen', {
          nombre: item.nombre,
          foto: item.foto,
          descripcion: item.descripcion,
          ingredientes: item.ingredientes,
          pasos: item.pasos,
        })
      }
      style={styles.recetaContainer}
    >
      <Image source={item.foto} style={styles.imagen} />
      <View style={styles.textoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={recetas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recetaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagen: {
    width: 100,
    height: 100,
  },
  textoContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  descripcion: {
    color: '#555',
    marginTop: 4,
  },
});

export default HomeScreen;
