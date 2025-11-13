import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import { db } from "../firebaseConfig";
// no se confundan en esta parte, esto en pocas palabras bros hace que el usduario metas tantos en casillas y ya que ese dato se meta en la variable y listo
const CreateRoutineScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isAppOnline } = useOffline();

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [CaloriasTotales, setCaloriasTotales] = useState("");
  const [exercises, setExercises] = useState([]);


  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("");

  const [exerciseReps, setExerciseReps] = useState("");

  const [exerciseDescription, setExerciseDescription] = useState("");

  const [exerciseVideoUrl, setExerciseVideoUrl] = useState("");

  const [exerciseImageUrl, setExerciseImageUrl] = useState("");

  const [imageUri, setImageUri] = useState(null);

  // hecho por camlo pa crear rutinas personalizadas, tanto offline como online
  const selectImage = () => {
    const options = { mediaType: "photo" };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setImageUri(asset.uri);
        setExerciseImageUrl(asset.uri);
        console.log("imagen seleccionada:", asset.uri);
      }
    });
  };

  const addExercise = () => {
    if (!exerciseName || !exerciseReps || !exerciseSets) {
      Alert.alert("error", "llena todos los campos del ejercicio");
      return;
    }
    const newExercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: exerciseSets,
      reps: exerciseReps,
      description: exerciseDescription,
      videoUrl: exerciseVideoUrl,
      imageUrl: imageUri || exerciseImageUrl,
    };
    console.log("agregando ejercicio:", exerciseName);
    setExercises([...exercises, newExercise]);
    setExerciseName("");
    setExerciseSets("");
    setExerciseReps("");
    setExerciseDescription("");
    setExerciseVideoUrl("");
    setExerciseImageUrl("");
    setImageUri(null);
  };

  const saveRoutine = async () => {
    if (!name || !level || !duration || !CaloriasTotales || exercises.length === 0) {
      Alert.alert("error", "falta llenar campos antes de guardar");
      return;
    }

    const routineData = {
      userId: user ? user.uid : null,
      name,
      level,
      duration,
      CaloriasTotales: parseFloat(CaloriasTotales),
      exercises,
      createdAt: new Date().toISOString(),
      isOffline: !isAppOnline,
      id: Date.now().toString(),
    };

    try {
      console.log("guardando rutina...");
      const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
      const routines = storedRoutines ? JSON.parse(storedRoutines) : [];
      routines.push(routineData);
      await AsyncStorage.setItem("offlineRoutines", JSON.stringify(routines));

      if (isAppOnline && user) {
        console.log("sincronizando rutina con firebase...");
        await addDoc(collection(db, "customRoutines"), { ...routineData, isOffline: false });
        Alert.alert("exito", "rutina sincronizada correctamente");
        const updated = routines.filter((r) => r.id !== routineData.id);
        await AsyncStorage.setItem("offlineRoutines", JSON.stringify(updated));
      } else {
        console.log("guardando rutina local, sin conexion");
        Alert.alert("guardado", "rutina guardada localmente");
      }

      navigation.goBack();
    } catch (error) {
      console.log("error guardando rutina:", error);
      Alert.alert("error", "no se pudo guardar la rutina");
    }
  };

  return (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>crear rutina  </Text>

      <TextInput
        style={styles.input}
        placeholder="nombre"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="nivel"
        placeholderTextColor="#888"
        value={level}
        onChangeText={setLevel}
      />
        <TextInput
        style={styles.input}
        placeholder="duracion (min)"
        keyboardType="numeric"
        placeholderTextColor="#888"
        value={duration}
        onChangeText={setDuration}
      />
       <TextInput
        style={styles.input}
        placeholder="calorias totales"
        keyboardType="numeric"
        placeholderTextColor="#888"
        value={CaloriasTotales}
        onChangeText={setCaloriasTotales}
      />

      <Text style={styles.subtitle}>ejercicios</Text>

      <TextInput
        style={styles.input}
        placeholder="nombre del ejercicio"
        placeholderTextColor="#888"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      <TextInput
        style={styles.input}
        placeholder="sets"
        keyboardType="numeric"
        placeholderTextColor="#888"
        value={exerciseSets}
        onChangeText={setExerciseSets}
      />
      <TextInput
        style={styles.input}
        placeholder="reps o tiempo"
        placeholderTextColor="#888"
        value={exerciseReps}
        onChangeText={setExerciseReps}
      />
      <TextInput
        style={styles.input}
        placeholder="descripcion"
        placeholderTextColor="#888"
        value={exerciseDescription}
        onChangeText={setExerciseDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="video (opcional)"
        placeholderTextColor="#888"
        value={exerciseVideoUrl}
        onChangeText={setExerciseVideoUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="imagen (opcional)"
        placeholderTextColor="#888"
        value={exerciseImageUrl}
        onChangeText={setExerciseImageUrl}
      />

      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>seleccionar imagen</Text>
      </TouchableOpacity>

      {imageUri && <Text style={styles.textSmall}>imagen {imageUri.split("/").pop()}</Text>}

      <TouchableOpacity style={styles.button} onPress={addExercise}>
        <Text style={styles.buttonText}>agregar ejercicio</Text>
      </TouchableOpacity>

      {exercises.map((ex) => (
        <View key={ex.id} style={styles.exerciseBox}>
          <Text style={styles.text}>{ex.name}</Text>
          <Text style={styles.textSmall}>
            {ex.sets} sets x {ex.reps}
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.buttonGreen} onPress={saveRoutine}>
        <Text style={styles.buttonText}>guardar rutina</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// att andre: reviso la parte de imagenes pa que no se rompa cuando el usuario cancele
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  title: { color: "#fff", fontSize: 20, textAlign: "center", marginBottom: 15 },
  subtitle: { color: "#FF6B00", fontSize: 16, marginVertical: 10 },
  input: { backgroundColor: "#1a1a1a", color: "#fff", padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#FF6B00", padding: 10, marginTop: 5, alignItems: "center" },
  buttonGreen: { backgroundColor: "#34C759", padding: 10, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff" },
  text: { color: "#fff" },
  textSmall: { color: "#ccc", fontSize: 12, marginBottom: 4 },
  exerciseBox: { backgroundColor: "#1a1a1a", padding: 8, marginVertical: 4 },
});

export default CreateRoutineScreen;
