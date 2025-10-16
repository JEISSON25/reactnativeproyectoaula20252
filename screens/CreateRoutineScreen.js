import { addDoc, collection } from "firebase/firestore";
import * as ImagePicker from "react-native-image-picker"; // Importar ImagePicker
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext"; // Importar contexto offline
import { db } from "../firebaseConfig";


// Versión original sin localcache

const CreateRoutineScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isAppOnline } = useOffline(); // Usar el estado de la app (online/offline)
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState([]);

  // Variables para cada ejercicio
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("");
  const [exerciseReps, setExerciseReps] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [exerciseVideoUrl, setExerciseVideoUrl] = useState("");
  const [exerciseImageUrl, setExerciseImageUrl] = useState("");
  const [imageUri, setImageUri] = useState(null); // Estado para la URI de la imagen seleccionada

  // Agregar ejercicio a la lista
  const addExercise = () => {
    if (!exerciseName || !exerciseReps || !exerciseSets) {
      Alert.alert("Error", "Debes llenar todos los campos del ejercicio");
      return;
    }

    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: exerciseName,
        sets: exerciseSets,
        reps: exerciseReps,
        description: exerciseDescription,
        videoUrl: exerciseVideoUrl,
        imageUrl: imageUri || exerciseImageUrl, // Usar imageUri si está disponible, sino la URL manual
      },
    ]);

    // Limpiar inputs
    setExerciseName("");
    setExerciseSets("");
    setExerciseReps("");
    setExerciseDescription("");
    setExerciseVideoUrl("");
    setExerciseImageUrl("");
    setImageUri(null); // Limpiar la URI de la imagen seleccionada
  };

  // Función para seleccionar imagen
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setExerciseImageUrl(asset.uri); // También actualizamos el campo de URL para que se muestre
      }
    });
  };

  const saveRoutine = async () => {
    if (!name || !level || !duration || exercises.length === 0) {
      Alert.alert("Error", "Completa todos los campos antes de guardar");
      return;
    }

    const routineData = {
      userId: user ? user.uid : null,
      name,
      level,
      duration,
      exercises,
      createdAt: new Date().toISOString(),
      isOffline: !isAppOnline, // Usar el estado de la app para determinar si es offline
      id: Date.now().toString(),
    };

    try {
      // Siempre guardar localmente primero
      const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
      const routines = storedRoutines ? JSON.parse(storedRoutines) : [];
      routines.push(routineData);
      await AsyncStorage.setItem("offlineRoutines", JSON.stringify(routines));

      if (isAppOnline && user) {
        // Si está online y logueado, intentar sincronizar inmediatamente
        await addDoc(collection(db, "customRoutines"), {
          ...routineData,
          isOffline: false,
          userId: user.uid,
        });
        Alert.alert("Éxito", "Rutina creada y sincronizada correctamente.");
        // Eliminar la rutina del almacenamiento local después de la sincronización exitosa
        const updatedRoutines = routines.filter((r) => r.id !== routineData.id);
        await AsyncStorage.setItem("offlineRoutines", JSON.stringify(updatedRoutines));
      } else {
        // Si está offline o no logueado, solo guardar localmente
        Alert.alert("Éxito", "Rutina guardada localmente. Se sincronizará cuando la aplicación esté online y hayas iniciado sesión.");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error guardando rutina:", error);
      Alert.alert("Error", "No se pudo guardar la rutina.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Rutina</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la rutina"
        placeholderTextColor="#A1A1A6"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nivel (ej: Principiante)"
        placeholderTextColor="#A1A1A6"
        value={level}
        onChangeText={setLevel}
      />
      <TextInput
        style={styles.input}
        placeholder="Duración en minutos"
        keyboardType="numeric"
        placeholderTextColor="#A1A1A6"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.subtitle}>Ejercicios</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del ejercicio"
        placeholderTextColor="#A1A1A6"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Sets"
        keyboardType="numeric"
        placeholderTextColor="#A1A1A6"
        value={exerciseSets}
        onChangeText={setExerciseSets}
      />
      <TextInput
        style={styles.input}
        placeholder="Repeticiones (ej: 10 o 20 seg)"
        placeholderTextColor="#A1A1A6"
        value={exerciseReps}
        onChangeText={setExerciseReps}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción del ejercicio"
        placeholderTextColor="#A1A1A6"
        value={exerciseDescription}
        onChangeText={setExerciseDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="URL del Video (opcional)"
        placeholderTextColor="#A1A1A6"
        value={exerciseVideoUrl}
        onChangeText={setExerciseVideoUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="URL de la Imagen (opcional)"
        placeholderTextColor="#A1A1A6"
        value={exerciseImageUrl}
        onChangeText={setExerciseImageUrl}
      />

      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {imageUri && <Text style={styles.imageSelectedText}>Imagen seleccionada: {imageUri.substring(imageUri.lastIndexOf('/') + 1)}</Text>}

      <TouchableOpacity style={styles.button} onPress={addExercise}>
        <Text style={styles.buttonText}>Agregar Ejercicio</Text>
      </TouchableOpacity>

      {exercises.map((ex) => (
        <View key={ex.id} style={styles.exerciseCard}>
          <Text style={styles.exerciseText}>{ex.name}</Text>
          <Text style={styles.exerciseText}>
            {ex.sets} sets x {ex.reps} reps
          </Text>
          {ex.description ? (
            <Text style={styles.exerciseText}>{ex.description}</Text>
          ) : null}
          {ex.videoUrl ? (
            <Text style={styles.exerciseText}>Video: {ex.videoUrl}</Text>
          ) : null}
          {ex.imageUrl ? (
            <Text style={styles.exerciseText}>Imagen: {ex.imageUrl}</Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveRoutine}>
        <Text style={styles.buttonText}>Guardar Rutina</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateRoutineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1C1C1E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#FF6B00",
  },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6B00",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  imageButton: {
    backgroundColor: "#1E90FF", // Un color diferente para el botón de imagen
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: "#2C2C2E",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
  },
  exerciseText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  imageSelectedText: {
    color: "#34C759",
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
});