require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

    // Add this to your existing MongoDB collections in the run() function
    const chapterCollection = db.collection("Chapters");

    // ========== CHAPTER ROUTES ==========

    /**
     * @route POST /api/chapters
     * @desc Create a new chapter for a book
     */
    app.post('/api/chapters', async (req, res) => {
      try {
        const { bookId, chapterNumber, title, content } = req.body;
        
        // Basic validation
        if (!bookId || !chapterNumber || !title || !content) {
          return res.status(400).json({
            success: false,
            message: 'BookId, chapterNumber, title, and content are required'
          });
        }
        
        // Convert string bookId to ObjectId
        let objectBookId;
        try {
          objectBookId = new ObjectId(bookId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid bookId format'
          });
        }
        
        // Check if book exists
        const bookExists = await bookCollections.findOne({ _id: objectBookId });
        if (!bookExists) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }
        
        // Check if chapter with same number already exists for this book
        const existingChapter = await chapterCollection.findOne({ 
          bookId: objectBookId, 
          chapterNumber: parseInt(chapterNumber) 
        });
        
        if (existingChapter) {
          return res.status(409).json({
            success: false,
            message: 'Chapter with this number already exists for this book'
          });
        }
        
        // Create new chapter
        const newChapter = {
          bookId: objectBookId,
          chapterNumber: parseInt(chapterNumber),
          title,
          content,
          wordCount: content.split(/\s+/).length,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await chapterCollection.insertOne(newChapter);
        
        // Update book's totalChapters count if needed
        await bookCollections.updateOne(
          { _id: objectBookId },
          { $max: { totalChapters: parseInt(chapterNumber) } }
        );
        
        res.status(201).json({
          success: true,
          chapterId: result.insertedId,
          message: 'Chapter created successfully'
        });
        
      } catch (error) {
        console.error("Create chapter error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while creating chapter'
        });
      }
    });

    /**
     * @route GET /api/books/:bookId/chapters
     * @desc Get all chapters for a specific book
     */
    app.get('/api/books/:bookId/chapters', async (req, res) => {
      try {
        const { bookId } = req.params;
        let objectBookId;
        
        try {
          objectBookId = new ObjectId(bookId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid bookId format'
          });
        }
        
        // Find all chapters for this book, sorted by chapter number
        const chapters = await chapterCollection.find({ 
          bookId: objectBookId 
        }).sort({ 
          chapterNumber: 1 
        }).toArray();
        
        res.status(200).json({
          success: true,
          count: chapters.length,
          chapters: chapters.map(chapter => ({
            id: chapter._id,
            bookId: chapter.bookId,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            wordCount: chapter.wordCount,
            createdAt: chapter.createdAt,
            updatedAt: chapter.updatedAt
            // Note: We're not sending content here to save bandwidth
          }))
        });
        
      } catch (error) {
        console.error("Get chapters error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while fetching chapters'
        });
      }
    });

    /**
     * @route GET /api/chapters/:chapterId
     * @desc Get a specific chapter by ID, including content
     */
    app.get('/api/chapters/:chapterId', async (req, res) => {
      try {
        const { chapterId } = req.params;
        let objectChapterId;
        
        try {
          objectChapterId = new ObjectId(chapterId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid chapterId format'
          });
        }
        
        const chapter = await chapterCollection.findOne({ _id: objectChapterId });
        
        if (!chapter) {
          return res.status(404).json({
            success: false,
            message: 'Chapter not found'
          });
        }
        
        res.status(200).json({
          success: true,
          chapter
        });
        
      } catch (error) {
        console.error("Get chapter error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while fetching chapter'
        });
      }
    });

    /**
     * @route GET /api/books/:bookId/chapters/:chapterNumber
     * @desc Get a specific chapter by book ID and chapter number
     */
    app.get('/api/books/:bookId/chapters/:chapterNumber', async (req, res) => {
      try {
        const { bookId, chapterNumber } = req.params;
        let objectBookId;
        
        try {
          objectBookId = new ObjectId(bookId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid bookId format'
          });
        }
        
        const chapter = await chapterCollection.findOne({ 
          bookId: objectBookId,
          chapterNumber: parseInt(chapterNumber)
        });
        
        if (!chapter) {
          return res.status(404).json({
            success: false,
            message: 'Chapter not found'
          });
        }
        
        res.status(200).json({
          success: true,
          chapter
        });
        
      } catch (error) {
        console.error("Get chapter by number error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while fetching chapter'
        });
      }
    });

    /**
     * @route PATCH /api/chapters/:chapterId
     * @desc Update a chapter
     */
    app.patch('/api/chapters/:chapterId', async (req, res) => {
      try {
        const { chapterId } = req.params;
        const updateData = req.body;
        let objectChapterId;
        
        try {
          objectChapterId = new ObjectId(chapterId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid chapterId format'
          });
        }
        
        // Don't allow changing bookId
        if (updateData.bookId) {
          delete updateData.bookId;
        }
        
        // Calculate word count if content is being updated
        if (updateData.content) {
          updateData.wordCount = updateData.content.split(/\s+/).length;
        }
        
        // Add updated timestamp
        updateData.updatedAt = new Date();
        
        const result = await chapterCollection.updateOne(
          { _id: objectChapterId },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: 'Chapter not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Chapter updated successfully'
        });
        
      } catch (error) {
        console.error("Update chapter error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while updating chapter'
        });
      }
    });

    /**
     * @route DELETE /api/chapters/:chapterId
     * @desc Delete a chapter
     */
    app.delete('/api/chapters/:chapterId', async (req, res) => {
      try {
        const { chapterId } = req.params;
        let objectChapterId;
        
        try {
          objectChapterId = new ObjectId(chapterId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid chapterId format'
          });
        }
        
        // Get chapter info before deletion to update book if needed
        const chapter = await chapterCollection.findOne({ _id: objectChapterId });
        
        if (!chapter) {
          return res.status(404).json({
            success: false,
            message: 'Chapter not found'
          });
        }
        
        const result = await chapterCollection.deleteOne({ _id: objectChapterId });
        
        // Update book's totalChapters if this was the highest chapter
        const highestRemainingChapter = await chapterCollection.find({ 
          bookId: chapter.bookId 
        }).sort({ 
          chapterNumber: -1 
        }).limit(1).toArray();
        
        if (highestRemainingChapter.length > 0) {
          await bookCollections.updateOne(
            { _id: chapter.bookId },
            { $set: { totalChapters: highestRemainingChapter[0].chapterNumber } }
          );
        } else {
          // No chapters left for this book
          await bookCollections.updateOne(
            { _id: chapter.bookId },
            { $set: { totalChapters: 0 } }
          );
        }
        
        res.status(200).json({
          success: true,
          message: 'Chapter deleted successfully'
        });
        
      } catch (error) {
        console.error("Delete chapter error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while deleting chapter'
        });
      }
    });

    /**
     * @route POST /api/books/:bookId/bulk-upload-chapters
     * @desc Bulk upload multiple chapters for a book
     */
    app.post('/api/books/:bookId/bulk-upload-chapters', async (req, res) => {
      try {
        const { bookId } = req.params;
        const { chapters } = req.body;
        
        if (!Array.isArray(chapters) || chapters.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Chapters array is required and must not be empty'
          });
        }
        
        let objectBookId;
        try {
          objectBookId = new ObjectId(bookId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid bookId format'
          });
        }
        
        // Check if book exists
        const bookExists = await bookCollections.findOne({ _id: objectBookId });
        if (!bookExists) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }
        
        // Process and validate each chapter
        const chaptersToInsert = [];
        const chapterNumbers = new Set();
        let highestChapterNumber = 0;
        
        for (const chapter of chapters) {
          if (!chapter.chapterNumber || !chapter.title || !chapter.content) {
            return res.status(400).json({
              success: false,
              message: 'Each chapter must have chapterNumber, title, and content'
            });
          }
          
          const chapterNumber = parseInt(chapter.chapterNumber);
          
          // Check for duplicate chapter numbers
          if (chapterNumbers.has(chapterNumber)) {
            return res.status(400).json({
              success: false,
              message: `Duplicate chapter number: ${chapterNumber}`
            });
          }
          
          chapterNumbers.add(chapterNumber);
          highestChapterNumber = Math.max(highestChapterNumber, chapterNumber);
          
          chaptersToInsert.push({
            bookId: objectBookId,
            chapterNumber,
            title: chapter.title,
            content: chapter.content,
            wordCount: chapter.content.split(/\s+/).length,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Check for existing chapters with same numbers
        const existingChapters = await chapterCollection.find({
          bookId: objectBookId,
          chapterNumber: { $in: Array.from(chapterNumbers) }
        }).toArray();
        
        if (existingChapters.length > 0) {
          return res.status(409).json({
            success: false,
            message: `Some chapters already exist: ${existingChapters.map(c => c.chapterNumber).join(', ')}`
          });
        }
        
        // Insert all chapters
        const result = await chapterCollection.insertMany(chaptersToInsert);
        
        // Update book's totalChapters if needed
        await bookCollections.updateOne(
          { _id: objectBookId },
          { $max: { totalChapters: highestChapterNumber } }
        );
        
        res.status(201).json({
          success: true,
          insertedCount: result.insertedCount,
          message: 'Chapters uploaded successfully'
        });
        
      } catch (error) {
        console.error("Bulk upload chapters error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while uploading chapters'
        });
      }
    });

    // ========== BOOK ROUTES ==========

    app.post('/upload-book', async (req, res) => {
      try {
        const data = req.body;
        
        // Add chapter tracking fields
        const bookData = {
          ...data,
          totalChapters: 0,  // Will be updated as chapters are added
          hasFullText: false, // Set to true when chapters are available
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await bookCollections.insertOne(bookData);
        res.status(201).json({
          success: true,
          message: 'Book uploaded successfully',
          bookId: result.insertedId
        });
      } catch (error) {
        console.error("Upload book error:", error);
        res.status(500).json({
          success: false,
          message: 'Error uploading book',
          error: error.message
        });
      }
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

    /**
     * @route GET /api/books/:id
     * @desc Get a single book by ID
     */
    app.get('/api/books/:id', async (req, res) => {
      try {
        const { id } = req.params;
        let objectId;
        
        try {
          objectId = new ObjectId(id);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid book ID format'
          });
        }
        
        const book = await bookCollections.findOne({ _id: objectId });
        
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }
        
        res.status(200).json({
          success: true,
          book
        });
        
      } catch (error) {
        console.error("Get book error:", error);
        res.status(500).json({
          success: false,
          message: 'Server error while fetching book'
        });
      }
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

    /**
     * @route GET /chapters/:bookId
     * @desc Get all chapters for a book (legacy endpoint)
     */
    app.get('/chapters/:bookId', async (req, res) => {
      try {
        const chapters = await chapterCollection.find({ bookId: new ObjectId(req.params.bookId) })
          .sort({ chapterNumber: 1 })
          .toArray();
        res.json(chapters);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching chapters', error: error.message });
      }
    });

    /**
     * @route GET /book/:id/chapter/:number
     * @desc Get a specific chapter by book ID and chapter number (legacy endpoint)
     */
    app.get('/book/:id/chapter/:number', async (req, res) => {
      try {
        const bookId = req.params.id;
        const chapterNumber = parseInt(req.params.number);
        
        const chapter = await chapterCollection.findOne({
          bookId: new ObjectId(bookId),
          chapterNumber: chapterNumber
        });
        
        if (!chapter) {
          return res.status(404).json({ message: 'Chapter not found' });
        }
        
        res.json(chapter);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching chapter', error: error.message });
      }
    });

    /**
     * @route POST /upload-chapter
     * @desc Upload a new chapter (legacy endpoint)
     */
    app.post('/upload-chapter', async (req, res) => {
      try {
        const chapter = {
          ...req.body,
          bookId: new ObjectId(req.body.bookId),
          wordCount: req.body.content.split(/\s+/).length,
          createdAt: new Date()
        };
        const result = await chapterCollection.insertOne(chapter);
        res.status(201).json({ message: 'Chapter uploaded successfully', chapter: { ...chapter, _id: result.insertedId } });
      } catch (error) {
        res.status(400).json({ message: 'Error uploading chapter', error: error.message });
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

    // Add new PDF upload endpoint
    app.post('/api/books/upload-pdf', upload.single('pdf'), async (req, res) => {
      try {
        if (!req.file) {
          console.log('No file uploaded');
          return res.status(400).json({
            success: false,
            message: 'No PDF file uploaded'
          });
        }

        console.log('File uploaded:', req.file);
        const { book_title, authorName, book_description, category, image_url } = req.body;
        
        // Create the uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);
        }

        const bookData = {
          book_title,
          authorName,
          book_description,
          category,
          image_url,
          book_pdf_url: `/uploads/${req.file.filename}`, // Store the relative path
          pdfFile: {
            filename: req.file.filename,
            path: req.file.path,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('Book data to be saved:', bookData);
        const result = await bookCollections.insertOne(bookData);
        console.log('Book saved with ID:', result.insertedId);
        
        res.status(201).json({
          success: true,
          message: 'Book PDF uploaded successfully',
          bookId: result.insertedId
        });
      } catch (error) {
        console.error("PDF upload error:", error);
        res.status(500).json({
          success: false,
          message: 'Error uploading PDF',
          error: error.message
        });
      }
    });

    // Add PDF retrieval endpoint
    app.get('/api/books/:id/pdf', async (req, res) => {
      try {
        const { id } = req.params;
        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch (error) {
          console.log('Invalid book ID format:', id);
          return res.status(400).json({
            success: false,
            message: 'Invalid book ID format'
          });
        }

        const book = await bookCollections.findOne({ _id: objectId });
        console.log('Found book:', book ? 'Yes' : 'No');

        if (!book || !book.pdfFile) {
          console.log('Book or PDF not found');
          return res.status(404).json({
            success: false,
            message: 'Book or PDF not found'
          });
        }

        // Log the path
        console.log('PDF file path from DB:', book.pdfFile.path);
        const filePath = path.resolve(book.pdfFile.path);
        console.log('Resolved file path:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log('PDF file does not exist at path:', filePath);
          return res.status(404).json({
            success: false,
            message: 'PDF file not found on server'
          });
        }

        // Set CORS headers explicitly for this response
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${book.pdfFile.originalName}"`);
        res.sendFile(filePath);

      } catch (error) {
        console.error("PDF retrieval error:", error);
        res.status(500).json({
          success: false,
          message: 'Error retrieving PDF'
        });
      }
    });

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