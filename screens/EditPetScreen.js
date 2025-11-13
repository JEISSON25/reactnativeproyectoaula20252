import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function EditPetScreen({ route, navigation }) {
  const { pet } = route.params;
  const [formData, setFormData] = useState({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age.toString()
  });
  const [photo, setPhoto] = useState(pet.photoURL ? { uri: pet.photoURL } : null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Solicitar permisos
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Necesarios',
          'Necesitamos acceso a tu galería para seleccionar fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const selectImage = async () => {
    console.log('📸 Iniciando selección de imagen para editar...');
    
    // Solicitar permisos primero
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Resultado de ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Nueva imagen seleccionada:', result.assets[0].uri);
        setNewPhoto(result.assets[0]);
        setPhoto(result.assets[0]);
      } else {
        console.log('Selección de imagen cancelada');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + error.message);
    }
  };

  const uploadImage = async (imageUri) => {
    console.log('Subiendo nueva imagen a Firebase Storage...');
    const filename = `pets/${currentUser.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Imagen subida exitosamente:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  };

  const handleUpdatePet = async () => {
    const { name, species, breed, age } = formData;

    if (!name || !species || !breed || !age) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (isNaN(age) || age <= 0) {
      Alert.alert('Error', 'La edad debe ser un número válido');
      return;
    }

    setLoading(true);

    try {
      let photoURL = pet.photoURL;
      
      if (newPhoto) {
        console.log('Subiendo nueva foto de mascota...');
        photoURL = await uploadImage(newPhoto.uri);
      }

      console.log('Actualizando mascota en Firestore...');
      const petRef = doc(db, 'pets', pet.id);
      await updateDoc(petRef, {
        name,
        species,
        breed,
        age: parseInt(age),
        photoURL,
        updatedAt: new Date()
      });

      console.log('Mascota actualizada exitosamente');
      Alert.alert('Éxito', 'Mascota actualizada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);

    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      Alert.alert('Error', 'No se pudo actualizar la mascota: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Editar Mascota</Text>

        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={selectImage}
            activeOpacity={0.7}
          >
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Cambiar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Toca para cambiar la foto</Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la mascota"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Especie (Ej: Perro, Gato)"
            value={formData.species}
            onChangeText={(value) => handleInputChange('species', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Raza"
            value={formData.breed}
            onChangeText={(value) => handleInputChange('breed', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Edad (años)"
            value={formData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdatePet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Actualizar Mascota</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  photoText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  photoHint: {
    color: '#666',
    fontSize: 13,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  formSection: {
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    gap: 15,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    height: 50,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});