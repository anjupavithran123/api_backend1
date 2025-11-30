import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// -------------------------------------------------
// 🔥 IN-MEMORY STORAGE (NO DATABASE REQUIRED)
// -------------------------------------------------
let historyStore = [];
let collections = [];

// -------------------------------------------------
// 🔥 1. UNIVERSAL CORS PROXY
// -------------------------------------------------
app.post("/proxy", async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: "url and method are required" });
    }

    const axiosOptions = {
      method,
      url,
      headers: headers || {},
      validateStatus: () => true,
    };

    if (method.toUpperCase() !== "GET") {
      axiosOptions.data = body || {};
    }

    const response = await axios(axiosOptions);

    res.status(response.status).json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
  } catch (err) {
    console.error("Proxy ERROR:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
});

// -------------------------------------------------
// 🔥 2. HISTORY ROUTES
// -------------------------------------------------
app.post("/history", (req, res) => {
  historyStore.push({ id: Date.now(), ...req.body });
  res.json({ success: true });
});

app.get("/history", (req, res) => {
  res.json(historyStore);
});

// -------------------------------------------------
// 🔥 3. COLLECTION ROUTES
// -------------------------------------------------
app.post("/collections", (req, res) => {
  const newCollection = {
    id: Date.now().toString(),
    name: req.body.name,
    items: [],
  };
  collections.push(newCollection);
  res.json(newCollection);
});

app.get("/collections", (req, res) => {
  res.json(collections);
});

// -------------------------------------------------
// 🔥 4. COLLECTION ITEMS ROUTES
// -------------------------------------------------
app.post("/collections/:id/items", (req, res) => {
  const { id } = req.params;
  const collection = collections.find((c) => c.id === id);

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  const newItem = { id: Date.now(), ...req.body };
  collection.items.push(newItem);

  res.json(newItem);
});

app.get("/collections/:id/items", (req, res) => {
  const { id } = req.params;
  const collection = collections.find((c) => c.id === id);

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  res.json(collection.items);
});

// -------------------------------------------------
// HOME ROUTE
// -------------------------------------------------
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// -------------------------------------------------
// START SERVER
// -------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Backend running on port", PORT);
});
