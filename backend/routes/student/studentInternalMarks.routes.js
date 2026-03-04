import express from 'express';
import {
    getMyInternalMarks,
    getInternalMarksBySemester,
    getInternalMarksBySubject,
    getInternalMark,
    createOrUpdateInternalMark,
    bulkCreateInternalMarks,
    updateInternalMark,
    deleteInternalMark,
    getInternalMarksReport,
    getPerformanceAnalysis,
    exportInternalMarksCSV
} from '../../controllers/student/studentInternalMarks.controller.js';

import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── STUDENT ROUTES (READ ONLY) ───────────────────────────────────────────

// Get all my internal marks
router.get('/', authorize('student'), getMyInternalMarks);

// Get internal marks by semester
router.get('/semester/:semester', authorize('student'), getInternalMarksBySemester);

// Get internal marks by subject
router.get('/subject/:subjectId', authorize('student'), getInternalMarksBySubject);

// Get single internal mark record
router.get('/:id', authorize('student'), getInternalMark);

// Get performance analysis
router.get('/analysis', authorize('student'), getPerformanceAnalysis);

// Export as CSV
router.get('/export/csv', authorize('student'), exportInternalMarksCSV);

// ─── ADMIN/FACULTY ROUTES (WRITE) ─────────────────────────────────────────

// Create or update single internal mark
router.post('/', authorize('admin', 'faculty', 'department-admin'), createOrUpdateInternalMark);

// Bulk create/update internal marks
router.post('/bulk', authorize('admin', 'faculty'), bulkCreateInternalMarks);

// Update internal mark scores
router.put('/:id', authorize('admin', 'faculty', 'department-admin'), updateInternalMark);

// Delete internal mark (admin only)
router.delete('/:id', authorize('admin'), deleteInternalMark);

// ─── ADMIN/FACULTY ROUTES (REPORTS) ─────────────────────────────────────────

// Get reports (admin/faculty only)
router.get('/report', authorize('admin', 'faculty', 'department-admin'), getInternalMarksReport);

export default router;
