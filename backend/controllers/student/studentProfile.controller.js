import { StudentProfile, Department, Role } from '../models/index.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// Get all student profiles (admin only)
export const getAllStudentProfiles = asyncHandler(async (req, res, next) => {
  const { departmentId, semester, status, batch, page = 1, limit = 20 } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (semester) where.semester = semester;
  if (status) where.status = status;
  if (batch) where.batch = batch;

  const offset = (page - 1) * limit;

  const { count, rows } = await StudentProfile.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Role, as: 'role', attributes: ['role_id', 'role_name'] },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['studentId', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows,
  });
});

// Get my profile (student)
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const studentId = req.user?.studentId || req.user?.id;

  const profile = await StudentProfile.findOne({
    where: { studentId },
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Role, as: 'role', attributes: ['role_id', 'role_name'] },
    ],
  });

  if (!profile) {
    return next(new ErrorResponse(`Profile not found for student ID: ${studentId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// Get profile by student ID
export const getProfileByStudentId = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const profile = await StudentProfile.findOne({
    where: { studentId },
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Role, as: 'role', attributes: ['role_id', 'role_name'] },
    ],
  });

  if (!profile) {
    return next(new ErrorResponse(`Profile not found for student ID: ${studentId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// Get profile by roll number
export const getProfileByRollNumber = asyncHandler(async (req, res, next) => {
  const { rollNumber } = req.params;

  const profile = await StudentProfile.findOne({
    where: { rollNumber },
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Role, as: 'role', attributes: ['role_id', 'role_name'] },
    ],
  });

  if (!profile) {
    return next(new ErrorResponse(`Profile not found for roll number: ${rollNumber}`, 404));
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// Get profile by ID
export const getProfileById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const profile = await StudentProfile.findByPk(id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
      { model: Role, as: 'role', attributes: ['role_id', 'role_name'] },
    ],
  });

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// Get profiles by department
export const getProfilesByDepartment = asyncHandler(async (req, res, next) => {
  const { departmentId } = req.params;
  const { semester, status, page = 1, limit = 20 } = req.query;

  const where = { departmentId };
  if (semester) where.semester = semester;
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { count, rows } = await StudentProfile.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['studentId', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows,
  });
});

// Get profiles by semester
export const getProfilesBySemester = asyncHandler(async (req, res, next) => {
  const { semester } = req.params;
  const { departmentId, status, page = 1, limit = 20 } = req.query;

  const where = { semester: parseInt(semester) };
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { count, rows } = await StudentProfile.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['studentId', 'ASC']],
  });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows,
  });
});

