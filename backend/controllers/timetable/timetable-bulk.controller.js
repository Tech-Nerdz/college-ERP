import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import { sequelize, models } from '../../models/index.js';
import { TimetableSimple } from '../../models/index.js';
import { Op } from 'sequelize';
import csvParser from 'csv-parser';
import fs from 'fs';

// @desc      Bulk upload timetable from CSV
// @route     POST /api/v1/timetable/bulk-upload
// @access    Private
export const bulkUploadTimetable = asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload a CSV file', 400));
  }

  // Get academicYear and semester from request body (optional - can be in CSV)
  const { academicYear: bodyAcademicYear, semester } = req.body;

  // Parse CSV file - use let for results since we need to reassign
  let results = [];
  const errors = [];
  
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => {
          // Validate required fields
          const requiredFields = ['facultyId', 'facultyName', 'department', 'year', 'section', 'day', 'hour', 'subject'];
          const missingFields = requiredFields.filter(field => !data[field] || (typeof data[field] === 'string' && data[field].trim() === ''));
          
          if (missingFields.length > 0) {
            errors.push({
              row: results.length + 1,
              error: `Missing required fields: ${missingFields.join(', ')}`,
              data
            });
          } else {
            // Validate required fields
            const hourStr = data.hour?.toString().trim();
            const hour = hourStr ? parseInt(hourStr, 10) : null;
            
            if (!hour || isNaN(hour)) {
              errors.push({
                row: results.length + 1,
                error: `Invalid hour value: ${data.hour}`,
                data
              });
              return; // Skip this row
            }
            
            // Normalize and validate data
            // Use academicYear from CSV or from request body; treat blank as null
            let academicYearValue = data.academicYear ? data.academicYear.trim() : '';
            if (!academicYearValue) {
              academicYearValue = bodyAcademicYear ? bodyAcademicYear.trim() : null;
            }
            if (academicYearValue === '') academicYearValue = null;
            
            results.push({
              facultyId: data.facultyId.trim(),
              facultyName: data.facultyName.trim(),
              department: data.department.trim(),
              year: data.year.trim(),
              section: data.section ? data.section.trim() : '',
              day: data.day.trim(),
              hour: hour,
              subject: data.subject.trim(),
              academicYear: academicYearValue
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  } catch (error) {
    return next(new ErrorResponse(`Error parsing CSV file: ${error.message}`, 400));
  }

  // Check if there are valid rows to insert
  if (results.length === 0) {
    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse('No valid rows found in CSV file', 400));
  }

  // Check for duplicates within the CSV itself (same faculty, day, hour)
  const seen = new Set();
  const csvDuplicates = [];
  
  results.forEach((row, index) => {
    const key = `${row.facultyId}|${row.day}|${row.hour}`;
    if (seen.has(key)) {
      csvDuplicates.push({
        row: index + 2, // +2 because row 1 is header and index starts at 0
        facultyId: row.facultyId,
        day: row.day,
        hour: row.hour,
        subject: row.subject
      });
    }
    seen.add(key);
  });
  
  if (csvDuplicates.length > 0) {
    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return next(new ErrorResponse(`Duplicate entries found in CSV file: ${csvDuplicates.map(d => `Row ${d.row} (${d.facultyId} on ${d.day} hour ${d.hour})`).join(', ')}`, 400));
  }

  // Get unique department names from the uploaded data
  // Note: We use department name (string) directly, not departmentId
  
  console.log('[DEBUG] Processing', results.length, 'rows from CSV');

  // Add departmentId to each result - using map creates new array, no reassignment needed
  // Validate all fields and ensure no NaN/undefined values
  // Convert Roman year to numeric
  const romanToNumber = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4,
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4
  };
  
  results = results.map(row => {
    // Validate and parse hour
    const hourValue = row.hour;
    if (hourValue === undefined || hourValue === null || isNaN(hourValue)) {
      console.error('[ERROR] Invalid hour value:', row.hour, 'Row:', row);
      throw new Error(`Invalid hour value: ${row.hour} at faculty ${row.facultyId}`);
    }
    
    // Convert Roman year to numeric
    let yearValue = row.year?.toString().trim();
    if (romanToNumber[yearValue]) {
      yearValue = romanToNumber[yearValue];
    }
    yearValue = parseInt(yearValue, 10);
    
    // Validate year
    if (yearValue === undefined || yearValue === null || isNaN(yearValue) || ![1,2,3,4].includes(yearValue)) {
      console.error('[ERROR] Invalid year value:', row.year, 'Row:', row);
      throw new Error(`Invalid year value: ${row.year} at faculty ${row.facultyId}`);
    }
    
    return {
      facultyId: row.facultyId,
      facultyName: row.facultyName,
      department: row.department,
      year: yearValue,
      section: row.section || null,
      day: row.day,
      hour: hourValue,
      subject: row.subject,
      academicYear: row.academicYear || null
    };
  });

  // Get unique faculty IDs and academic years from the uploaded data
  const uniqueFacultyIds = [...new Set(results.map(row => row.facultyId))];
  // ignore null/undefined academic years when computing unique list
  const uniqueAcademicYears = [...new Set(results.map(row => row.academicYear).filter(v => v != null))];

  // Start transaction
  let transaction;
  try {
    transaction = await sequelize.transaction();
    
    // Delete existing records for uploaded faculty and academic years
    // This allows re-uploading without duplicate errors
    let deletedCount = 0;
    if (uniqueFacultyIds.length > 0 && uniqueAcademicYears.length > 0) {
      deletedCount = await TimetableSimple.destroy({
        where: {
          facultyId: {
            [Op.in]: uniqueFacultyIds
          },
          academicYear: {
            [Op.in]: uniqueAcademicYears
          }
        },
        transaction,
        force: true // Force delete even if soft delete is enabled
      });
      console.log('[DEBUG] Deleted', deletedCount, 'existing records for re-upload');
    }

    // Bulk insert all records
    const insertedRecords = await TimetableSimple.bulkCreate(results, {
      validate: true,
      ignoreDuplicates: false,
      transaction
    });

    // Commit transaction
    await transaction.commit();

    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    // Format response data for preview
    const previewData = insertedRecords.slice(0, 50).map(record => ({
      id: record.id,
      facultyId: record.facultyId,
      facultyName: record.facultyName,
      department: record.department,
      year: record.year,
      section: record.section,
      day: record.day,
      hour: record.hour,
      subject: record.subject,
      academicYear: record.academicYear
    }));

    console.log('[DEBUG] Bulk upload successful - Inserted:', insertedRecords.length, 'records, Deleted:', deletedCount, 'old records');

    res.status(200).json({
      success: true,
      message: 'Timetable uploaded successfully and replaced old records',
      insertedCount: insertedRecords.length,
      deletedCount: deletedCount,
      preview: previewData,
      total: insertedRecords.length
    });

  } catch (error) {
    // Rollback transaction on error if it exists
    console.error('[ERROR] Bulk upload failed:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    
    if (transaction) {
      await transaction.rollback();
    }

    // Clean up uploaded file
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    // Handle duplicate entry error
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error.errors[0]?.path || 'facultyId, day, hour';
      return next(new ErrorResponse(`Duplicate entry found for ${duplicateField}. Transaction rolled back.`, 400));
    }

    // Handle validation error
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(e => e.message).join(', ');
      return next(new ErrorResponse(`Validation error: ${validationErrors}. Transaction rolled back.`, 400));
    }

    // Generic error - return the actual error message
    return next(new ErrorResponse(`Error uploading timetable: ${error.message}`, 500));
  }
});

