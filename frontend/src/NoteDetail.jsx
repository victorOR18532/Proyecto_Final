import React from "react";

export default function NoteDetail({ note, onBack, onEdit }) {
  if (!note) return null;
  return (
    <div className="detail">
      <button className="link" onClick={onBack}>← Volver</button>
      <h2>{note.title}</h2>
      <div className="meta">Deporte: <strong>{note.sport}</strong> • Fecha: {new Date(note.createdAt).toLocaleString()}</div>
      <p className="detail-content">{note.content}</p>
      <div style={{marginTop:12}}>
        <button onClick={onEdit}>Editar</button>
      </div>
    </div>
  );
}
