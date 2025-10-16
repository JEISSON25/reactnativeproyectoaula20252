// Datos de ejemplo para rutinas por grupo muscular
export const sampleRoutinesByMuscle = [
  {
    id: 'abdominales1',
    name: 'Rutina de Abs - 3 días por semana',
    description: 'Ejercicios enfocados en el abdomen y core',
    duration: 25,
    level: 'Intermedio',
    exercises: [
      { id: 'abdominales_ex1', name: 'Crunches', sets: 3, reps: 20, description: 'Acuéstate boca arriba y eleva el torso sin despegar la zona lumbar.' },
      { id: 'abdominales_ex2', name: 'Plancha', sets: 3, reps: '30 seg', description: 'Mantén el cuerpo recto apoyado en antebrazos y puntas de pies.' },
      { id: 'abdominales_ex3', name: 'Bicicleta', sets: 3, reps: 20, description: 'Movimiento alternado de piernas simulando pedalear con crunch lateral.' },
      { id: 'abdominales_ex4', name: 'Elevaciones de piernas', sets: 3, reps: 15, description: 'Mantén la espalda recta en el suelo y eleva ambas piernas al mismo tiempo.' },
    ]
  },
  {
    id: 'pierna1',
    name: 'Rutina de Piernas - 2 días por semana',
    description: 'Fortalece cuádriceps, glúteos y femorales',
    duration: 40,
    level: 'Principiante',
    exercises: [
      { id: 'pierna_ex1', name: 'Sentadillas', sets: 3, reps: 15, description: 'Sentadillas con peso corporal.' },
      { id: 'pierna_ex2', name: 'Zancadas', sets: 3, reps: 12, description: 'Da un paso al frente y baja hasta 90° alternando piernas.' },
      { id: 'pierna_ex3', name: 'Puente de glúteos', sets: 3, reps: 15, description: 'Acuéstate boca arriba, eleva la cadera contrayendo glúteos.' },
      { id: 'pierna_ex4', name: 'Sentadilla isométrica (pared)', sets: 3, reps: '30 seg', description: 'Apóyate en la pared y mantén la posición a 90°.' },
    ]
  },
  {
    id: 'pecho1',
    name: 'Rutina de Pecho - 2 días por semana',
    description: 'Ejercicios para pecho, hombros y tríceps',
    duration: 35,
    level: 'Intermedio',
    exercises: [
      { id: 'pecho_ex1', name: 'Flexiones', sets: 3, reps: 12, description: 'Flexiones de pecho tradicionales.' },
      { id: 'pecho_ex2', name: 'Flexiones diamante', sets: 3, reps: 10, description: 'Junta las manos en forma de diamante para trabajar tríceps y pecho interno.' },
      { id: 'pecho_ex3', name: 'Flexiones declinadas', sets: 3, reps: 10, description: 'Coloca los pies elevados para trabajar el pecho superior.' },
      { id: 'pecho_ex4', name: 'Dips entre sillas', sets: 3, reps: 8, description: 'Fondo de tríceps usando dos sillas o barras paralelas.' },
    ]
  },
  {
    id: 'espalda1',
    name: 'Rutina de Espalda - 2 días por semana',
    description: 'Fortalece dorsales, trapecios y lumbares',
    duration: 40,
    level: 'Avanzado',
    exercises: [
      { id: 'espalda_ex1', name: 'Superman', sets: 3, reps: 15, description: 'Acuéstate boca abajo, eleva brazos y piernas al mismo tiempo.' },
      { id: 'espalda_ex2', name: 'Plancha lateral', sets: 3, reps: '20 seg', description: 'Mantén el cuerpo recto apoyado de lado en el antebrazo.' },
      { id: 'espalda_ex3', name: 'Remo invertido (mesa/barra)', sets: 3, reps: 12, description: 'Usa una superficie firme para jalar el cuerpo hacia arriba.' },
      { id: 'espalda_ex4', name: 'Hiperextensiones', sets: 3, reps: 15, description: 'Acostado boca abajo, eleva el torso contrayendo lumbares.' },
    ]
  },
  {
    id: 'brazos1',
    name: 'Rutina de Brazos - 2 días por semana',
    description: 'Enfoque en bíceps, tríceps y antebrazos',
    duration: 30,
    level: 'Principiante',
    exercises: [
      { id: 'brazos_ex1', name: 'Flexiones con agarre cerrado', sets: 3, reps: 12, description: 'Trabajan más los tríceps.' },
      { id: 'brazos_ex2', name: 'Curl con botellas de agua', sets: 3, reps: 15, description: 'Imita curl de bíceps con peso casero.' },
      { id: 'brazos_ex3', name: 'Fondos en banco', sets: 3, reps: 12, description: 'Apoya las manos en un banco y baja el torso.' },
      { id: 'brazos_ex4', name: 'Curl de martillo', sets: 3, reps: 12, description: 'Usa mancuernas o botellas manteniendo las palmas enfrentadas.' },
    ]
  },
  {
    id: 'cuerpocompleto1',
    name: 'Rutina cuerpo completo - 3 días por semana',
    description: 'Entrenamiento completo de todo el cuerpo',
    duration: 50,
    level: 'Intermedio',
    exercises: [
      { id: 'cuerpocompleto_ex1', name: 'Burpees', sets: 3, reps: 10, description: 'Ejercicio completo de cuerpo, incluye salto y flexión.' },
      { id: 'cuerpocompleto_ex2', name: 'Sentadillas', sets: 3, reps: 15, description: 'Ejercicio básico para piernas y glúteos.' },
      { id: 'cuerpocompleto_ex3', name: 'Flexiones', sets: 3, reps: 12, description: 'Ejercicio clásico para pecho y brazos.' },
      { id: 'cuerpocompleto_ex4', name: 'Mountain Climbers', sets: 3, reps: 20, description: 'Ejercicio de abdomen y cardio intenso.' },
      { id: 'cuerpocompleto_ex5', name: 'Plancha', sets: 3, reps: '45 seg', description: 'Resistencia isométrica para core.' },
    ]
  }
];

// Función para inicializar datos en Firestore
export const initializeFirestoreData = async (db) => {
  const { collection, addDoc } = await import('firebase/firestore');
  try {
    for (const routine of sampleRoutinesByMuscle) {
      await addDoc(collection(db, 'routines'), {
        name: routine.name,
        description: routine.description,
        duration: routine.duration,
        level: routine.level,
        exercises: routine.exercises
      });
    }
    console.log('Rutinas por grupo muscular agregadas a Firestore');
  } catch (error) {
    console.error('Error agregando rutinas:', error);
  }
};
