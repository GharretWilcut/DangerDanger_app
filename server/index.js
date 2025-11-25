require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// KAFKA SETUP
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "danger-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
(async () => { await producer.connect(); })();


const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'replace_in_prod';

// auth middleware
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).send({ error: 'Missing auth header' });

  const token = h.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).send({ error: 'Invalid token' });
  }
}

//signup API
app.post("/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).send({ error: "email + password required" });

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const userId = crypto.randomUUID();

    // Write to fragmented tables
    await prisma.userEmails.create({
      data: { user_id: userId, email }
    });

    await prisma.userPasswords.create({
      data: { user_id: userId, password_hash: passwordHash }
    });

    await prisma.userNames.create({
      data: { user_id: userId, name: name || null }
    });

    await prisma.userCreationTimes.create({
      data: { user_id: userId }
    });

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Could not create user" });
  }
});

//Login API
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const emailRecord = await prisma.userEmails.findUnique({
    where: { email }
  });

  if (!emailRecord)
    return res.status(401).send({ error: "Invalid credentials" });

  const passRecord = await prisma.userPasswords.findUnique({
    where: { user_id: emailRecord.user_id }
  });

  const match = await bcrypt.compare(password, passRecord.password_hash);
  if (!match) return res.status(401).send({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: emailRecord.user_id, email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

//create Incident api
app.post("/incidents", authMiddleware, async (req, res) => {
  const { type, description, lat, lng, severity = 1 } = req.body;

  if (!type || lat == null || lng == null)
    return res.status(400).send({ error: "type + lat + lng required" });

  const incidentId = crypto.randomUUID();

  try {
    await prisma.incidentTypes.create({
      data: { incident_id: incidentId, type }
    });

    await prisma.incidentDescriptions.create({
      data: { incident_id: incidentId, description }
    });

    await prisma.incidentLocations.create({
      data: { incident_id: incidentId, latitude: lat, longitude: lng }
    });

    await prisma.incidentSeverity.create({
      data: { incident_id: incidentId, severity }
    });

    await prisma.incidentApprovalStatus.create({
      data: { incident_id: incidentId, approved: false }
    });

    // Link incident to user (no FK)
    await prisma.userIncidentMap.create({
      data: {
        user_id: req.user.id,
        incident_id: incidentId
      }
    });

    res.json({ incidentId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Could not create incident" });
  }
});

// list incidents api
app.get("/incidents", async (req, res) => {
  const types = await prisma.incidentTypes.findMany({ take: 50 });
  const descriptions = await prisma.incidentDescriptions.findMany();
  const locs = await prisma.incidentLocations.findMany();
  const severity = await prisma.incidentSeverity.findMany();
  const status = await prisma.incidentApprovalStatus.findMany();

  // Join them manually
  const incidents = types.map(t => {
    return {
      id: t.incident_id,
      type: t.type,
      description: descriptions.find(d => d.incident_id === t.incident_id)?.description || null,
      latitude: locs.find(l => l.incident_id === t.incident_id)?.latitude || null,
      longitude: locs.find(l => l.incident_id === t.incident_id)?.longitude || null,
      severity: severity.find(s => s.incident_id === t.incident_id)?.severity || 1,
      approved: status.find(s => s.incident_id === t.incident_id)?.approved || false
    };
  });

  res.json(incidents);
});

app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server listening on " + port));

//submit reports api
app.post("/usecase/submit-report", authMiddleware, async (req, res) => {
  const { type, description, lat, lng, severity = 1 } = req.body;

  if (!type || lat == null || lng == null)
    return res.status(400).send({ error: "type, lat, lng required" });

  const incidentId = crypto.randomUUID();

  try {
    // Store fragmented incident
    await prisma.incidentTypes.create({ data: { incident_id: incidentId, type } });
    await prisma.incidentDescriptions.create({ data: { incident_id: incidentId, description } });
    await prisma.incidentLocations.create({ data: { incident_id: incidentId, latitude: lat, longitude: lng } });
    await prisma.incidentSeverity.create({ data: { incident_id: incidentId, severity } });
    await prisma.incidentApprovalStatus.create({ data: { incident_id: incidentId, approved: false } });

    await prisma.userIncidentMap.create({
      data: { user_id: req.user.id, incident_id: incidentId }
    });

    // Kafka: Event for EDA
    await producer.send({
      topic: "incident.created",
      messages: [{ value: JSON.stringify({ incidentId, type, lat, lng, severity }) }]
    });

    res.json({ incidentId, status: "PENDING_VALIDATION" });
  } catch (e) {
    res.status(500).send({ error: "Could not create incident" });
  }
});

//verify api
app.post("/usecase/verify-validity/:id", async (req, res) => {
  const { id } = req.params;

  const incident = await prisma.incidentApprovalStatus.findUnique({
    where: { incident_id: id }
  });

  if (!incident) return res.status(404).send({ error: "Incident not found" });

  await prisma.incidentApprovalStatus.update({
    where: { incident_id: id },
    data: { approved: true }
  });

  // Kafka event
  await producer.send({
    topic: "incident.validated",
    messages: [{ value: JSON.stringify({ incident_id: id, approved: true }) }]
  });

  res.json({ status: "VALIDATED" });
});

// verify location
app.post("/usecase/verify-location", authMiddleware, async (req, res) => {
  const { userLat, userLng, reportLat, reportLng } = req.body;

  if (!userLat || !userLng || !reportLat || !reportLng)
    return res.status(400).send({ error: "Missing lat/lng" });

  const distance = Math.sqrt(
    Math.pow(userLat - reportLat, 2) + Math.pow(userLng - reportLng, 2)
  );

  const isValid = distance < 0.02; // ~1–2 km threshold

  await producer.send({
    topic: "location.checked",
    messages: [{ value: JSON.stringify({ isValid, distance }) }]
  });

  res.json({ validReporter: isValid, distance });
});


// const ids = await prisma.notificationUsers.findMany({
//   where: { user_id: req.user.id }
// });


// const notifications = await Promise.all(ids.map(async (n) => {
//   const [title, msg, time] = await Promise.all([
//     prisma.notificationTitles.findUnique({ where: { notification_id: n.notification_id }}),
//     prisma.notificationMessages.findUnique({ where: { notification_id: n.notification_id }}),
//     prisma.notificationTimes.findUnique({ where: { notification_id: n.notification_id }})
//   ]);

//   return {
//     id: n.notification_id,
//     title: title?.title,
//     message: msg?.message,
//     created_at: time?.created_at
//   };
// }));

// res.json(notifications);



// const consumer = kafka.consumer({ groupId: "notification-service" });

// (async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: "incident.validated" });

//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const event = JSON.parse(message.value.toString());

//       // Broadcast notifications to all users
//       await prisma.notifications.create({
//         data: {
//           user_id: "ALL",   // You can create per-user instead
//           title: "New Verified Incident",
//           message: `Incident ${event.incident_id} is now verified.`,
//         }
//       });
//     }
//   });
// })();


app.get("/usecase/map-danger-zones", async (req, res) => {
  const locs = await prisma.incidentLocations.findMany();
  const types = await prisma.incidentTypes.findMany();
  const severity = await prisma.incidentSeverity.findMany();
  const status = await prisma.incidentApprovalStatus.findMany();

  const result = locs.map(loc => ({
    id: loc.incident_id,
    lat: loc.latitude,
    lng: loc.longitude,
    type: types.find(t => t.incident_id === loc.incident_id)?.type || "unknown",
    severity: severity.find(s => s.incident_id === loc.incident_id)?.severity || 1,
    approved: status.find(s => s.incident_id === loc.incident_id)?.approved || false,
  }));

  res.json(result);
});
