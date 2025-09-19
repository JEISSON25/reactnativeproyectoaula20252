// Fixed AddPetScreen.js
// Changes: Removed misplaced test button to 'Tree'. Added cancel button at the bottom.
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
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function AddPetScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: ''
  });
  const [photo, setPhoto] = useState(null);
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

  const handleSavePet = async () => {
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
      let photoURL = null;
      
      if (photo) {
        photoURL = await uploadImage(photo.uri);
      }

      await addDoc(collection(db, 'pets'), {
        name,
        species,
        breed,
        age: parseInt(age),
        photoURL,
        userId: currentUser.uid,
        createdAt: new Date()
      });

      Alert.alert('Éxito', 'Mascota registrada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);

    } catch (error) {
      console.error('Error al guardar mascota:', error);
      Alert.alert('Error', 'No se pudo registrar la mascota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Registrar Nueva Mascota</Text>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton} onPress={selectImage}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>+ Agregar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
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

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSavePet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Registrar Mascota</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
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
  saveButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
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