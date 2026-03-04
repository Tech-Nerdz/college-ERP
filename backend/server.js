import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import colors from 'colors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import fileupload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/error.js';
import connectDB from './config/db.js';
import seedSuperAdmin from './utils/initDB.js';

// Route files
import authRoutes from './routes/admin/auth.routes.js';
import userRoutes from './routes/admin/user.routes.js';
import departmentRoutes from './routes/admin/department.routes.js';
import adminSubjectRoutes from './routes/admin/subject.routes.js';
import facultyRoutes from './routes/faculty/faculty.routes.js';
import studentRoutes from './routes/student/student.routes.js';
import studentBioRoutes from './routes/student/studentBio.routes.js';
import studentAttendanceRoutes from './routes/student/studentAttendance.routes.js';
import studentEventRoutes from './routes/student/studentEvent.routes.js';
import studentSportRoutes from './routes/student/studentSport.routes.js';
import studentInternalMarksRoutes from './routes/student/studentInternalMarks.routes.js';
import studentProfileRoutes from './routes/student/studentProfile.routes.js';
import timetableRoutes from './routes/timetable/timetable.routes.js';
import timetableManagementAdminRoutes from './routes/admin/timetable-management.routes.js';
import leaveRoutes from './routes/leave-attendance/leave.routes.js';
import attendanceRoutes from './routes/leave-attendance/attendance.routes.js';
import announcementRoutes from './routes/admin/announcement.routes.js';
import timetableManagementRoutes from './routes/department-admin/timetable-management.routes.js';
import breakTimingRoutes from './routes/department-admin/break-timing.routes.js';
import facultyAllocationRoutes from './routes/department-admin/faculty-allocation.routes.js';
import timetableNotificationRoutes from './routes/faculty/timetable-notification.routes.js';
import coordinatorRoutes from './routes/department-admin/coordinator.routes.js';
import subjectRoutes from './routes/department-admin/subject.routes.js';
import generalSubjectRoutes from './routes/subject.routes.js';
import classRoutes from './routes/class.routes.js';

// Load env vars
dotenv.config();

// Initialize Sequelize models (associations)
import initModels from './models/index.js';
initModels();

// Connect to database
connectDB().then(() => {
  console.log('Database connected successfully');
  // Only run the seeder when explicitly requested. Set SEED_SUPERADMIN=true
  // (e.g. in development when you need to recreate credentials).
  if (process.env.SEED_SUPERADMIN === 'true') {
    seedSuperAdmin().then(() => {
      console.log('Seeding completed');
      startServer();
    }).catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
  } else {
    // skip seeding and just start
    startServer();
  }
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const startServer = () => {
  console.log('Starting server setup...');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();

  // Body parser - but skip for multipart/form-data
  app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, next);
  });

  // URL encoded parser for form data
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Handle invalid JSON payloads from clients to avoid unhandled exceptions
  // This must be registered immediately after `express.json()` so parse errors
  // are converted into a friendly 400 response instead of a 500.
  app.use((err, req, res, next) => {
    if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('Invalid JSON payload:', err.message);
      return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }
    next(err);
  });

  // Cookie parser
  app.use(cookieParser());

  // Dev logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // NOTE: Disabled express-fileupload - using multer for file uploads instead
  // If you need express-fileupload for other routes, add it back but only for non-multipart requests
  // app.use(fileupload({
  //   useTempFiles: true,
  //   tempFileDir: '/tmp/',
  //   createParentPath: true
  // }));

  // Simple request logger to help debug unexpected 500s from endpoints
  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.originalUrl);
    next();
  });

  // Sanitize data
  app.use(mongoSanitize());

  // Set security headers
  app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Rate limiting: enable only in production to avoid hitting limits during local development
  if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10 mins
      max: 100
    });
    app.use(limiter);
  }

  // Prevent http param pollution
  app.use(hpp());

  // Enable CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Set static folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Mount routers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/departments', departmentRoutes);
  app.use('/api/v1/admin/subjects', adminSubjectRoutes);
  app.use('/api/v1/faculty', facultyRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/student/bio', studentBioRoutes);
  app.use('/api/v1/student/attendance', studentAttendanceRoutes);
  app.use('/api/v1/student/events', studentEventRoutes);
  app.use('/api/v1/student/sports', studentSportRoutes);
  app.use('/api/v1/student/internal-marks', studentInternalMarksRoutes);
  app.use('/api/v1/student/profile', studentProfileRoutes);
  app.use('/api/v1/subjects', generalSubjectRoutes);
  app.use('/api/v1/classes', classRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/timetable-management', timetableManagementAdminRoutes);
  app.use('/api/v1/leave', leaveRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/announcements', announcementRoutes);
  app.use('/api/v1/department-admin/timetable', timetableManagementRoutes);
  app.use('/api/v1/department-admin/break-timings', breakTimingRoutes);
  app.use('/api/v1/department-admin/faculty-allocations', facultyAllocationRoutes);
  app.use('/api/v1/department-admin/coordinators', coordinatorRoutes);
  app.use('/api/v1/department-admin/subjects', subjectRoutes);
  app.use('/api/v1/faculty/notifications', timetableNotificationRoutes);

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Eduvertex ERP API is running' });
  });

  // Global error handler for multer
  app.use((err, req, res, next) => {
    if (err) {
      console.error('Multer error:', err.message);
      if (err.message === 'Unexpected end of form') {
        return res.status(400).json({ success: false, error: 'File upload failed. Please try again.' });
      }
      if (err.message === 'Only CSV files allowed') {
        return res.status(400).json({ success: false, error: err.message });
      }
      if (err.message && err.message.includes('File too large')) {
        return res.status(400).json({ success: false, error: 'File size exceeds the limit (10MB)' });
      }
    }
    next(err);
  });

  app.use(errorHandler);

  // prefer using environment variable, but default to 3005 as requested
  const PORT = process.env.PORT || 3005;

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
  });

  // Handle server listen errors (e.g., port in use)
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Another process is listening on this port.`.red);
      console.error('Hint: stop the process using this port or set PORT in your environment.'.yellow);
      process.exit(1);
    }
    console.error('Server error:', err);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};
