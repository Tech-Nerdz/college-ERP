import express from 'express';
import {
    getMyEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    updateApprovalStatus,
    getAllEvents,
    getEventsByType,
    getEventsByLevel
} from '../../controllers/student/studentEvent.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyEvents);
router.get('/type/:type', authorize('student'), getEventsByType);
router.get('/level/:level', authorize('student'), getEventsByLevel);
router.get('/:id', authorize('student'), getEvent);
router.post('/', authorize('student'), createEvent);
router.put('/:id', authorize('student'), updateEvent);
router.delete('/:id', authorize('student'), deleteEvent);

// Faculty / Admin routes
router.get('/all/list', authorize('admin', 'faculty', 'department-admin'), getAllEvents);
router.put('/:id/approval', authorize('admin', 'faculty', 'department-admin'), updateApprovalStatus);

export default router;
