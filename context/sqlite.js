import * as SQLite from "expo-sqlite";

// hecho por camilo pa manejar toda la base sqlite del modo offline
const openDb = async () => {
  try {
    return await SQLite.openDatabaseAsync("app.db");
  } catch (e) {
    console.log("error abriendo la base de datos:", e);
    throw e;
  }
};

// inicializa las tablas si no existen
export const initDB = async () => {
  try {
    const db = await openDb();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users_local (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT,
        email TEXT UNIQUE,
        username TEXT,
        password TEXT,
        isSynced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT,
        level TEXT,
        duration TEXT,
        CaloriasTotales INTEGER DEFAULT 0,
        exercises TEXT,
        createdAt TEXT,
        isSynced INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS routines_pending (
        id TEXT PRIMARY KEY,
        userId TEXT,
        payload TEXT,
        createdAt TEXT,
        isSynced INTEGER DEFAULT 0
      );
    `);

    console.log("base de datos sqlite inicializada bien");
  } catch (err) {
    console.log("error inicializando base sqlite:", err);
  }
};

// guarda un usuario localmente
// creo qeu esta parte la estbaa haciendo camilo xd
export const saveLocalUser = async ({
  uid = null,
  email,
  username = null,
  plainPassword = null,
  isSynced = 0,
}) => {
  try {
    const db = await openDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO users_local (uid, email, username, password, isSynced)
       VALUES (?,?,?,?,?);`,
      [uid, email, username, plainPassword, isSynced ? 1 : 0]
    );
    console.log(`usuario local guardado: ${email}`);
  } catch (err) {
    console.log("error guardando usuario local:", err);
  }
};

// busca usuario por correo (yo pense qeu esto no servia pero si funciona jaja)
export const getLocalUserByEmail = async (email) => {
  const db = await openDb();
  const result = await db.getFirstAsync(
    `SELECT * FROM users_local WHERE email = ? LIMIT 1;`,
    [email]
  );
  return result || null;
};

// verifica si la contrasena coincide localmente
export const verifyLocalPassword = async (email, plainPassword) => {
  const user = await getLocalUserByEmail(email);
  if (!user) return false;
  if (user.password !== plainPassword) return false;
  return user;
};

// obtiene todos los usuarios locales
// esto lo dejo andre pero luego santiago lo acomodo pq se dañaba
export const getAllLocalUsers = async () => {
  try {
    const db = await openDb();
    const result = await db.getAllAsync(`SELECT * FROM users_local;`);
    return result || [];
  } catch (err) {
    console.log("error trayendo usuarios locales:", err);
    return [];
  }
};

// marca usuario como sincronizado (creo qeu no lo usaba nadie pero igual lo dejo)
export const markUserSynced = async (email, firebaseUid) => {
  const db = await openDb();
  await db.runAsync(
    `UPDATE users_local SET isSynced = 1, uid = ? WHERE email = ?;`,
    [firebaseUid, email]
  );
};

// trae los usuarios pendientes por sincronizar
export const getPendingLocalUsers = async () => {
  const db = await openDb();
  return await db.getAllAsync(`SELECT * FROM users_local WHERE isSynced = 0;`);
};

// guarda rutina traida desde firebase
// att camilo: si se rompe esta parte no toquen, solo recarguen xd
export const saveRoutineFromFirebase = async (routine) => {
  const db = await openDb();
  const {
    id,
    userId,
    name,
    level,
    duration,
    CaloriasTotales = 0,
    exercises,
    createdAt,
  } = routine;

  await db.runAsync(
    `INSERT OR REPLACE INTO routines (id, userId, name, level, duration, CaloriasTotales, exercises, createdAt, isSynced)
     VALUES (?,?,?,?,?,?,?, ?,1);`,
    [
      id,
      userId,
      name,
      level,
      duration,
      CaloriasTotales,
      JSON.stringify(exercises || []),
      createdAt || new Date().toISOString(),
    ]
  );
  console.log(`rutina sincronizada: ${name}`);
};

// guarda rutina pendiente cuando esta offline
// creo qeu brahian fue el que le puso esto pero no me acuerdo jaja
export const savePendingRoutine = async (routine) => {
  const db = await openDb();
  const payload = {
    ...routine,
    CaloriasTotales: routine.CaloriasTotales ?? 0,
    exercises: routine.exercises || [],
  };
  await db.runAsync(
    `INSERT OR REPLACE INTO routines_pending (id, userId, payload, createdAt, isSynced)
     VALUES (?,?,?,?,0);`,
    [
      payload.id,
      payload.userId,
      JSON.stringify(payload),
      payload.createdAt || new Date().toISOString(),
    ]
  );
  console.log(`rutina pendiente guardada local: ${payload.name}`);
};

// obtiene las rutinas del usuario (funciona bien pero hay qeu limpiar a veces)
export const getRoutinesByUserId = async (userId) => {
  const db = await openDb();
  const result = await db.getAllAsync(
    `SELECT * FROM routines WHERE userId = ?;`,
    [userId]
  );
  return result.map((r) => ({
    ...r,
    CaloriasTotales: r.CaloriasTotales ?? 0,
    exercises: JSON.parse(r.exercises || "[]"),
  }));
};

// obtiene las rutinas pendientes
export const getPendingRoutines = async () => {
  const db = await openDb();
  const result = await db.getAllAsync(
    `SELECT * FROM routines_pending WHERE isSynced = 0;`
  );
  return result.map((r) => ({
    ...r,
    payload: JSON.parse(r.payload || "{}"),
  }));
};

// marca rutina pendiente como sincronizada
// att santiago: si falla esto es porque no hay id, asi me paso
export const markRoutinePendingSynced = async (id) => {
  const db = await openDb();
  await db.runAsync(
    `UPDATE routines_pending SET isSynced = 1 WHERE id = ?;`,
    [id]
  );
  console.log(`rutina pendiente ${id} marcada como sincronizada`);
};

// export general pa que no se dañe cuando se importe
export default {
  initDB,
  saveLocalUser,
  getLocalUserByEmail,
  verifyLocalPassword,
  getAllLocalUsers,
  markUserSynced,
  getPendingLocalUsers,
  saveRoutineFromFirebase,
  savePendingRoutine,
  getRoutinesByUserId,
  getPendingRoutines,
  markRoutinePendingSynced,
};
