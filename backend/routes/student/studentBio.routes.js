import express from 'express';
import {
    getMyBio,
    createBio,
    updateBio,
    deleteBio
} from '../../controllers/student/studentBio.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes (view and manage their own bio)
router.get('/', authorize('student'), getMyBio);
router.post('/', authorize('student'), createBio);
router.put('/', authorize('student'), updateBio);
router.delete('/', authorize('student'), deleteBio);

// Admin / Faculty routes (view any student's bio)
router.get('/:studentId', authorize('admin', 'faculty', 'department-admin'), getMyBio);

export default router;
