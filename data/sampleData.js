// Datos de ejemplo para rutinas (se usarán en caso de que no haya datos en la base de datos)
export const sampleRoutines = [
  {
    id: 'routine1', // Identificador único de la rutina
    name: 'Rutina Principiante', // Nombre de la rutina
    description: 'Rutina ideal para personas que están comenzando con el ejercicio', // Descripción breve
    duration: 30, // Duración estimada en minutos
    level: 'Principiante', // Nivel de dificultad
    // Lista de ejercicios incluidos en la rutina
    exercises: [
      {
        id: 'ex1',
        name: 'Flexiones',
        sets: 2, // Número de series
        reps: 10, // Número de repeticiones
        description: 'Flexiones de pecho tradicionales, puedes hacerlas con las rodillas apoyadas si es necesario'
      },
      {
        id: 'ex2',
        name: 'Sentadillas',
        sets: 2,
        reps: 15,
        description: 'Sentadillas con peso corporal, mantén la espalda recta'
      },
      {
        id: 'ex3',
        name: 'Plancha',
        sets: 2,
        reps: '20 seg', // Aquí las repeticiones se miden en segundos
        description: 'Mantener posición de plancha, cuerpo recto como una tabla'
      }
    ]
  },
  {
    id: 'routine2',
    name: 'Rutina Intermedia',
    description: 'Para personas con experiencia básica en ejercicio',
    duration: 45,
    level: 'Intermedio',
    exercises: [
      { id: 'ex4', name: 'Flexiones', sets: 3, reps: 15, description: 'Flexiones de pecho tradicionales' },
      { id: 'ex5', name: 'Sentadillas', sets: 3, reps: 20, description: 'Sentadillas con peso corporal' },
      { id: 'ex6', name: 'Plancha', sets: 3, reps: '30 seg', description: 'Mantener posición de plancha' },
      { id: 'ex7', name: 'Burpees', sets: 3, reps: 8, description: 'Ejercicio completo de cuerpo' }
    ]
  },
  {
    id: 'routine3',
    name: 'Rutina Avanzada',
    description: 'Rutina intensa para personas con experiencia',
    duration: 60,
    level: 'Avanzado',
    exercises: [
      { id: 'ex8', name: 'Flexiones', sets: 4, reps: 20, description: 'Flexiones de pecho tradicionales' },
      { id: 'ex9', name: 'Sentadillas con salto', sets: 4, reps: 15, description: 'Sentadillas explosivas con salto' },
      { id: 'ex10', name: 'Plancha', sets: 4, reps: '45 seg', description: 'Mantener posición de plancha' },
      { id: 'ex11', name: 'Burpees', sets: 4, reps: 12, description: 'Ejercicio completo de cuerpo' },
      { id: 'ex12', name: 'Mountain Climbers', sets: 4, reps: 20, description: 'Escaladores en posición de plancha' }
    ]
  }
];

// Función para inicializar datos en Firestore (se recomienda ejecutar solo una vez)
export const initializeFirestoreData = async (db) => {
  // Importa dinámicamente las funciones necesarias de Firestore
  const { collection, addDoc } = await import('firebase/firestore');
  
  try {
    // Recorre todas las rutinas de ejemplo y las guarda en la colección "routines"
    for (const routine of sampleRoutines) {
      await addDoc(collection(db, 'routines'), {
        name: routine.name,
        description: routine.description,
        duration: routine.duration,
        level: routine.level,
        exercises: routine.exercises
      });
    }
    // Mensaje en consola cuando se agregan los datos correctamente
    console.log('Datos de ejemplo agregados a Firestore');
  } catch (error) {
    // Si algo falla, se muestra el error en consola
    console.error('Error agregando datos de ejemplo:', error);
  }
};
