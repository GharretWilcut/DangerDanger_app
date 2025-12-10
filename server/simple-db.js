// Simple JSON file-based database with locking mechanism
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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

// Simple mutex queue to prevent race conditions
let writeQueue = Promise.resolve();

/**
 * Thread-safe read operation
 */
function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Thread-safe write operation using a queue
 * Ensures only one write happens at a time
 */
function writeDB(data) {
  writeQueue = writeQueue.then(() => {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  return writeQueue;
}

/**
 * Thread-safe read-modify-write operation
 * Executes the modifier function atomically
 */
async function atomicUpdate(modifier) {
  return writeQueue = writeQueue.then(() => {
    try {
      const data = readDB();
      const modified = modifier(data);
      // Handle both sync and async modifiers
      return Promise.resolve(modified).then((result) => {
        fs.writeFileSync(DB_FILE, JSON.stringify(result, null, 2));
        return result;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  });
}

export const db = {
  users: {
    findByEmail: (email) => {
      const data = readDB();
      return data.users.find(u => u.email === email);
    },
    create: async (user) => {
      const newUser = {
        id: crypto.randomUUID(),
        ...user,
        createdAt: new Date().toISOString()
      };
      
      await atomicUpdate((data) => {
        data.users.push(newUser);
        return data;
      });
      
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
    create: async (incident) => {
      const newIncident = {
        id: crypto.randomUUID(),
        ...incident,
        createdAt: new Date().toISOString()
      };
      
      await atomicUpdate((data) => {
        data.incidents.push(newIncident);
        return data;
      });
      
      return newIncident;
    },
    findAll: () => {
      const data = readDB();
      return data.incidents;
    }
  }
};

