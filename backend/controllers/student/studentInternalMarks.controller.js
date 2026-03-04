import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';
const { StudentInternalMarks, Student, Subject, User } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all internal marks for logged-in student
// @route  GET /api/v1/student/internal-marks
// @access Private/Student
export const getMyInternalMarks = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };

    // Apply filters if provided
    if (req.query.semester) where.semester = parseInt(req.query.semester);
    if (req.query.academicYear) where.academicYear = req.query.academicYear;
    if (req.query.internalNumber) where.internalNumber = parseInt(req.query.internalNumber);
    if (req.query.subjectId) where.subjectId = req.query.subjectId;

    const internalMarks = await StudentInternalMarks.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code', 'credits', 'type'] }
        ],
        order: [['semester', 'ASC'], ['internalNumber', 'ASC']]
    });

    res.status(200).json({ success: true, count: internalMarks.length, data: internalMarks });
});

// @desc   Get internal marks by semester for logged-in student
// @route  GET /api/v1/student/internal-marks/semester/:semester
// @access Private/Student
export const getInternalMarksBySemester = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId, semester: parseInt(req.params.semester) };

    if (req.query.academicYear) where.academicYear = req.query.academicYear;

    const internalMarks = await StudentInternalMarks.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code', 'credits'] }
        ],
        order: [['internalNumber', 'ASC']]
    });

    // Calculate totals
    const totalScore = internalMarks.reduce((sum, mark) => sum + parseFloat(mark.totalScore || 0), 0);
    const average = internalMarks.length > 0 ? (totalScore / internalMarks.length).toFixed(2) : 0;

    res.status(200).json({
        success: true,
        count: internalMarks.length,
        stats: {
            totalSubjects: internalMarks.length,
            totalScore: totalScore.toFixed(2),
            averageScore: average,
            maxPossibleScore: internalMarks.length * 100,
            percentage: ((totalScore / (internalMarks.length * 100)) * 100).toFixed(2)
        },
        data: internalMarks
    });
});

// @desc   Get internal marks by subject for logged-in student
// @route  GET /api/v1/student/internal-marks/subject/:subjectId
// @access Private/Student
export const getInternalMarksBySubject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId, subjectId: req.params.subjectId };

    const internalMarks = await StudentInternalMarks.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code', 'credits'] }
        ],
        order: [['semester', 'ASC'], ['internalNumber', 'ASC']]
    });

    if (internalMarks.length === 0) {
        return next(new ErrorResponse('No internal marks found for this subject', 404));
    }

    res.status(200).json({ success: true, count: internalMarks.length, data: internalMarks });
});

// @desc   Get single internal mark record
// @route  GET /api/v1/student/internal-marks/:id
// @access Private/Student
export const getInternalMark = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const mark = await StudentInternalMarks.findOne({
        where: { id: req.params.id, studentId },
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code', 'credits', 'type'] }
        ]
    });

    if (!mark) {
        return next(new ErrorResponse('Internal mark record not found', 404));
    }

    res.status(200).json({ success: true, data: mark });
});

// @desc   Create/Update internal marks (Admin/Faculty)
// @route  POST /api/v1/student/internal-marks
// @access Private/Admin/Faculty
export const createOrUpdateInternalMark = asyncHandler(async (req, res, next) => {
    const { studentId, subjectId, semester, academicYear, internalNumber, internalScore, assessmentScore } = req.body;

    // Validate required fields
    if (!studentId || !subjectId || !semester || !academicYear || !internalNumber) {
        return next(new ErrorResponse('Missing required fields: studentId, subjectId, semester, academicYear, internalNumber', 400));
    }

    if (!internalScore || !assessmentScore) {
        return next(new ErrorResponse('Missing required fields: internalScore, assessmentScore', 400));
    }

    // Validate score ranges
    if (internalScore < 0 || internalScore > 60) {
        return next(new ErrorResponse('internalScore must be between 0 and 60', 400));
    }

    if (assessmentScore < 0 || assessmentScore > 40) {
        return next(new ErrorResponse('assessmentScore must be between 0 and 40', 400));
    }

    if (![1, 2].includes(internalNumber)) {
        return next(new ErrorResponse('internalNumber must be 1 or 2', 400));
    }

    // Find or create
    const [mark, created] = await StudentInternalMarks.findOrCreate({
        where: { studentId, subjectId, semester, academicYear, internalNumber },
        defaults: { internalScore, assessmentScore }
    });

    if (!created) {
        await mark.update({ internalScore, assessmentScore });
    }

    res.status(created ? 201 : 200).json({
        success: true,
        message: created ? 'Internal mark created' : 'Internal mark updated',
        data: mark
    });
});

