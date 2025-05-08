require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 3000;

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Novel_Inventory';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Novel_Inventory");
    const bookCollections = db.collection("Novels");
    const usersCollection = db.collection("Users");

    // Root
    app.get('/', (req, res) => {
      res.send("hello world");
    });

    // ========== BOOK ROUTES ==========

    app.post('/upload-book', async (req, res) => {
      const data = req.body;
      const result = await bookCollections.insertOne(data);
      res.send(result);
    });

    app.get('/all-books', async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await bookCollections.find(query).toArray();
      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.findOne(filter);
      res.send(result);
    });

    app.patch('/book/:id', async (req, res) => {
      const id = req.params.id;
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          ...updateBookData
        }
      };

      const options = { upsert: true };
      const result = await bookCollections.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.deleteOne(filter);
      res.send(result);
    });

    // ========== AUTHENTICATION ROUTES ==========

    /**
     * @route POST /api/auth/signup
     * @desc Register a new user
     */
    app.post('/api/auth/signup', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email and password are required' 
          });
        }
        
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ 
            success: false, 
            message: 'User already exists' 
          });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = {
          email,
          password: hashedPassword,
          name: email.split('@')[0], // Basic name from email
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'user'
        };
        
        const result = await usersCollection.insertOne(newUser);
        
        // User data to return (exclude sensitive info)
        const userData = {
          id: result.insertedId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        };
        
        // Generate JWT token
        const token = generateToken(result.insertedId);
        
        // Return success response
        res.status(201).json({
          success: true,
          user: userData,
          token
        });
      } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error during registration' 
        });
      }
    });

    /**
     * @route POST /api/auth/google
     * @desc Authenticate with Google
     */
    app.post('/api/auth/google', async (req, res) => {
      try {
        const { token } = req.body;
        
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, name, email, picture } = payload;

        // Check if user exists
        let user = await usersCollection.findOne({ email });

        if (!user) {
          // Create new user
          const newUser = {
            googleId,
            name,
            email,
            avatar: picture,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            role: 'user'
          };

          const result = await usersCollection.insertOne(newUser);
          user = { ...newUser, _id: result.insertedId };
        }

        // Return user data (without sensitive info)
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        };

        res.status(200).json({
          success: true,
          user: userData,
          token: generateToken(user._id)
        });

      } catch (error) {
        console.error("Google auth error:", error);
        res.status(401).json({ success: false, message: "Authentication failed" });
      }
    });

    /**
     * @route POST /api/auth/login
     * @desc Regular email/password login
     */
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find user
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
          });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
          });
        }

        // Return user data
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        res.status(200).json({
          success: true,
          user: userData,
          token: generateToken(user._id)
        });

      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Server error" 
        });
      }
    });

    /**
     * @route GET /api/auth/profile
     * @desc Get user profile with token
     */
    app.get('/api/auth/profile', async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ 
            success: false, 
            message: 'Authorization required' 
          });
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
          const userId = new ObjectId(decoded.id);
          
          const user = await usersCollection.findOne({ _id: userId });
          
          if (!user) {
            return res.status(404).json({ 
              success: false, 
              message: 'User not found' 
            });
          }
          
          // Return user data
          const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          
          return res.json({
            success: true,
            user: userData
          });
        } catch (error) {
          console.error("Token verification error:", error);
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
          });
        }
      } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    });

    // ========== HELPER FUNCTIONS ==========
    
    function generateToken(userId) {
      // Implement JWT token generation
      return jwt.sign(
        { id: userId.toString() }, 
        process.env.JWT_SECRET || 'defaultsecret', 
        { expiresIn: '7d' }
      );
    }

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

run().catch(console.error);