import React, { createContext, useState } from 'react';
export const AuthContexto = createContext();

export const ProveedorAuth = ({ children }) => {
 const [usuario, setUsuario] = useState(null);
 const iniciarSesion = (datosUsuario) => {

 setUsuario(datosUsuario);
 };
 const cerrarSesion = () => {
 setUsuario(null);
 };
 return (
 <AuthContexto.Provider value={{ usuario, iniciarSesion, cerrarSesion
}}>
 {children}
 </AuthContexto.Provider>
 );
};