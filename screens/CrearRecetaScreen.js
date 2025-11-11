import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,Image,StyleSheet,ScrollView,Alert,ActivityIndicator,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import {saveOfflineRecipe,getOfflineRecipes,markRecipeSynced,} from '../database';

const firestore = getFirestore(app);
const auth = getAuth(app);

export default function CrearRecetaScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [pasos, setPasos] = useState('');
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // revisar si hay recetas pendientes por sincronizar
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        await sincronizarRecetasPendientes();
      }
    });
    return () => unsubscribe();
  }, []);

  // funcion para coger imagenes de galeria
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a las imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  //subir imagen a la nube Cloudinary, porque, firebase estorage es de paga
  const subirACloudinary = async (uri) => {
    try {
      let localUri = uri;
      if (!uri.startsWith('file://')) {
        localUri = 'file://' + uri;
      }

      const data = new FormData();
      data.append('file', { uri: localUri, type: 'image/jpeg', name: `receta_${Date.now()}.jpg` });
      data.append('upload_preset', 'recetas');

      const res = await fetch(`https://api.cloudinary.com/v1_1/dt2kwkgch/image/upload`, {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!json.secure_url) throw new Error('No se pudo subir la imagen a Cloudinary');
      return json.secure_url;
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);
      return null;
    }
  };

  //funcion guardar receta
  const guardarReceta = async () => {
    if (!nombre || !descripcion || !ingredientes || !pasos) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
      Alert.alert('Error', 'No hay usuario autenticado.');
      return;
    }

    setSubiendo(true);

    try {
      const recetaId = Date.now().toString();
      let imageUrl = null;

      if (imagen) {
        // subir a la nube solo si se tiene conexion
        imageUrl = isConnected ? await subirACloudinary(imagen) : imagen;
      }

      const receta = {
        id: recetaId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        ingredientes: ingredientes.split(',').map((i) => i.trim()),
        pasos: pasos.split('.').map((p) => p.trim()).filter((p) => p.length > 0),
        imagen: imageUrl, // url de la imagen en cloudinary
        usuario: usuarioActual.email,
        creadoEn: new Date(),
        sincronizado: isConnected && !!imageUrl,
      };

      //para guardar offline
      await saveOfflineRecipe(receta);

      //para subir a firestore solo si hay conexion
      if (isConnected && imageUrl) {
        await setDoc(doc(firestore, 'recetas', receta.id), receta);
        await markRecipeSynced(receta.id);
        Alert.alert('✅ Éxito', 'Receta guardada y sincronizada correctamente.');
      } else {
        Alert.alert(
          '⚠️ Sin conexión',
          'Receta guardada en Mis Recetas. Se sincronizará automáticamente cuando tengas internet.'
        );
      }

      limpiarCampos();
    } catch (error) {
      console.error('Error guardando receta:', error);
      Alert.alert('Error', 'Ocurrió un error guardando la receta.');
    } finally {
      setSubiendo(false);
    }
  };

  const limpiarCampos = () => {
    setNombre('');
    setDescripcion('');
    setIngredientes('');
    setPasos('');
    setImagen(null);
  };

  //para sincronizar recetas pendientes
  const sincronizarRecetasPendientes = async () => {
    try {
      const pendientes = await getOfflineRecipes();
      for (const r of pendientes) {
        if (!r.sincronizado) {
          let imageUrl = r.imagen ?? null;
          if (r.imagen && !r.imagen.startsWith('http')) {
            imageUrl = await subirACloudinary(r.imagen);
          }

          const recetaFirestore = {
            id: r.id,
            nombre: r.nombre ?? '',
            descripcion: r.descripcion ?? '',
            ingredientes: r.ingredientes ?? [],
            pasos: r.pasos ?? [],
            imagen: imageUrl ?? null,
            usuario: r.usuario ?? '',
            creadoEn: r.creadoEn ?? new Date(),
            sincronizado: true,
          };

          await setDoc(doc(firestore, 'recetas', r.id), recetaFirestore);
          await markRecipeSynced(r.id);
        }
      }

      if (pendientes.some((r) => !r.sincronizado)) {
        Alert.alert('✅ Sincronización completada', 'Tus recetas se han cargado correctamente.');
      }
    } catch (error) {
      console.error('Error sincronizando recetas pendientes:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.titulo}>Crear nueva receta</Text>

      <TouchableOpacity style={styles.selectorImagen} onPress={seleccionarImagen}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.imagen} />
        ) : (
          <Text style={styles.textoImagen}>📸 Toca para agregar una imagen</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la receta"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción breve"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Ingredientes (separa por comas)"
        value={ingredientes}
        onChangeText={setIngredientes}
        multiline
      />

      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Pasos (separa por puntos)"
        value={pasos}
        onChangeText={setPasos}
        multiline
      />

      <TouchableOpacity
        style={[styles.boton, subiendo && { backgroundColor: '#aaa' }]}
        onPress={guardarReceta}
        disabled={subiendo}
      >
        {subiendo ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Guardar receta</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#3b3b3b' },
  selectorImagen: {
    height: 220,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imagen: { width: '100%', height: '100%', borderRadius: 15 },
  textoImagen: { color: '#777', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
  },
  boton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
