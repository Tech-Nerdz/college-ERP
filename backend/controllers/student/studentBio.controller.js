import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
const { StudentBio, Student } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get biographical data for logged-in student
// @route  GET /api/v1/student/bio
// @access Private/Student
export const getMyBio = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const bio = await StudentBio.findOne({
        where: { studentId },
        include: [{ model: Student, as: 'student', attributes: ['register_no', 'name', 'email'] }]
    });

    if (!bio) {
        return next(new ErrorResponse('Biographical data not found', 404));
    }

    res.status(200).json({ success: true, data: bio });
});

// @desc   Create biographical data for logged-in student
// @route  POST /api/v1/student/bio
// @access Private/Student
export const createBio = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    // Check if bio already exists
    const existingBio = await StudentBio.findOne({ where: { studentId } });
    if (existingBio) {
        return next(new ErrorResponse('Biographical data already exists. Use update instead.', 400));
    }

    const bio = await StudentBio.create({
        ...req.body,
        studentId
    });

    res.status(201).json({ success: true, data: bio });
});

// @desc   Update biographical data for logged-in student
// @route  PUT /api/v1/student/bio
// @access Private/Student
export const updateBio = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const bio = await StudentBio.findOne({ where: { studentId } });
    if (!bio) {
        return next(new ErrorResponse('Biographical data not found', 404));
    }

    // Prevent student from changing studentId
    delete req.body.studentId;

    await bio.update(req.body);
    res.status(200).json({ success: true, data: bio });
});

// @desc   Delete biographical data for logged-in student
// @route  DELETE /api/v1/student/bio
// @access Private/Student
export const deleteBio = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const bio = await StudentBio.findOne({ where: { studentId } });
    if (!bio) {
        return next(new ErrorResponse('Biographical data not found', 404));
    }

    await bio.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Get biographical data for specific student (Admin/Faculty)
// @route  GET /api/v1/student/bio/:studentId
// @access Private/Admin/Faculty
export const getStudentBio = asyncHandler(async (req, res, next) => {
    const bio = await StudentBio.findOne({
        where: { studentId: req.params.studentId },
        include: [{ model: Student, as: 'student', attributes: ['register_no', 'name', 'email', 'department_id', 'class_section_id'] }]
    });

    if (!bio) {
        return next(new ErrorResponse('Biographical data not found', 404));
    }

    res.status(200).json({ success: true, data: bio });
});
