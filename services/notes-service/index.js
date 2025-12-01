// services/notes-service/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const client = require("prom-client");

// Firebase Admin SDK
const admin = require("firebase-admin");

// ----- Initialize Firebase Admin -----
// 1) Option A: Use service account JSON (recommended for server).
// Put serviceAccountKey.json in this folder (NOT in public repo) and uncomment below:

// const serviceAccount = require("./serviceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
// const db = admin.firestore();

// 2) Option B: Use environment variable GOOGLE_APPLICATION_CREDENTIALS pointing to JSON path (safer).
// For local testing, Option A is easiest.

if (!admin.apps.length) {
  // If not configured, initialize default app (useful for local dev with emulator or fallback)
  try {
    admin.initializeApp();
  } catch (err) {
    console.warn("Firebase admin init warning:", err.message);
  }
}
const db = admin.firestore ? admin.firestore() : null;

// ----- Express app -----
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- Prometheus metrics -----
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.05, 0.1, 0.5, 1, 1.5, 2, 5],
});

// Middleware to observe duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Basic health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// CRUD routes (use Firestore if available, otherwise in-memory fallback)
let inMemory = [];
const collectionName = "notes";

app.post("/notes", async (req, res) => {
  const { title, content, sport } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });

  try {
    if (db) {
      const docRef = await db.collection(collectionName).add({
        title, content, sport, createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return res.status(201).json({ id: docRef.id, ...doc.data() });
    } else {
      const id = Date.now().toString();
      const note = { id, title, content, sport, createdAt: new Date().toISOString() };
      inMemory.unshift(note);
      return res.status(201).json(note);
    }
  } catch (err) {
    console.error("Create error:", err);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/notes", async (req, res) => {
  try {
    if (db) {
      const snap = await db.collection(collectionName).orderBy("createdAt", "desc").get();
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json(arr);
    } else {
      return res.json(inMemory);
    }
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "internal" });
  }
});

app.get("/notes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (db) {
      const doc = await db.collection(collectionName).doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: "not found" });
      return res.json({ id: doc.id, ...doc.data() });
    } else {
      const note = inMemory.find(n => n.id === id);
      if (!note) return res.status(404).json({ error: "not found" });
      return res.json(note);
    }
  } catch (err) {
    console.error("Get error:", err);
    res.status(500).json({ error: "internal" });
  }
});

app.put("/notes/:id", async (req, res) => {
  const id = req.params.id;
  const { title, content, sport } = req.body;
  try {
    if (db) {
      await db.collection(collectionName).doc(id).update({ title, content, sport, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const updated = await db.collection(collectionName).doc(id).get();
      return res.json({ id: updated.id, ...updated.data() });
    } else {
      const idx = inMemory.findIndex(n => n.id === id);
      if (idx === -1) return res.status(404).json({ error: "not found" });
      inMemory[idx] = { ...inMemory[idx], title, content, sport, updatedAt: new Date().toISOString() };
      return res.json(inMemory[idx]);
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "internal" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (db) {
      await db.collection(collectionName).doc(id).delete();
      return res.json({ ok: true });
    } else {
      inMemory = inMemory.filter(n => n.id !== id);
      return res.json({ ok: true });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "internal" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`notes-service listening on ${PORT}`));
app.put("/notes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content, sport } = req.body;

  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Nota no encontrada" });

  notes[index] = { id, title, content, sport };

  res.json(notes[index]);
});
