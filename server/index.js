import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// TEST DB CONNECTION (optional)
async function testConnection() {
  try {
    const users = await prisma.UserEmails.findMany();
    console.log("DB connected. User count =", users.length);
  } catch (err) {
    console.error("DB Test Failed:", err);
  }
}

testConnection();

const app = express();
app.use(cors());
app.use(express.json());

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
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).send({ error: "email + password required" });

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const userId = crypto.randomUUID();

    await prisma.UserEmails.create({ data: { user_id: userId, email } });
    await prisma.UserPasswords.create({
      data: { user_id: userId, password_hash: passwordHash },
    });
    await prisma.UserNames.create({ data: { user_id: userId, name: name || null } });
    await prisma.UserCreationTimes.create({ data: { user_id: userId } });

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Could not create user" });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const emailRecord = await prisma.UserEmails.findUnique({ where: { email } });
  if (!emailRecord) return res.status(401).send({ error: "Invalid credentials" });

  const passRecord = await prisma.UserPasswords.findUnique({
    where: { user_id: emailRecord.user_id },
  });

  const match = await bcrypt.compare(password, passRecord.password_hash);
  if (!match) return res.status(401).send({ error: "Invalid credentials" });

  const token = jwt.sign({ id: emailRecord.user_id, email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

// CREATE INCIDENT
app.post("/incidents", authMiddleware, async (req, res) => {
  const { type, description, lat, lng, severity = 1 } = req.body;
  if (!type || lat == null || lng == null)
    return res.status(400).send({ error: "type + lat + lng required" });

  const incidentId = crypto.randomUUID();

  try {
    await prisma.IncidentTypes.create({ data: { incident_id: incidentId, type } });
    await prisma.IncidentDescriptions.create({
      data: { incident_id: incidentId, description },
    });
    await prisma.IncidentLocations.create({
      data: { incident_id: incidentId, latitude: lat, longitude: lng },
    });
    await prisma.IncidentSeverity.create({
      data: { incident_id: incidentId, severity },
    });
    await prisma.IncidentApprovalStatus.create({
      data: { incident_id: incidentId, approved: false },
    });
    await prisma.UserIncidentMap.create({
      data: { user_id: req.user.id, incident_id: incidentId },
    });

    res.json({ incidentId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Could not create incident" });
  }
});

// LIST INCIDENTS
app.get("/incidents", async (req, res) => {
  const types = await prisma.IncidentTypes.findMany({ take: 50 });
  const descriptions = await prisma.IncidentDescriptions.findMany();
  const locs = await prisma.IncidentLocations.findMany();
  const severity = await prisma.IncidentSeverity.findMany();
  const status = await prisma.IncidentApprovalStatus.findMany();

  const incidents = types.map((t) => ({
    id: t.incident_id,
    type: t.type,
    description:
      descriptions.find((d) => d.incident_id === t.incident_id)?.description || null,
    latitude: locs.find((l) => l.incident_id === t.incident_id)?.latitude || null,
    longitude: locs.find((l) => l.incident_id === t.incident_id)?.longitude || null,
    severity: severity.find((s) => s.incident_id === t.incident_id)?.severity || 1,
    approved: status.find((s) => s.incident_id === t.incident_id)?.approved || false,
    flagged: status.find((s) => s.incident_id === t.incident_id)?.flagged || false,  // Add this
  }));

  res.json(incidents);
});

// DELETE INCIDENT
app.delete("/incidents/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  console.log('===== DELETE REQUEST RECEIVED =====');
  console.log('Incident ID to delete:', id);
  console.log('User ID:', req.user.id);

  try {
    // Check if incident exists first
    const existingType = await prisma.IncidentTypes.findUnique({
      where: { incident_id: id }
    });
    
    console.log('Incident exists?', existingType ? 'YES' : 'NO');
    
    if (!existingType) {
      console.log('Incident not found');
      return res.status(404).send({ error: "Incident not found" });
    }

    // Delete from all related tables
    console.log('Deleting from IncidentTypes...');
    await prisma.IncidentTypes.deleteMany({ where: { incident_id: id } });
    
    console.log('Deleting from IncidentDescriptions...');
    await prisma.IncidentDescriptions.deleteMany({ where: { incident_id: id } });
    
    console.log('Deleting from IncidentLocations...');
    await prisma.IncidentLocations.deleteMany({ where: { incident_id: id } });
    
    console.log('Deleting from IncidentSeverity...');
    await prisma.IncidentSeverity.deleteMany({ where: { incident_id: id } });
    
    console.log('Deleting from IncidentApprovalStatus...');
    await prisma.IncidentApprovalStatus.deleteMany({ where: { incident_id: id } });
    
    console.log('Deleting from UserIncidentMap...');
    await prisma.UserIncidentMap.deleteMany({ where: { incident_id: id } });

    console.log('===== DELETE SUCCESS =====');
    res.json({ message: "Incident deleted successfully" });
  } catch (err) {
    console.error("===== DELETE ERROR =====");
    console.error("Delete error:", err);
    res.status(500).send({ error: "Could not delete incident", details: err.message });
  }
});

// VERIFY INCIDENT
// VERIFY INCIDENT
app.patch("/incidents/:id/verify", authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  console.log('===== VERIFY REQUEST RECEIVED =====');
  console.log('Incident ID to verify:', id);
  console.log('User ID:', req.user.id);

  try {
    // Check if incident exists
    const existingStatus = await prisma.IncidentApprovalStatus.findUnique({
      where: { incident_id: id }
    });
    
    if (!existingStatus) {
      console.log('Incident not found');
      return res.status(404).send({ error: "Incident not found" });
    }

    // Update approval status to true and clear flagged
    await prisma.IncidentApprovalStatus.update({
      where: { incident_id: id },
      data: { 
        approved: true,
        flagged: false  // Add this to clear flag when verified
      }
    });

    console.log('===== VERIFY SUCCESS =====');
    res.json({ message: "Incident verified successfully", approved: true, flagged: false });
  } catch (err) {
    console.error("===== VERIFY ERROR =====");
    console.error("Verify error:", err);
    res.status(500).send({ error: "Could not verify incident", details: err.message });
  }
});

// FLAG INCIDENT
app.patch("/incidents/:id/flag", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  console.log('===== FLAG REQUEST RECEIVED =====');
  console.log('Incident ID to flag:', id);
  console.log('Flag reason:', reason);
  console.log('User ID:', req.user.id);

  try {
    // Check if incident exists
    const existingStatus = await prisma.IncidentApprovalStatus.findUnique({
      where: { incident_id: id }
    });
    
    if (!existingStatus) {
      console.log('Incident not found');
      return res.status(404).send({ error: "Incident not found" });
    }

    // Update to flagged and not approved
    await prisma.IncidentApprovalStatus.update({
      where: { incident_id: id },
      data: { 
        approved: false,
        flagged: true  // Add this
      }
    });

    console.log('===== FLAG SUCCESS =====');
    res.json({ message: "Incident flagged successfully", approved: false, flagged: true, reason });
  } catch (err) {
    console.error("===== FLAG ERROR =====");
    console.error("Flag error:", err);
    res.status(500).send({ error: "Could not flag incident", details: err.message });
  }
});

// HOME
app.get("/", (req, res) => res.json({ message: "Server running" }));

// ZONES USE CASE
app.get("/usecase/map-danger-zones", async (req, res) => {
  const locs = await prisma.IncidentLocations.findMany();
  const types = await prisma.IncidentTypes.findMany();
  const severity = await prisma.IncidentSeverity.findMany();
  const status = await prisma.IncidentApprovalStatus.findMany();

  const result = locs.map((loc) => ({
    id: loc.incident_id,
    lat: loc.latitude,
    lng: loc.longitude,
    type: types.find((t) => t.incident_id === loc.incident_id)?.type || "unknown",
    severity: severity.find((s) => s.incident_id === loc.incident_id)?.severity || 1,
    approved: status.find((s) => s.incident_id === loc.incident_id)?.approved || false,
  }));

  res.json(result);
});




// START SERVER
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
