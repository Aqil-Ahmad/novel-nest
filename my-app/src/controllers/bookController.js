const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const { bookCollections } = getDB();
    let query = {};
    if (req.query?.category) {
      query = { category: req.query.category };
    }
    const result = await bookCollections.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books'
    });
  }
};

// Get a book by ID (API version)
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookCollections } = getDB();
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
};

// Get book by ID (legacy version)
const getBookByIdLegacy = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.findOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book'
    });
  }
};

// Upload a new book
const uploadBook = async (req, res) => {
  try {
    const data = req.body;
    const { bookCollections } = getDB();
    
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
};

// Update a book
const updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const updateBookData = req.body;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        ...updateBookData
      }
    };

    const options = { upsert: true };
    const result = await bookCollections.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.deleteOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookByIdLegacy,
  uploadBook,
  updateBook,
  deleteBook
};