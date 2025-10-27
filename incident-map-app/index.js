const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'replace_in_prod';

// helper
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).send({ error: 'Missing auth' });
  const token = h.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Invalid token' });
  }
}

// signup
app.post('/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).send({ error: 'email+password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, name }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: 'Could not create user' });
  }
});

// login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).send({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// create incident (protected). We'll store lat/lng in Prisma and also write PostGIS point with $queryRaw if you want true geography
app.post('/incidents', authMiddleware, async (req, res) => {
  const { type, description, lat, lng, severity = 1 } = req.body;
  if (!lat || !lng || !type) return res.status(400).send({ error: 'type + lat + lng required' });
  // create in Prisma
  const incident = await prisma.incident.create({
    data: { userId: req.user.id, type, description, lat, lng, severity }
  });
  // If you want to also insert the PostGIS geography point:
  try {
    await prisma.$executeRaw`
      UPDATE incidents
      SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat})::geometry, 4326)::geography
      WHERE id = ${incident.id};
    `;
  } catch (e) {
    console.warn('Could not set postgis location', e);
  }
  res.json({ incident });
});

// GET incidents near point: uses raw SQL with ST_DWithin
app.get('/incidents', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius_m || '2000'); // meters
  if (isNaN(lat) || isNaN(lng)) {
    // fallback: return latest 100 incidents
    const recent = await prisma.incident.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
    return res.json(recent);
  }
  const rows = await prisma.$queryRaw`
    SELECT id, type, description, created_at, severity,
      ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat
    FROM incidents
    WHERE ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, ${radius})
    ORDER BY created_at DESC
    LIMIT 500;
  `;
  res.json(rows);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server listening on', port));
