import React, { useEffect, useState, useMemo } from "react";
import NoteDetail from "./NoteDetail";
import Login from "./Login";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080"; // nginx LB

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sport, setSport] = useState("");

  const [selectedNote, setSelectedNote] = useState(null); // modal edit
  const [detailNote, setDetailNote] = useState(null); // vista separada

  // filtros
  const [filterSport, setFilterSport] = useState("");
  const [filterDate, setFilterDate] = useState(""); // yyyy-mm-dd

  // paginación
  const [page, setPage] = useState(1);
  const perPage = 5;

  // login
  const [token, setToken] = useState(localStorage.getItem("extToken") || null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch(`${API}/notes`);
      const data = await res.json();
      // Asegurar que cada nota tenga createdAt para filtrar (si backend no lo envía, crearlo aquí)
      const normalized = data.map(n => ({ createdAt: n.createdAt || new Date().toISOString(), ...n }));
      // ordenar por fecha descendente
      normalized.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(normalized);
    } catch (err) {
      console.error("fetchNotes", err);
      alert("Error al obtener notas");
    }
  }

  async function createNote() {
    if (!title) return alert("Título requerido");
    if (!token) return alert("Debes iniciar sesión para crear notas");

    const res = await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, content, sport })
    });
    if (res.ok) {
      const n = await res.json();
      setNotes([ { createdAt: new Date().toISOString(), ...n }, ...notes ]);
      setTitle(""); setContent(""); setSport("");
      setPage(1);
    } else {
      alert("Error al crear nota");
    }
  }

  async function removeNote(id) {
    if (!token) return alert("Debes iniciar sesión para eliminar");
    const res = await fetch(`${API}/notes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setNotes(notes.filter(n => n.id !== id));
    } else {
      alert("Error al eliminar nota");
    }
  }

  async function updateNote() {
    if (!selectedNote) return;
    if (!selectedNote.title) return alert("Título requerido");
    if (!token) return alert("Debes iniciar sesión para editar");

    const res = await fetch(`${API}/notes/${selectedNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: selectedNote.title,
        content: selectedNote.content,
        sport: selectedNote.sport
      })
    });

    if (res.ok) {
      const updated = await res.json();
      setNotes(notes.map(n => n.id === updated.id ? { createdAt: updated.createdAt || n.createdAt, ...updated } : n));
      setSelectedNote(null); // cerrar modal
      if (detailNote && detailNote.id === updated.id) setDetailNote(updated);
    } else {
      alert("Error al actualizar nota");
    }
  }

  // filtros y paginación client-side
  const filtered = useMemo(() => {
    return notes.filter(n => {
      if (filterSport && !n.sport?.toLowerCase().includes(filterSport.toLowerCase())) return false;
      if (filterDate) {
        const noteDate = new Date(n.createdAt).toISOString().slice(0,10);
        if (noteDate !== filterDate) return false;
      }
      return true;
    });
  }, [notes, filterSport, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  // login handlers
  function handleLogin(tokenValue) {
    setToken(tokenValue);
    localStorage.setItem("extToken", tokenValue);
  }
  function handleLogout() {
    setToken(null);
    localStorage.removeItem("extToken");
  }

  return (
    <div className="container">
      <div className="topbar">
        <h1>ExtremeNotes (Deportes Extremos)</h1>
        <div className="auth">
          {token ? (
            <>
              <button className="link" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </div>

      {/* Form creación */}
      <div className="form">
        <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Deporte" value={sport} onChange={e=>setSport(e.target.value)} />
        <textarea placeholder="Contenido" value={content} onChange={e=>setContent(e.target.value)} />
        <button onClick={createNote} disabled={!token}>Crear nota</button>
        {!token && <small>Inicia sesión para crear/editar/eliminar</small>}
      </div>

      <hr/>

      {/* Filtros */}
      <div className="filters">
        <input placeholder="Filtrar por deporte" value={filterSport} onChange={e=>setFilterSport(e.target.value)} />
        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        <button onClick={() => { setFilterSport(""); setFilterDate(""); }}>Limpiar filtros</button>
      </div>

      {/* Lista o vista detalle */}
      {detailNote ? (
        <NoteDetail note={detailNote} onBack={() => setDetailNote(null)} onEdit={() => setSelectedNote(detailNote)} />
      ) : (
        <>
          <ul className="notes">
            {paginated.map(n => (
              <li key={n.id}>
                <div className="note-head">
                  <strong>{n.title}</strong>
                  <span className="meta">{n.sport} • {new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p>{n.content}</p>
                <div className="note-actions">
                  <button onClick={()=>setSelectedNote(n)} disabled={!token}>Editar</button>
                  <button onClick={()=>removeNote(n.id)} disabled={!token}>Eliminar</button>
                  <button onClick={()=>setDetailNote(n)}>Ver detalles</button>
                </div>
              </li>
            ))}
          </ul>

          {/* paginación */}
          <div className="pagination">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>«</button>
            <span> Página {page} / {totalPages} </span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>»</button>
          </div>
        </>
      )}

      {/* modal de edición */}
      {selectedNote && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar nota</h2>

            <input
              value={selectedNote.title}
              onChange={e => setSelectedNote({ ...selectedNote, title: e.target.value })}
            />

            <input
              value={selectedNote.sport}
              onChange={e => setSelectedNote({ ...selectedNote, sport: e.target.value })}
            />

            <textarea
              value={selectedNote.content}
              onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
            />

            <div className="modal-actions">
              <button className="primary" onClick={updateNote}>Guardar</button>
              <button onClick={() => setSelectedNote(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
