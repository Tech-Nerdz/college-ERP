import asyncHandler from '../../middleware/async.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { models } from '../../models/index.js';
import { Op } from 'sequelize';
const { StudentAttendance, Student, Subject, Faculty, Class } = models;

const getStudentId = async (userOrId, next) => {
    // if already a student instance (has studentId), return its id
    if (userOrId && typeof userOrId === 'object' && userOrId.studentId) {
        return userOrId.id;
    }
    // userId column doesn't exist in database
    next(new ErrorResponse('Student profile not accessible', 404));
    return null;
};

// @desc   Get all attendance records for logged-in student
// @route  GET /api/v1/student/attendance
// @access Private/Student
export const getMyAttendance = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };

    // Apply filters if provided
    if (req.query.fromDate && req.query.toDate) {
        where.classDate = {
            [Op.between]: [req.query.fromDate, req.query.toDate]
        };
    }

    if (req.query.attendanceStatus) {
        where.attendanceStatus = req.query.attendanceStatus;
    }

    const attendance = await StudentAttendance.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['subject_id', 'name', 'code'] },
            { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'name'] },
            { model: Class, as: 'classSection', attributes: ['section', 'semester', 'year'] }
        ],
        order: [['classDate', 'DESC'], ['periodSessionNumber', 'DESC']]
    });

    res.status(200).json({ success: true, count: attendance.length, data: attendance });
});

// @desc   Get attendance by subject for logged-in student
// @route  GET /api/v1/student/attendance/subject/:subjectId
// @access Private/Student
export const getAttendanceBySubject = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId, subjectId: req.params.subjectId };

    if (req.query.fromDate && req.query.toDate) {
        where.classDate = {
            [Op.between]: [req.query.fromDate, req.query.toDate]
        };
    }

    const attendance = await StudentAttendance.findAll({
        where,
        include: [
            { model: Subject, as: 'subject', attributes: ['subject_id', 'name', 'code'] },
            { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'name'] }
        ],
        order: [['classDate', 'DESC'], ['periodSessionNumber', 'DESC']]
    });

    // Calculate attendance percentage
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => ['Present', 'On-Duty'].includes(a.attendanceStatus)).length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    res.status(200).json({
        success: true,
        count: attendance.length,
        stats: {
            totalClasses,
            presentClasses,
            absentClasses: totalClasses - presentClasses,
            attendancePercentage
        },
        data: attendance
    });
});

// @desc   Get attendance summary for logged-in student
// @route  GET /api/v1/student/attendance/summary
// @access Private/Student
export const getAttendanceSummary = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const where = { studentId };

    if (req.query.fromDate && req.query.toDate) {
        where.classDate = {
            [Op.between]: [req.query.fromDate, req.query.toDate]
        };
    }

    const attendance = await StudentAttendance.findAll({
        where,
        include: [{ model: Subject, as: 'subject', attributes: ['subject_id', 'name', 'code'] }]
    });

    // Group by subject and calculate percentages
    const subjectSummary = {};
    attendance.forEach(record => {
        const subjectId = record.subjectId;
        if (!subjectSummary[subjectId]) {
            subjectSummary[subjectId] = {
                subject: record.subject,
                totalClasses: 0,
                presentClasses: 0,
                absentClasses: 0,
                lateClasses: 0,
                onDutyClasses: 0
            };
        }
        subjectSummary[subjectId].totalClasses++;
        if (record.attendanceStatus === 'Present') {
            subjectSummary[subjectId].presentClasses++;
        } else if (record.attendanceStatus === 'Absent') {
            subjectSummary[subjectId].absentClasses++;
        } else if (record.attendanceStatus === 'Late') {
            subjectSummary[subjectId].lateClasses++;
        } else if (record.attendanceStatus === 'On-Duty') {
            subjectSummary[subjectId].onDutyClasses++;
        }
    });

    // Calculate percentages
    Object.values(subjectSummary).forEach(summary => {
        const effectivePresent = summary.presentClasses + summary.onDutyClasses;
        summary.attendancePercentage = summary.totalClasses > 0 
            ? ((effectivePresent / summary.totalClasses) * 100).toFixed(2)
            : 0;
    });

    res.status(200).json({ success: true, data: Object.values(subjectSummary) });
});

