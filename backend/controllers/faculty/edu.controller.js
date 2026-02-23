import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { models } from '../../models/index.js';

const { Faculty, FacultyEduQualification } = models;

// @desc      Get current faculty education qualifications
// @route     GET /api/v1/faculty/education
// @access    Private/Faculty
export const getMyEducation = asyncHandler(async (req, res, next) => {
    // 1. Get Employee ID (faculty_college_code) from req.user
    const faculty_college_code = req.user.faculty_college_code;

    // 2. Retrieve faculty_id using faculty_college_code
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // 3. Retrieve education records using the found faculty_id
    const education = await FacultyEduQualification.findAll({
        where: { faculty_id: faculty.faculty_id }
    });

    res.status(200).json({
        success: true,
        data: education
    });
});

// @desc      Add new education qualification
// @route     POST /api/v1/faculty/education
// @access    Private/Faculty
export const addEducation = asyncHandler(async (req, res, next) => {
    // 1. Get Employee ID (faculty_college_code) from req.user (same as in UI)
    const faculty_college_code = req.user.faculty_college_code;

    // 2. Retrieve faculty_id using the faculty_college_code (Employee ID)
    // This matches the user request: "compares the faculty_id then it retrieves the faculty_id using the faculty_college_code"
    const faculty = await Faculty.findOne({
        where: { faculty_college_code },
        attributes: ['faculty_id']
    });

    if (!faculty) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // 3. Create the education record using the retrieved faculty_id
    const educationData = {
        ...req.body,
        faculty_id: faculty.faculty_id
    };

    const education = await FacultyEduQualification.create(educationData);

    res.status(201).json({
        success: true,
        data: education
    });
});

// @desc      Update education qualification
// @route     PUT /api/v1/faculty/education/:id
// @access    Private/Faculty
export const updateEducation = asyncHandler(async (req, res, next) => {
    let education = await FacultyEduQualification.findByPk(req.params.id);

    if (!education) {
        return next(new ErrorResponse(`Education record not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (education.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to update this record', 401));
    }

    education = await education.update(req.body);

    res.status(200).json({
        success: true,
        data: education
    });
});

// @desc      Delete education qualification
// @route     DELETE /api/v1/faculty/education/:id
// @access    Private/Faculty
export const deleteEducation = asyncHandler(async (req, res, next) => {
    const education = await FacultyEduQualification.findByPk(req.params.id);

    if (!education) {
        return next(new ErrorResponse(`Education record not found with id of ${req.params.id}`, 404));
    }

    // Ensure the record belongs to the current faculty
    const faculty = await Faculty.findOne({
        where: { faculty_college_code: req.user.faculty_college_code },
        attributes: ['faculty_id']
    });

    if (education.faculty_id !== faculty.faculty_id) {
        return next(new ErrorResponse('Not authorized to delete this record', 401));
    }

    await education.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
