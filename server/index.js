import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./simple-db.js";

// TEST DB CONNECTION
function testConnection() {
  try {
    const users = db.users.findAll ? db.users.findAll() : [];
    console.log("✅ Simple DB connected. User count =", users.length);
  } catch (err) {
    console.error("DB Test Failed:", err);
  }
}

testConnection();

const app = express();
app.use(cors());
app.use(express.json());

// Error handling middleware (must be last)
// app.use((err, req, res, next) => {
//   console.error("Express error middleware:", err);
//   res.status(500).json({ error: err.message, stack: err.stack });
// });

const JWT_SECRET = process.env.JWT_SECRET || "replace_in_prod";

// AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).send({ error: "Missing auth header" });

  const token = h.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).send({ error: "Invalid token" });
  }
}

// SIGN-UP
app.post("/auth/signup", async (req, res) => {
  console.log("=== SIGNUP REQUEST ===");
  console.log("Body:", JSON.stringify(req.body));
  const { email, password, name } = req.body;
  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).send({ error: "email + password required" });
  }
  console.log("Starting signup for:", email);

  try {
    // Check if user already exists
    const existing = db.users.findByEmail(email);
    if (existing) {
      return res.status(400).send({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const user = await db.users.create({
      email,
      passwordHash,
      name: name || null
    });
    console.log("User created:", user.id);

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
    console.log("Token generated, signup successful!");
    res.json({ token });
  } catch (e) {
    console.error("=== SIGNUP ERROR ===");
    console.error("Error object:", e);
    console.error("Message:", e?.message || String(e));
    console.error("Code:", e?.code);
    console.error("Name:", e?.name || e?.constructor?.name);
    if (e?.stack) {
      console.error("Stack:", e.stack.substring(0, 1000));
    }
    
    // Send full error details
    res.status(500).send({ 
      error: "Could not create user", 
      details: e?.message || String(e),
      code: e?.code,
      name: e?.name || e?.constructor?.name
    });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.users.findByEmail(email);
  if (!user) return res.status(401).send({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).send({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

// CREATE INCIDENT
app.post("/incidents", authMiddleware, async (req, res) => {
  const { type, description, lat, lng, severity = 1 } = req.body;
  if (!type || lat == null || lng == null)
    return res.status(400).send({ error: "type + lat + lng required" });

  try {
    const incident = await db.incidents.create({
      type,
      description: description || null,
      latitude: lat,
      longitude: lng,
      severity,
      approved: false,
      userId: req.user.id
    });

    res.json({ incidentId: incident.id });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Could not create incident" });
  }
});

// LIST INCIDENTS
app.get("/incidents", async (req, res) => {
  const incidents = db.incidents.findAll();
  res.json(incidents);
});

// HOME
app.get("/", (req, res) => res.json({ message: "Server running" }));

// MINIMAL TEST
app.post("/test-simple", (req, res) => {
  res.json({ message: "Simple test works", body: req.body });
});

// TEST SIGNUP ROUTE
app.post("/test-signup", async (req, res) => {
  console.log("TEST SIGNUP CALLED");
  res.json({ message: "Test signup route works", body: req.body });
});

// ZONES USE CASE
app.get("/usecase/map-danger-zones", async (req, res) => {
  const incidents = db.incidents.findAll();
  const result = incidents.map((inc) => ({
    id: inc.id,
    lat: inc.latitude,
    lng: inc.longitude,
    type: inc.type || "unknown",
    severity: inc.severity || 1,
    approved: inc.approved || false,
  }));

  res.json(result);
});


// START SERVER
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
