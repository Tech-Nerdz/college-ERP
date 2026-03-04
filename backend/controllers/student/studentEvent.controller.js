import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentEvent, Student, User } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all events for logged-in student
// @route  GET /api/v1/student/events
// @access Private/Student
export const getMyEvents = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };

    // Apply filters if provided
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;
    if (req.query.eventType) where.eventType = req.query.eventType;
    if (req.query.level) where.level = req.query.level;

    const events = await StudentEvent.findAll({
        where,
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['eventDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: events.length, data: events });
});

// @desc   Get events by type for logged-in student
// @route  GET /api/v1/student/events/type/:type
// @access Private/Student
export const getEventsByType = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const events = await StudentEvent.findAll({
        where: { studentId, eventType: req.params.type },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['eventDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: events.length, data: events });
});

// @desc   Get events by level for logged-in student
// @route  GET /api/v1/student/events/level/:level
// @access Private/Student
export const getEventsByLevel = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const events = await StudentEvent.findAll({
        where: { studentId, level: req.params.level },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }],
        order: [['eventDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: events.length, data: events });
});

// @desc   Get single event
// @route  GET /api/v1/student/events/:id
// @access Private/Student
export const getEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({
        where: { id: req.params.id, studentId },
        include: [{ model: User, as: 'approvedBy', attributes: ['name'] }]
    });

    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    res.status(200).json({ success: true, data: event });
});

// @desc   Create new event
// @route  POST /api/v1/student/events
// @access Private/Student
export const createEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.create({
        ...req.body,
        studentId,
        approvalStatus: 'pending'
    });

    res.status(201).json({ success: true, data: event });
});

// @desc   Update event (resets approval to pending)
// @route  PUT /api/v1/student/events/:id
// @access Private/Student
export const updateEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({ where: { id: req.params.id, studentId } });
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    // Prevent student from manually setting approval fields
    delete req.body.approvedById;
    delete req.body.approvalDate;
    delete req.body.studentId;

    await event.update({ ...req.body, approvalStatus: 'pending' });
    res.status(200).json({ success: true, data: event });
});

// @desc   Delete event
// @route  DELETE /api/v1/student/events/:id
// @access Private/Student
export const deleteEvent = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const event = await StudentEvent.findOne({ where: { id: req.params.id, studentId } });
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    await event.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Get all events (Admin/Faculty)
// @route  GET /api/v1/student/events/all/list
// @access Private/Admin/Faculty
export const getAllEvents = asyncHandler(async (req, res, next) => {
    const where = {};

    // Apply filters
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;
    if (req.query.eventType) where.eventType = req.query.eventType;
    if (req.query.level) where.level = req.query.level;
    if (req.query.studentId) where.studentId = req.query.studentId;

    const events = await StudentEvent.findAll({
        where,
        include: [
            { model: Student, as: 'student', attributes: ['register_no', 'name', 'email', 'department_id'] },
            { model: User, as: 'approvedBy', attributes: ['name'] }
        ],
        order: [['eventDate', 'DESC']]
    });

    res.status(200).json({ success: true, count: events.length, data: events });
});

// @desc   Approve/reject event (Admin/Faculty)
// @route  PUT /api/v1/student/events/:id/approval
// @access Private/Admin/Faculty
export const updateApprovalStatus = asyncHandler(async (req, res, next) => {
    const { approvalStatus, approvalRemarks } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
        return next(new ErrorResponse('approvalStatus must be approved or rejected', 400));
    }

    const event = await StudentEvent.findByPk(req.params.id);
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    await event.update({
        approvalStatus,
        approvalRemarks: approvalRemarks || null,
        approvedById: req.user.id,
        approvalDate: new Date()
    });

    res.status(200).json({ success: true, data: event });
});
