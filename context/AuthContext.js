import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import sqlite from "./sqlite";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  //aca guardamos el usuario actual
  const [user, setUser] = useState(null);
  //controla si aun esta cargando los datos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    //conexion a sqlite
    const init = async () => {
      try {
        await sqlite.initDB();//inicia la base de datos
      } catch (err) {
        console.error("Error al inicializar SQLite:", err);
      }

      //verificamos si hay usuario logueado en firebase
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser || null);//guarda el usuario actual o o lo deja en nulo si no hay sesion
        setLoading(false);//deja de cargar
      });
    };

    init();

    //limpia la suscripcion
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  //iniciando sesion local sin internet
  const signInLocal = (localUser) => {
    const u = {
      uid: localUser.uid || "local- "+ localUser.id,//genera un id local si non hay 
      email: localUser.email,
    };
    setUser(u);//se guarda el usuario local 
    setLoading(false);
    console.log("Sesión local iniciada:", u.email);
  };

   //cerrar sesion local sin internet
  const signOutLocal = () => {
    setUser(null);//se limpia el usuario
    console.log("Sesión local cerrada");
  };

   //los valores que se comparte al contexto
  const value = {
    user,
    loading,
    signInLocal,
    signOutLocal,
    setUser,
  };

  //retorna el contexto
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
