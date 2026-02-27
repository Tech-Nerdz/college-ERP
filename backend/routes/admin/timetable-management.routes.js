import express from 'express';
import {
  getTimetables,
  getTimetableById,
  createTimetable,
  bulkUploadTimetable,
  getFacultyTimetable,
  getClassTimetable,
  alterStaff,
  acceptStaffAlteration,
  rejectStaffAlteration,
  getPeriodConfig,
  createPeriodConfig,
  getPendingStaffAlterations
} from '../../controllers/admin/timetable-management.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// IMPORTANT: More specific routes MUST come before generic ones

// Get pending staff alterations
router.get('/staff-alterations/pending', getPendingStaffAlterations);

// Get period configuration by department
router.get('/periods/:department_id', getPeriodConfig);

// Create period configuration (SuperAdmin only)
router.post('/periods', authorize('superadmin', 'super-admin'), createPeriodConfig);

// Staff alterations routes
router.post('/staff-alterations', authorize('superadmin', 'super-admin'), alterStaff);
router.put('/staff-alterations/:id/accept', acceptStaffAlteration);
router.put('/staff-alterations/:id/reject', rejectStaffAlteration);

// Get faculty timetable
router.get('/faculty/:faculty_id', getFacultyTimetable);

// Get class timetable
router.get('/class/:class_id/timetable/:timetable_id', getClassTimetable);

// Create new timetable (SuperAdmin only)
router.post('/', authorize('superadmin', 'super-admin'), createTimetable);

// Bulk upload timetable details
router.post('/bulk-upload', authorize('superadmin', 'super-admin'), bulkUploadTimetable);

// Get all timetables
router.get('/', getTimetables);

// Get single timetable (MUST be last to avoid matching :id with other params)
router.get('/:id', getTimetableById);

export default router;
