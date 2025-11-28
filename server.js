import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow long JSON

// -----------------------------
// 🔥 Universal CORS Proxy (FIXED)
// -----------------------------
app.post("/proxy", async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: "url and method are required" });
    }

    // Build axios request config
    const axiosOptions = {
      method,
      url,
      headers: headers || {},
      validateStatus: () => true, // allow all status codes
    };

    // ❗ Include data **only** if method is not GET
    if (method.toUpperCase() !== "GET") {
      axiosOptions.data = body || {};
    }

    // Forward the request
    const response = await axios(axiosOptions);

    // Return forwarded response
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

// -----------------------------
// Start server
// -----------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log("🚀 Proxy server running on port", PORT);
});
