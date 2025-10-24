const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

// All routes require authentication
router.post('/submit', auth, assessmentController.submitAssessment);
router.get('/history', auth, assessmentController.getAssessmentHistory);
router.get('/:assessmentId', auth, assessmentController.getAssessmentDetails);

module.exports = router;
