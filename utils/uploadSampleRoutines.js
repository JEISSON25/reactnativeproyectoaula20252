/*import { addDoc, collection } from "firebase/firestore";
import { sampleRoutines } from "../data/sampleData";
import { db } from "../firebaseConfig";

export const uploadSampleRoutines = async () => {
  try {
 
    for (const routine of sampleRoutines) {
      // Si no tiene CaloriasTotales, calcula un estimado
      const CaloriasTotales =
        routine.CaloriasTotales ||
        routine.exercises?.reduce((sum, ex) => sum + (ex.CaloriasQuemadas || 0), 0) ||
        Math.floor(Math.random() * 150 + 100); // valor estimado

      await addDoc(collection(db, "routines"), {
        id: routine.id,
        name: routine.name,
        description: routine.description,
        duration: routine.duration,
        level: routine.level,
        CaloriasTotales,
        exercises: routine.exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          description: ex.description,
          imageUrl: ex.imageUrl || "",
          videoUrl: ex.videoUrl || "",
        })),
        createdAt: new Date().toISOString(),
      });
  
    }

  
  } catch (error) {
    console.error("Error subiendo rutinas:", error);
  }
};
*/
// comente este codigo para evitar que se vueva a subir las rutinas 