// @desc   Bulk create/update internal marks (Admin/Faculty)
// @route  POST /api/v1/student/internal-marks/bulk
// @access Private/Admin/Faculty
export const bulkCreateInternalMarks = asyncHandler(async (req, res, next) => {
    const { marks } = req.body;

    if (!marks || !Array.isArray(marks) || marks.length === 0) {
        return next(new ErrorResponse('Please provide an array of marks', 400));
    }

    try {
        const createdMarks = [];
        const updatedMarks = [];

        for (const mark of marks) {
            const [record, created] = await StudentInternalMarks.findOrCreate({
                where: {
                    studentId: mark.studentId,
                    subjectId: mark.subjectId,
                    semester: mark.semester,
                    academicYear: mark.academicYear,
                    internalNumber: mark.internalNumber
                },
                defaults: {
                    internalScore: mark.internalScore,
                    assessmentScore: mark.assessmentScore
                }
            });

            if (!created) {
                await record.update({
                    internalScore: mark.internalScore,
                    assessmentScore: mark.assessmentScore
                });
                updatedMarks.push(record);
            } else {
                createdMarks.push(record);
            }
        }

        res.status(201).json({
            success: true,
            data: {
                created: createdMarks.length,
                updated: updatedMarks.length,
                total: marks.length
            }
        });
    } catch (error) {
        return next(new ErrorResponse('Error processing bulk marks: ' + error.message, 400));
    }
});

// @desc   Update internal mark scores (Admin/Faculty)
// @route  PUT /api/v1/student/internal-marks/:id
// @access Private/Admin/Faculty
export const updateInternalMark = asyncHandler(async (req, res, next) => {
    const { internalScore, assessmentScore } = req.body;

    const mark = await StudentInternalMarks.findByPk(req.params.id);

    if (!mark) {
        return next(new ErrorResponse('Internal mark record not found', 404));
    }

    // Validate score ranges if provided
    if (internalScore !== undefined && (internalScore < 0 || internalScore > 60)) {
        return next(new ErrorResponse('internalScore must be between 0 and 60', 400));
    }

    if (assessmentScore !== undefined && (assessmentScore < 0 || assessmentScore > 40)) {
        return next(new ErrorResponse('assessmentScore must be between 0 and 40', 400));
    }

    await mark.update({
        internalScore: internalScore ?? mark.internalScore,
        assessmentScore: assessmentScore ?? mark.assessmentScore
    });

    res.status(200).json({ success: true, data: mark });
});

