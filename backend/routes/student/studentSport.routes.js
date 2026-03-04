import express from 'express';
import {
    getMySports,
    getSport,
    createSport,
    updateSport,
    deleteSport,
    updateApprovalStatus,
    getAllSports,
    getSportsByCategory,
    getSportsByLevel
} from '../../controllers/student/studentSport.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/', authorize('student'), getMySports);
router.get('/category/:category', authorize('student'), getSportsByCategory);
router.get('/level/:level', authorize('student'), getSportsByLevel);
router.get('/:id', authorize('student'), getSport);
router.post('/', authorize('student'), createSport);
router.put('/:id', authorize('student'), updateSport);
router.delete('/:id', authorize('student'), deleteSport);

// Faculty / Admin routes
router.get('/all/list', authorize('admin', 'faculty', 'department-admin'), getAllSports);
router.put('/:id/approval', authorize('admin', 'faculty', 'department-admin'), updateApprovalStatus);

export default router;
