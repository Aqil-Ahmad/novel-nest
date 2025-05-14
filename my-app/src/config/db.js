const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Novel_Inventory';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database collections
let db;
let bookCollections;
let usersCollection;
let chapterCollection;
let userHistoryCollection;

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db("Novel_Inventory");
    bookCollections = db.collection("Novels");
    usersCollection = db.collection("Users");
    chapterCollection = db.collection("Chapters");
    userHistoryCollection = db.collection("userHistory");

    return {
      db,
      bookCollections,
      usersCollection,
      chapterCollection,
      userHistoryCollection
    };
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return {
    db,
    bookCollections,
    usersCollection,
    chapterCollection,
    userHistoryCollection
  };
};

module.exports = {
  connectDB,
  getDB,
  client
};