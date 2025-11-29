import express from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// -----------------------------------------------
// 🔌 CONNECT SUPABASE
// -----------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// -----------------------------------------------
// ✅ ROUTE: Home
// -----------------------------------------------
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// -----------------------------------------------
// 🔥 Universal Proxy
// -----------------------------------------------
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
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
});

// ======================================================
// 🧠 HISTORY ROUTES
// ======================================================

// Save history
app.post("/history", async (req, res) => {
  const { user_id, request, response } = req.body;

  const { data, error } = await supabase
    .from("history")
    .insert({ user_id, request, response });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// Get history
app.get("/history", async (req, res) => {
  const { user_id } = req.query;

  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// ======================================================
// 📁 COLLECTION ROUTES
// ======================================================

// Create collection
app.post("/collections", async (req, res) => {
  const { user_id, name } = req.body;

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id, name });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// List collections
app.get("/collections", async (req, res) => {
  const { user_id } = req.query;

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user_id);

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// ======================================================
// 📌 COLLECTION ITEMS ROUTES
// ======================================================

// Add item
app.post("/collections/:id/items", async (req, res) => {
  const { id } = req.params;
  const { request, response } = req.body;

  const { data, error } = await supabase
    .from("collection_items")
    .insert({ collection_id: id, request, response });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// Get items
app.get("/collections/:id/items", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("collection_items")
    .select("*")
    .eq("collection_id", id);

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
