// Script para inicializar datos de ejemplo en Firestore

// Importamos lo necesario de Firebase: inicializar la app y trabajar con Firestore
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";

// Configuración de Firebase (la de tu proyecto en Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBp6z1ioxfVxoHuWBjOSLPxQTsyo5tdZx4", // API Key para conectar con Firebase
  authDomain: "traininfo-9141d.firebaseapp.com",      // Dominio de autenticación
  projectId: "traininfo-9141d",                      // ID del proyecto en Firebase
  storageBucket: "traininfo-9141d.firebasestorage.app", // Almacenamiento de archivos
  messagingSenderId: "939950371526",                 // ID para el servicio de mensajería
  appId: "1:939950371526:web:92d108949dae20d2ae9dc7", // ID único de la app
  measurementId: "G-HLPT695NGW"                      // ID para Google Analytics (opcional)
};

// Inicializamos la app de Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Obtenemos la referencia a la base de datos Firestore
const db = getFirestore(app);

// Datos de ejemplo: rutinas con ejercicios
const sampleRoutines = [
  {
    name: 'Rutina Principiante', // Nombre de la rutina
    description: 'Rutina ideal para personas que están comenzando con el ejercicio', // Descripción
    duration: 30,  // Duración en minutos
    level: 'Principiante', // Nivel de dificultad
    exercises: [   // Lista de ejercicios
      {
        id: 'ex1',
        name: 'Flexiones',
        sets: 2,
        reps: 10,
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
        reps: '20 seg',
        description: 'Mantener posición de plancha, cuerpo recto como una tabla'
      }
    ]
  },
  {
    name: 'Rutina Intermedia',
    description: 'Para personas con experiencia básica en ejercicio',
    duration: 45,
    level: 'Intermedio',
    exercises: [
      {
        id: 'ex4',
        name: 'Flexiones',
        sets: 3,
        reps: 15,
        description: 'Flexiones de pecho tradicionales'
      },
      {
        id: 'ex5',
        name: 'Sentadillas',
        sets: 3,
        reps: 20,
        description: 'Sentadillas con peso corporal'
      },
      {
        id: 'ex6',
        name: 'Plancha',
        sets: 3,
        reps: '30 seg',
        description: 'Mantener posición de plancha'
      },
      {
        id: 'ex7',
        name: 'Burpees',
        sets: 3,
        reps: 8,
        description: 'Ejercicio completo de cuerpo'
      }
    ]
  },
  {
    name: 'Rutina Avanzada',
    description: 'Rutina intensa para personas con experiencia',
    duration: 60,
    level: 'Avanzado',
    exercises: [
      {
        id: 'ex8',
        name: 'Flexiones',
        sets: 4,
        reps: 20,
        description: 'Flexiones de pecho tradicionales'
      },
      {
        id: 'ex9',
        name: 'Sentadillas con salto',
        sets: 4,
        reps: 15,
        description: 'Sentadillas explosivas con salto'
      },
      {
        id: 'ex10',
        name: 'Plancha',
        sets: 4,
        reps: '45 seg',
        description: 'Mantener posición de plancha'
      },
      {
        id: 'ex11',
        name: 'Burpees',
        sets: 4,
        reps: 12,
        description: 'Ejercicio completo de cuerpo'
      },
      {
        id: 'ex12',
        name: 'Mountain Climbers',
        sets: 4,
        reps: 20,
        description: 'Escaladores en posición de plancha'
      }
    ]
  }
];

// Función para inicializar los datos en Firestore
async function initializeData() {
  try {
    console.log('Iniciando la carga de datos de ejemplo...');
    
    // Recorremos cada rutina y la insertamos en la colección "routines"
    for (const routine of sampleRoutines) {
      // addDoc inserta el documento y genera un ID único automáticamente
      const docRef = await addDoc(collection(db, 'routines'), routine);
      console.log(`Rutina "${routine.name}" agregada con ID: ${docRef.id}`);
    }
    
    console.log('¡Datos de ejemplo agregados exitosamente!');
  } catch (error) {
    // Si ocurre un error, lo mostramos en consola
    console.error('Error agregando datos de ejemplo:', error);
  }
}

// Ejecutamos la función para insertar los datos
initializeData();