// @desc      Get personal timetable for logged-in faculty
// @route     GET /api/v1/timetable/faculty/me
// @access    Private (Faculty only)
export const getMyTimetable = asyncHandler(async (req, res, next) => {
  // Get facultyId from logged-in user (JWT token)
  // The auth middleware normalizes faculty_id/facultyId
  const facultyId = req.user.facultyId || req.user.faculty_id || req.user.id;
  
  console.log('[DEBUG] getMyTimetable - req.user:', JSON.stringify(req.user));
  console.log('[DEBUG] getMyTimetable - extracted facultyId:', facultyId);
  
  if (!facultyId) {
    console.log('[DEBUG] getMyTimetable - Faculty ID not found in token');
    return next(new ErrorResponse('Faculty ID not found in token', 400));
  }

  const timetable = await TimetableSimple.findAll({
    where: { facultyId: String(facultyId) },
    attributes: ['id', 'facultyId', 'day', 'hour', 'subject', 'section', 'department', 'year', 'academicYear'],
    order: [
      // Use literal query for FIELD function to order by day of week
      [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')"), 'ASC'],
      ['hour', 'ASC']
    ]
  });

  console.log('[DEBUG] getMyTimetable - Query result count:', timetable.length);
  console.log('[DEBUG] getMyTimetable - Query facultyId used:', String(facultyId));

  if (!timetable || timetable.length === 0) {
    // Check if any data exists at all
    const totalCount = await TimetableSimple.count();
    console.log('[DEBUG] getMyTimetable - Total timetable records in DB:', totalCount);
    
    return res.status(200).json({
      success: true,
      timetable: [],
      message: totalCount === 0 ? 'No timetable data in system' : 'No timetable found for this faculty'
    });
  }

  // Format response
  const formattedTimetable = timetable.map(record => ({
    id: record.id,
    facultyId: record.facultyId,
    day: record.day,
    hour: record.hour,
    subject: record.subject,
    section: record.section,
    department: record.department,
    year: record.year,
    academicYear: record.academicYear
  }));

  console.log('[DEBUG] getMyTimetable - Returning timetable records:', formattedTimetable.length);

  res.status(200).json({
    success: true,
    timetable: formattedTimetable
  });
});

// @desc      Get personal timetable for logged-in student
// @route     GET /api/v1/timetable/student/me
// @access    Private (Student only)
export const getMyStudentTimetable = asyncHandler(async (req, res, next) => {
  // Get student using primary key id from JWT token
  // DO NOT use userId or departmentId - these columns may not exist in the database
  // Exclude problematic fields from query
  const student = await models.Student.findByPk(req.user.id, {
    attributes: { exclude: ['userId', 'departmentId'] }
  });

  if (!student) {
    console.log('[DEBUG] getMyStudentTimetable - Student record not found');
    return next(new ErrorResponse('Student record not found', 404));
  }

  console.log('[DEBUG] getMyStudentTimetable - Student found:', student.id, student.studentId);

  // Use department from JWT token directly (already contains department short_name)
  // The JWT token includes department info from login time
  const departmentName = req.user.department;
  const yearValue = req.user.year || student.year;
  const sectionValue = req.user.section || student.section || 'A';

  console.log('[DEBUG] getMyStudentTimetable - Using from JWT:', {
    studentId: student.id,
    departmentName,
    yearValue,
    sectionValue
  });

  if (!departmentName) {
    console.log('[DEBUG] getMyStudentTimetable - Department not found in JWT');
    return next(new ErrorResponse('Department not assigned to student', 400));
  }

  console.log('[DEBUG] getMyStudentTimetable - Student details:', {
    studentId: student.id,
    departmentName,
    yearValue,
    sectionValue,
    batch: student.batch
  });

  // Build query using department name, year (integer), and section
  const timetableQuery = {
    department: departmentName,
    year: yearValue
  };
  
  // Add section to query if available
  if (sectionValue) {
    timetableQuery.section = sectionValue;
  }
  
  const timetable = await TimetableSimple.findAll({
    where: timetableQuery,
    order: [
      [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')"), 'ASC'],
      ['hour', 'ASC']
    ]
  });

  console.log('[DEBUG] getMyStudentTimetable - Query result count:', timetable.length);

  if (!timetable || timetable.length === 0) {
    // Check if any data exists at all
    const totalCount = await TimetableSimple.count();
    console.log('[DEBUG] getMyStudentTimetable - Total timetable records in DB:', totalCount);
    
    return res.status(200).json({
      success: true,
      timetable: [],
      message: totalCount === 0 ? 'No timetable data in system' : 'No timetable found for your class'
    });
  }

  // Format response
  const formattedTimetable = timetable.map(record => ({
    day: record.day,
    hour: record.hour,
    subject: record.subject,
    facultyName: record.facultyName
  }));

  console.log('[DEBUG] getMyStudentTimetable - Returning timetable records:', formattedTimetable.length);

  res.status(200).json({
    success: true,
    timetable: formattedTimetable
  });
});

// @desc      Get personal timetable for a faculty (by ID)
// @route     GET /api/v1/timetable/faculty/:facultyId
// @access    Private
export const getPersonalTimetable = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  if (!facultyId) {
    return next(new ErrorResponse('Please provide facultyId as parameter', 400));
  }

  const timetable = await TimetableSimple.findAll({
    where: { facultyId },
    attributes: ['day', 'hour', 'subject', 'section', 'department', 'year', 'academicYear'],
    order: [
      // Use literal query for FIELD function to order by day of week
      [sequelize.literal("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')"), 'ASC'],
      ['hour', 'ASC']
    ]
  });

  if (!timetable || timetable.length === 0) {
    return next(new ErrorResponse(`No timetable found for faculty ID: ${facultyId}`, 404));
  }

  // Format response
  const formattedTimetable = timetable.map(record => ({
    day: record.day,
    hour: record.hour,
    subject: record.subject,
    section: record.section,
    department: record.department,
    year: record.year,
    academicYear: record.academicYear
  }));

  res.status(200).json({
    success: true,
    count: formattedTimetable.length,
    data: formattedTimetable
  });
});
