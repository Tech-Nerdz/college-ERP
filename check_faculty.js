import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './backend/config/db.js';
import { models } from './backend/models/index.js';
import initModels from './backend/models/index.js';

// Initialize models
initModels();

const { Faculty, User, Role } = models;

async function checkFaculty() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const email = 'drmathalai.raj@nscet.org';
    
    // Check Faculty table
    const faculty = await Faculty.findOne({
      where: { email },
      attributes: { exclude: ['password'] },
      include: [{ model: models.Department, as: 'department', attributes: ['short_name', 'full_name'] }]
    });

    console.log('\nFaculty record:');
    if (faculty) {
      console.log('✓ Found in faculty_profiles');
      console.log('  ID:', faculty.faculty_id);
      console.log('  Name:', faculty.Name);
      console.log('  Email:', faculty.email);
      console.log('  Status:', faculty.status);
      console.log('  Role ID:', faculty.role_id);
      console.log('  Department:', faculty.department?.short_name || faculty.department);
    } else {
      console.log('✗ NOT found in faculty_profiles table');
    }

    // Check User table
    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });

    console.log('\nUser record:');
    if (user) {
      console.log('✓ Found in users table');
      console.log('  ID:', user.user_id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  isActive:', user.isActive);
      console.log('  Role:', user.role?.role_name);
    } else {
      console.log('✗ NOT found in users table');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkFaculty();