// @desc   Delete internal mark (Admin only)
// @route  DELETE /api/v1/student/internal-marks/:id
// @access Private/Admin
export const deleteInternalMark = asyncHandler(async (req, res, next) => {
    const mark = await StudentInternalMarks.findByPk(req.params.id);

    if (!mark) {
        return next(new ErrorResponse('Internal mark record not found', 404));
    }

    await mark.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Get internal marks report (Admin/Faculty)
// @route  GET /api/v1/student/internal-marks/report
// @access Private/Admin/Faculty
export const getInternalMarksReport = asyncHandler(async (req, res, next) => {
    const where = {};

    // Apply filters
    if (req.query.studentId) where.studentId = req.query.studentId;
    if (req.query.semester) where.semester = parseInt(req.query.semester);
    if (req.query.academicYear) where.academicYear = req.query.academicYear;
    if (req.query.subjectId) where.subjectId = req.query.subjectId;

    const marks = await StudentInternalMarks.findAll({
        where,
        include: [
            { 
                model: Student, 
                as: 'student', 
                attributes: ['register_no', 'name', 'email', 'department_id'] 
            },
            { 
                model: Subject, 
                as: 'subject', 
                attributes: ['id', 'name', 'code', 'credits'] 
            }
        ],
        order: [['semester', 'ASC'], ['internalNumber', 'ASC']]
    });

    res.status(200).json({ success: true, count: marks.length, data: marks });
});

// @desc   Get internal marks performance analysis (Student)
// @route  GET /api/v1/student/internal-marks/analysis
// @access Private/Student
export const getPerformanceAnalysis = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const marks = await StudentInternalMarks.findAll({
        where: { studentId },
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
        ]
    });

    // Analysis by semester
    const bySemester = {};
    marks.forEach(mark => {
        if (!bySemester[mark.semester]) {
            bySemester[mark.semester] = {
                semester: mark.semester,
                subjects: 0,
                totalScore: 0,
                averageScore: 0,
                marks: []
            };
        }
        bySemester[mark.semester].subjects++;
        bySemester[mark.semester].totalScore += parseFloat(mark.totalScore);
        bySemester[mark.semester].marks.push(mark);
    });

    // Calculate averages
    Object.keys(bySemester).forEach(sem => {
        bySemester[sem].averageScore = (bySemester[sem].totalScore / bySemester[sem].subjects).toFixed(2);
    });

    // Overall statistics
    const totalScore = marks.reduce((sum, mark) => sum + parseFloat(mark.totalScore), 0);
    const overallAverage = marks.length > 0 ? (totalScore / marks.length).toFixed(2) : 0;
    const highestScore = marks.length > 0 ? Math.max(...marks.map(m => parseFloat(m.totalScore))) : 0;
    const lowestScore = marks.length > 0 ? Math.min(...marks.map(m => parseFloat(m.totalScore))) : 0;

    res.status(200).json({
        success: true,
        data: {
            overallStats: {
                totalMarksRecorded: marks.length,
                overallAverage,
                totalScore: totalScore.toFixed(2),
                highestScore: highestScore.toFixed(2),
                lowestScore: lowestScore.toFixed(2),
                maxPossibleScore: marks.length * 100,
                percentage: marks.length > 0 ? ((totalScore / (marks.length * 100)) * 100).toFixed(2) : 0
            },
            bySemester: Object.values(bySemester).sort((a, b) => a.semester - b.semester)
        }
    });
});

// @desc   Download internal marks as CSV (Student/Admin)
// @route  GET /api/v1/student/internal-marks/export/csv
// @access Private/Student/Admin
export const exportInternalMarksCSV = asyncHandler(async (req, res, next) => {
    const studentId = req.query.studentId || (req.user.studentId ? req.user.id : null);

    if (!studentId) {
        return next(new ErrorResponse('Student ID required', 400));
    }

    const marks = await StudentInternalMarks.findAll({
        where: { studentId },
        include: [
            { model: Student, as: 'student', attributes: ['register_no', 'name'] },
            { model: Subject, as: 'subject', attributes: ['code', 'name'] }
        ],
        order: [['semester', 'ASC'], ['internalNumber', 'ASC']]
    });

    if (marks.length === 0) {
        return next(new ErrorResponse('No marks found for export', 404));
    }

    // Generate CSV
    let csv = 'Register No,Student Name,Subject Code,Subject Name,Semester,Internal Number,Internal Score (out of 60),Assessment Score (out of 40),Total Score (out of 100),Date\n';

    marks.forEach(mark => {
        csv += `${mark.student?.register_no},${mark.student?.name},"${mark.subject?.code}","${mark.subject?.name}",${mark.semester},${mark.internalNumber},${mark.internalScore},${mark.assessmentScore},${mark.totalScore},${mark.createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="internal_marks.csv"');
    res.send(csv);
});
