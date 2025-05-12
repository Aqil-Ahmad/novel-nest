const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const pdfController = require('../controllers/pdfController');
const { pdfUpload } = require('../middleware/upload');
const chapterController = require('../controllers/chapterController');

// Book routes (API version)
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', bookController.uploadBook);
router.patch('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Book routes (Legacy)
router.get('/legacy/:id', bookController.getBookByIdLegacy);

// Chapter routes associated with books
router.get('/:bookId/chapters', chapterController.getChaptersByBookId);
router.get('/:bookId/chapters/:chapterNumber', chapterController.getChapterByNumber);
router.post('/:bookId/bulk-upload-chapters', chapterController.bulkUploadChapters);

// PDF upload route
router.post('/upload-pdf', pdfUpload.single('pdf'), pdfController.uploadPdf);
router.get('/:id/pdf', pdfController.getPdf);

module.exports = router;