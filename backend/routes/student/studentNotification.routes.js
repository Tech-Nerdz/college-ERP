import express from 'express';
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    bulkCreateNotifications
} from '../../controllers/student/studentNotification.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyNotifications);
router.put('/read-all', authorize('student'), markAllAsRead);
router.put('/:id/read', authorize('student'), markAsRead);
router.delete('/:id', authorize('student'), deleteNotification);

// Admin / Faculty — send notifications
router.post('/', authorize('admin', 'faculty'), createNotification);
router.post('/bulk', authorize('admin', 'faculty'), bulkCreateNotifications);

export default router;
