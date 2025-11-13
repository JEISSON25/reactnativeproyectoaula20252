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
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
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

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setNewPhoto(response.assets[0]);
        setPhoto(response.assets[0]);
      }
    });
  };

  const uploadImage = async (imageUri) => {
    const filename = `pets/${currentUser.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
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
        photoURL = await uploadImage(newPhoto.uri);
      }

      const petRef = doc(db, 'pets', pet.id);
      await updateDoc(petRef, {
        name,
        species,
        breed,
        age: parseInt(age),
        photoURL,
        updatedAt: new Date()
      });

      Alert.alert('Éxito', 'Mascota actualizada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);

    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      Alert.alert('Error', 'No se pudo actualizar la mascota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Editar Mascota</Text>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton} onPress={selectImage}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>+ Cambiar Foto</Text>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  photoText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  photoHint: {
    color: '#666',
    fontSize: 12,
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