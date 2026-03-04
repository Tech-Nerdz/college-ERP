import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentSport, Student, User } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all sports activities for logged-in student
// @route  GET /api/v1/student/sports
// @access Private/Student
export const getMySports = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };

    // Apply filters if provided
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.level) where.level = req.query.level;

    const sports = await StudentSport.findAll({
        where,
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['joinedDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// @desc   Get sports by category for logged-in student
// @route  GET /api/v1/student/sports/category/:category
// @access Private/Student
export const getSportsByCategory = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sports = await StudentSport.findAll({
        where: { studentId, category: req.params.category },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['joinedDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// @desc   Get sports by level for logged-in student
// @route  GET /api/v1/student/sports/level/:level
// @access Private/Student
export const getSportsByLevel = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sports = await StudentSport.findAll({
        where: { studentId, level: req.params.level },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['joinedDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// @desc   Get single sport activity
// @route  GET /api/v1/student/sports/:id
// @access Private/Student
export const getSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }]
    });

    if (!sport) {
        return next(new ErrorResponse('Sport activity not found', 404));
    }

    res.status(200).json({ success: true, data: sport });
});

// @desc   Create new sport activity
// @route  POST /api/v1/student/sports
// @access Private/Student
export const createSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.create({
        ...req.body,
        studentId,
        approvalStatus: 'pending'
    });

    res.status(201).json({ success: true, data: sport });
});

// @desc   Update sport activity (resets approval to pending)
// @route  PUT /api/v1/student/sports/:id
// @access Private/Student
export const updateSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({ where: { id: req.params.id, studentId } });
    if (!sport) {
        return next(new ErrorResponse('Sport activity not found', 404));
    }

    // Prevent student from manually setting approval fields
    delete req.body.approvedById;
    delete req.body.approvalDate;
    delete req.body.studentId;

    await sport.update({ ...req.body, approvalStatus: 'pending' });
    res.status(200).json({ success: true, data: sport });
});

// @desc   Delete sport activity
// @route  DELETE /api/v1/student/sports/:id
// @access Private/Student
export const deleteSport = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const sport = await StudentSport.findOne({ where: { id: req.params.id, studentId } });
    if (!sport) {
        return next(new ErrorResponse('Sport activity not found', 404));
    }

    await sport.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Get all sports activities (Admin/Faculty)
// @route  GET /api/v1/student/sports/all/list
// @access Private/Admin/Faculty
export const getAllSports = asyncHandler(async (req, res, next) => {
    const where = {};

    // Apply filters
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.level) where.level = req.query.level;
    if (req.query.studentId) where.studentId = req.query.studentId;

    const sports = await StudentSport.findAll({
        where,
        include: [
            { model: Student, as: 'student', attributes: ['register_no', 'name', 'email', 'department_id'] },
            { model: User, as: 'approvedBy', attributes: ['name'] }
        ],
        order: [['joinedDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: sports.length, data: sports });
});

// @desc   Approve/reject sport activity (Admin/Faculty)
// @route  PUT /api/v1/student/sports/:id/approval
// @access Private/Admin/Faculty
export const updateApprovalStatus = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }

    const sport = await StudentSport.findByPk(req.params.id);
    if (!sport) {
        return next(new ErrorResponse('Sport activity not found', 404));
    }

    await sport.update({
        approvalStatus,
        approvalRemarks: approvalRemarks || null,
        approvedById: req.user.id,
        approvalDate: new Date()
    });

    res.status(200).json({ success: true, data: sport });
});
