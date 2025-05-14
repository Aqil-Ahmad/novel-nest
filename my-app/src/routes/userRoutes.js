const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const userHistoryController = require('../controllers/userHistoryController');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { usersCollection } = getDB();
    const imageUrl = `/uploads/${req.file.filename}`;

    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { profilePic: imageUrl } }
    );

    res.json({
      success: true,
      profilePic: imageUrl
    });
  } catch (error) {
    console.error('Profile pic upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile picture' });
  }
});

// User reading history/progress
router.post('/history', auth, userHistoryController.logReadingProgress);
router.get('/history', auth, userHistoryController.getUserHistory);

module.exports = router;