// @desc   Get attendance by date for logged-in student
// @route  GET /api/v1/student/attendance/date/:date
// @access Private/Student
export const getAttendanceByDate = asyncHandler(async (req, res, next) => {
    const studentId = await getStudentId(req.user, next);
    if (!studentId) return;

    const attendance = await StudentAttendance.findAll({
        where: { studentId, classDate: req.params.date },
        include: [
            { model: Subject, as: 'subject', attributes: ['subject_id', 'name', 'code'] },
            { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'name'] }
        ],
        order: [['periodSessionNumber', 'ASC']]
    });

    res.status(200).json({ success: true, count: attendance.length, data: attendance });
});

// @desc   Mark attendance (Faculty)
// @route  POST /api/v1/student/attendance
// @access Private/Faculty
export const markAttendance = asyncHandler(async (req, res, next) => {
    const { attendanceRecords } = req.body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
        return next(new ErrorResponse('Please provide attendance records', 400));
    }

    // Get faculty ID from user
    const facultyId = req.user.facultyId;
    if (!facultyId) {
        return next(new ErrorResponse('Faculty profile not found', 404));
    }

    // Add faculty ID to each record
    const recordsWithFacultyId = attendanceRecords.map(record => ({
        ...record,
        facultyId
    }));

    // Bulk create attendance records
    const createdRecords = await StudentAttendance.bulkCreate(recordsWithFacultyId, {
        ignoreDuplicates: true // Skip duplicate entries based on unique constraint
    });

    res.status(201).json({
        success: true,
        count: createdRecords.length,
        data: createdRecords
    });
});

// @desc   Update attendance record (Faculty)
// @route  PUT /api/v1/student/attendance/:id
// @access Private/Faculty
export const updateAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await StudentAttendance.findByPk(req.params.id);

    if (!attendance) {
        return next(new ErrorResponse('Attendance record not found', 404));
    }

    // Update only allowed fields
    const { attendanceStatus, remarks } = req.body;
    if (attendanceStatus) attendance.attendanceStatus = attendanceStatus;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
});

// @desc   Delete attendance record (Admin)
// @route  DELETE /api/v1/student/attendance/:id
// @access Private/Admin
export const deleteAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await StudentAttendance.findByPk(req.params.id);

    if (!attendance) {
        return next(new ErrorResponse('Attendance record not found', 404));
    }

    await attendance.destroy();
    res.status(200).json({ success: true, data: {} });
});

// @desc   Get attendance report (Admin/Faculty)
// @route  GET /api/v1/student/attendance/report
// @access Private/Admin/Faculty
export const getAttendanceReport = asyncHandler(async (req, res, next) => {
    const where = {};

    // Apply filters
    if (req.query.classId) where.classSectionId = req.query.classId;
    if (req.query.subjectId) where.subjectId = req.query.subjectId;
    if (req.query.fromDate && req.query.toDate) {
        where.classDate = {
            [Op.between]: [req.query.fromDate, req.query.toDate]
        };
    }

    const attendance = await StudentAttendance.findAll({
        where,
        include: [
            { model: Student, as: 'student', attributes: ['register_no', 'name', 'email'] },
            { model: Subject, as: 'subject', attributes: ['subject_id', 'name', 'code'] },
            { model: Faculty, as: 'faculty', attributes: ['faculty_id', 'name'] },
            { model: Class, as: 'classSection', attributes: ['section', 'semester', 'year'] }
        ],
        order: [['classDate', 'DESC'], ['periodSessionNumber', 'DESC']]
    });

    res.status(200).json({ success: true, count: attendance.length, data: attendance });
});
