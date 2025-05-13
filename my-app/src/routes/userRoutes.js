const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

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

module.exports = router;
