const Chapter = require('../models/Chapter');

exports.createChapter = async (req, res) => {
  try {
    const { bookId, chapterNumber, title, content } = req.body;
    
    // Validate required fields
    if (!bookId || !chapterNumber || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create new chapter
    const newChapter = new Chapter({
      bookId,
      chapterNumber,
      title,
      content
    });

    const savedChapter = await newChapter.save();

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      chapter: savedChapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating chapter',
      error: error.message
    });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    res.json({
      success: true,
      chapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving chapter',
      error: error.message
    });
  }
};

exports.getChaptersByBookId = async (req, res) => {
  try {
    const chapters = await Chapter.find({ bookId: req.params.bookId })
                                .sort({ chapterNumber: 1 });
    res.json({
      success: true,
      chapters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving chapters',
      error: error.message
    });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      req.body,
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    res.json({
      success: true,
      chapter: updatedChapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating chapter',
      error: error.message
    });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(req.params.chapterId);
    if (!deletedChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    res.json({
      success: true,
      message: 'Chapter deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting chapter',
      error: error.message
    });
  }
};