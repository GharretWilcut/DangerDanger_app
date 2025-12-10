// Simple JSON file-based database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    incidents: [],
    notifications: []
  }, null, 2));
}

function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

import crypto from 'crypto';

export const db = {
  users: {
    findByEmail: (email) => {
      const data = readDB();
      return data.users.find(u => u.email === email);
    },
    create: (user) => {
      const data = readDB();
      const newUser = {
        id: crypto.randomUUID(),
        ...user,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      writeDB(data);
      return newUser;
    },
    findById: (id) => {
      const data = readDB();
      return data.users.find(u => u.id === id);
    },
    findAll: () => {
      const data = readDB();
      return data.users;
    }
  },
  incidents: {
    create: (incident) => {
      const data = readDB();
      const newIncident = {
        id: crypto.randomUUID(),
        ...incident,
        createdAt: new Date().toISOString()
      };
      data.incidents.push(newIncident);
      writeDB(data);
      return newIncident;
    },
    findAll: () => {
      const data = readDB();
      return data.incidents;
    }
  }
};

