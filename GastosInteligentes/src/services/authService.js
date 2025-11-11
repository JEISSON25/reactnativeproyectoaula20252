import NetInfo from "@react-native-community/netinfo";
import { auth } from "../config/firebase";
import { getDB } from "./database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";


export const registerUser = async (email, password) => {
  const netInfo = await NetInfo.fetch();
  const db = await getDB();

  if (netInfo.isConnected) {
  //Online entonces guardar en firebase y guardar local
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    await db.runAsync(
      `INSERT OR REPLACE INTO users (uid, email, password, synced)
       VALUES (?, ?, ?, 1);`,
      [uid, email, password]
    );

    console.log("Usuario creado online y guardado localmente");
    return { uid, email, online: true };
  } else {
     //offline Guardar localmente
    await db.runAsync(
      `INSERT INTO users (uid, email, password, synced)
       VALUES (?, ?, ?, 0);`,
      [null, email, password]
    );

    console.log("Usuario registrado offline (pendiente de sincronizar)");
    return { email, uid: null, online: false };
  }
};

//Login usuario (funciona online y offline)
export const loginUser = async (email, password) => {
  const netInfo = await NetInfo.fetch();
  const db = await getDB();

  if (netInfo.isConnected) {
    // online validar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    await db.runAsync(
      `INSERT OR REPLACE INTO users (uid, email, password, synced)
       VALUES (?, ?, ?, 1);`,
      [uid, email, password]
    );

    console.log("Login online exitoso y sincronizado");
    return { uid, email, online: true };
  } else {
    //offline entonces Validar local
    const results = await db.getAllAsync("SELECT * FROM users WHERE email = ?;", [email]);
    const user = results[0];

    if (!user) throw new Error("Usuario no encontrado localmente");
    if (user.password !== password) throw new Error("Contraseña incorrecta");

    console.log("Login offline exitoso");
    return { uid: user.uid, email: user.email, online: false };
  }
};
