import * as SQLite from "expo-sqlite";

// Crear o abrir la base de datos modo async
let dbInstance = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  // Crear conexion con la base de datos
  dbInstance = await SQLite.openDatabaseAsync("users.db");

  // Crear la tabla si no existe
  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT,
      email TEXT UNIQUE,
      password TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  console.log("Base de datos SQLite inicializada correctamente");
  return dbInstance;
};
