import fs from 'fs';
import path from 'path';

// Local File-based Mock MongoDB Collection
class MockCollection {
  constructor(name) {
    this.name = name;
    // Store inside the prisma directory
    this.filePath = path.join(process.cwd(), 'prisma', `mongodb_${name}.json`);
  }

  _read() {
    if (!fs.existsSync(this.filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    } catch {
      return [];
    }
  }

  _write(data) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const data = this._read();
    return {
      toArray: async () => {
        return data.filter(item => {
          for (let key in query) {
            if (query[key] !== undefined && item[key] !== query[key]) return false;
          }
          return true;
        });
      }
    };
  }

  async findOne(query = {}) {
    const data = this._read();
    return data.find(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async insertOne(doc) {
    const data = this._read();
    const newDoc = { ...doc };
    newDoc._id = newDoc._id || Math.random().toString(36).substring(2, 9);
    data.push(newDoc);
    this._write(data);
    return { insertedId: newDoc._id, acknowledged: true };
  }

  async updateOne(query, update) {
    const data = this._read();
    const index = data.findIndex(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      if (update.$set) {
        data[index] = { ...data[index], ...update.$set };
      } else {
        data[index] = { ...data[index], ...update };
      }
      this._write(data);
      return { modifiedCount: 1, matchedCount: 1 };
    }
    return { modifiedCount: 0, matchedCount: 0 };
  }

  async deleteOne(query) {
    const data = this._read();
    const initialLen = data.length;
    const filtered = data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) return false;
      }
      return true;
    });
    const kept = data.filter(item => !filtered.includes(item));
    this._write(kept);
    return { deletedCount: initialLen - kept.length };
  }
}

// Fallback checking for a real mongodb server, else using the file-based mock
let client = null;
let dbInstance = null;

const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  try {
    // Attempt loading real mongodb package if installed
    const { MongoClient } = await import('mongodb');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    dbInstance = client.db(process.env.MONGODB_DB || 'editor');
    console.log('[Database] Connected to real MongoDB at ' + MONGODB_URI);
  } catch (err) {
    console.warn('[Database] Failed to connect to MongoDB, falling back to JSON mock database:', err.message);
  }
}

export const getCollection = (name) => {
  if (dbInstance) {
    return dbInstance.collection(name);
  }
  return new MockCollection(name);
};

export const mongoDbClient = {
  db: () => ({
    collection: getCollection
  })
};
