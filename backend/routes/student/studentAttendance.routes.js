import express from 'express';
import {
    getMyAttendance,
    getAttendanceBySubject,
    getAttendanceSummary,
    markAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceByDate,
    getAttendanceReport
} from '../../controllers/student/studentAttendance.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes (view only)
router.get('/', authorize('student'), getMyAttendance);
router.get('/subject/:subjectId', authorize('student'), getAttendanceBySubject);
router.get('/summary', authorize('student'), getAttendanceSummary);
router.get('/date/:date', authorize('student'), getAttendanceByDate);

// Faculty routes (mark and manage attendance)
router.post('/', authorize('admin', 'faculty'), markAttendance);
router.put('/:id', authorize('admin', 'faculty'), updateAttendance);
router.delete('/:id', authorize('admin'), deleteAttendance);

// Admin / Faculty reports
router.get('/report', authorize('admin', 'faculty', 'department-admin'), getAttendanceReport);

export default router;
