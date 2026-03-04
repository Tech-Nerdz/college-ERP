import express from 'express';
import {
  getAllStudentProfiles,
  getMyProfile,
  getProfileByStudentId,
  getProfileByRollNumber,
  getProfileById,
  getProfilesByDepartment,
  getProfilesBySemester,
  createOrUpdateProfile,
  updateProfile,
  updateProfilePhoto,
  updateFeeStatus,
  updateStudentStatus,
  deleteProfile,
  getProfileStatistics,
} from '../controllers/student/studentProfile.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes - personal profile access
router.get('/my-profile', authorize('student'), getMyProfile);
router.get('/statistics', authorize('admin', 'faculty', 'department-admin'), getProfileStatistics);

// Get by different identifiers
router.get('/student/:studentId', authorize('student', 'faculty', 'admin', 'department-admin'), getProfileByStudentId);
router.get('/roll/:rollNumber', authorize('student', 'faculty', 'admin', 'department-admin'), getProfileByRollNumber);
router.get('/by-id/:id', authorize('student', 'faculty', 'admin', 'department-admin'), getProfileById);

// Department and semester based queries
router.get('/department/:departmentId', authorize('faculty', 'admin', 'department-admin'), getProfilesByDepartment);
router.get('/semester/:semester', authorize('faculty', 'admin', 'department-admin'), getProfilesBySemester);

// Get all profiles
router.get('/', authorize('admin', 'faculty', 'department-admin'), getAllStudentProfiles);

// Create or update profile (admin/faculty/department-admin)
router.post('/', authorize('admin', 'faculty', 'department-admin'), createOrUpdateProfile);
router.post('/bulk', authorize('admin'), createOrUpdateProfile);

// Update operations (admin/faculty/department-admin)
router.put('/:id', authorize('admin', 'faculty', 'department-admin'), updateProfile);
router.patch('/:id/photo', authorize('student', 'admin', 'faculty', 'department-admin'), updateProfilePhoto);
router.patch('/:id/fee-status', authorize('admin', 'faculty', 'department-admin'), updateFeeStatus);
router.patch('/:id/status', authorize('admin', 'department-admin'), updateStudentStatus);

// Delete profile (admin only)
router.delete('/:id', authorize('admin'), deleteProfile);

export default router;
