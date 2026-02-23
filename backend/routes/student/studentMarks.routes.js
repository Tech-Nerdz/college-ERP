import express from 'express';
import {
    getMyMarks,
    getMyInternalMarks,
    upsertMarks,
    upsertInternalMark,
    getMarksSummary,
    deleteMark
} from '../../controllers/student/studentMarks.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes (view only)
router.get('/', authorize('student'), getMyMarks);
router.get('/internal', authorize('student'), getMyInternalMarks);
router.get('/summary', authorize('student'), getMarksSummary);

// Admin / Faculty routes (write)
router.post('/', authorize('admin', 'faculty'), upsertMarks);
router.post('/internal', authorize('admin', 'faculty'), upsertInternalMark);
router.delete('/:id', authorize('admin'), deleteMark);

export default router;