// Create or update profile
export const createOrUpdateProfile = asyncHandler(async (req, res, next) => {
  const {
    studentId,
    rollNumber,
    firstName,
    lastName,
    email,
    phone,
    gender,
    departmentId,
    classId,
    batch,
    semester,
    year,
    section,
    admissionDate,
    admissionType,
    feeStatus,
    status,
  } = req.body;

  // Validation
  if (!studentId || !rollNumber || !firstName || !lastName || !email || !phone || !gender || !departmentId || !batch || !semester) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Invalid email format', 400));
  }

  // Validate semester range
  if (semester < 1 || semester > 8) {
    return next(new ErrorResponse('Semester must be between 1 and 8', 400));
  }

  const [profile, created] = await StudentProfile.findOrCreate({
    where: { studentId },
    defaults: {
      rollNumber,
      firstName,
      lastName,
      email,
      phone,
      photo: 'default-student.png',
      gender,
      departmentId,
      classId,
      batch,
      semester,
      year,
      section,
      admissionDate,
      admissionType: admissionType || 'regular',
      feeStatus: feeStatus || 'pending',
      status: status || 'active',
    },
  });

  if (!created) {
    // Update existing profile
    await profile.update({
      rollNumber,
      firstName,
      lastName,
      email,
      phone,
      gender,
      departmentId,
      classId,
      batch,
      semester,
      year,
      section,
      admissionDate,
      admissionType: admissionType || profile.admissionType,
      feeStatus: feeStatus || profile.feeStatus,
      status: status !== undefined ? status : profile.status,
    });
  }

  const updatedProfile = await StudentProfile.findByPk(profile.id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
    ],
  });

  res.status(created ? 201 : 200).json({
    success: true,
    message: created ? 'Profile created successfully' : 'Profile updated successfully',
    data: updatedProfile,
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove sensitive fields
  delete updateData.studentId;
  delete updateData.roleId;
  delete updateData.password;

  // Validate email if provided
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return next(new ErrorResponse('Invalid email format', 400));
    }
  }

  // Validate semester if provided
  if (updateData.semester) {
    if (updateData.semester < 1 || updateData.semester > 8) {
      return next(new ErrorResponse('Semester must be between 1 and 8', 400));
    }
  }

  const profile = await StudentProfile.findByPk(id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  await profile.update(updateData);

  const updatedProfile = await StudentProfile.findByPk(id, {
    include: [
      { model: Department, as: 'department', attributes: ['id', 'short_name', 'full_name'] },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});

// Update profile photo
export const updateProfilePhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { photo } = req.body;

  if (!photo) {
    return next(new ErrorResponse('Photo URL is required', 400));
  }

  const profile = await StudentProfile.findByPk(id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  await profile.update({ photo });

  res.status(200).json({
    success: true,
    message: 'Profile photo updated successfully',
    data: { photo: profile.photo },
  });
});

// Update fee status
export const updateFeeStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { feeStatus } = req.body;

  if (!feeStatus || !['paid', 'pending', 'partial'].includes(feeStatus)) {
    return next(new ErrorResponse('Invalid fee status', 400));
  }

  const profile = await StudentProfile.findByPk(id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  await profile.update({ feeStatus });

  res.status(200).json({
    success: true,
    message: 'Fee status updated successfully',
    data: { feeStatus: profile.feeStatus },
  });
});

// Update student status
export const updateStudentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'inactive', 'graduated', 'dropped', 'suspended'].includes(status)) {
    return next(new ErrorResponse('Invalid student status', 400));
  }

  const profile = await StudentProfile.findByPk(id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  await profile.update({ status });

  res.status(200).json({
    success: true,
    message: 'Student status updated successfully',
    data: { status: profile.status },
  });
});

// Delete profile
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const profile = await StudentProfile.findByPk(id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with ID: ${id}`, 404));
  }

  await profile.destroy();

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully',
  });
});

// Get profile statistics
export const getProfileStatistics = asyncHandler(async (req, res, next) => {
  const { departmentId } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;

  const totalStudents = await StudentProfile.count({ where });
  const activeStudents = await StudentProfile.count({ where: { ...where, status: 'active' } });
  const inactiveStudents = await StudentProfile.count({ where: { ...where, status: 'inactive' } });
  const graduatedStudents = await StudentProfile.count({ where: { ...where, status: 'graduated' } });
  const droppedStudents = await StudentProfile.count({ where: { ...where, status: 'dropped' } });
  const suspendedStudents = await StudentProfile.count({ where: { ...where, status: 'suspended' } });

  const feePaid = await StudentProfile.count({ where: { ...where, feeStatus: 'paid' } });
  const feePending = await StudentProfile.count({ where: { ...where, feeStatus: 'pending' } });
  const feePartial = await StudentProfile.count({ where: { ...where, feeStatus: 'partial' } });

  const byGender = await StudentProfile.findAll({
    where,
    attributes: ['gender', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['gender'],
    raw: true,
  });

  const bySemester = await StudentProfile.findAll({
    where,
    attributes: ['semester', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['semester'],
    order: [['semester', 'ASC']],
    raw: true,
  });

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      byStatus: {
        active: activeStudents,
        inactive: inactiveStudents,
        graduated: graduatedStudents,
        dropped: droppedStudents,
        suspended: suspendedStudents,
      },
      byFeeStatus: {
        paid: feePaid,
        pending: feePending,
        partial: feePartial,
      },
      byGender,
      bySemester,
    },
  });
});
