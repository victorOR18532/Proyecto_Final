import React, { useState } from "react";

/**
 * Login simple de ejemplo.
 * En un caso real llamarías a un endpoint de auth y guardarías token.
 */
export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  async function doLogin() {
    if (!user || !pass) return alert("Usuario y contraseña requeridos");
    // simulación: cualquier credencial devuelve token "demo-token"
    // reemplaza por fetch a tu endpoint real si tienes auth backend
    const fakeToken = "demo-token";
    onLogin(fakeToken);
  }

  return (
    <div className="login-inline">
      <input placeholder="Usuario" value={user} onChange={e=>setUser(e.target.value)} />
      <input placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
      <button onClick={doLogin}>Entrar</button>
    </div>
  );
}
