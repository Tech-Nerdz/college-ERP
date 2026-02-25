import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'eduvertex'
    });

    console.log('✓ Connected to database\n');

    // Check faculty_profiles
    console.log('=== FACULTY_PROFILES TABLE ===');
    const [faculty] = await connection.query(
      'SELECT faculty_id, Name, email, status, role_id FROM faculty_profiles WHERE email LIKE ?',
      ['%mathalai%']
    );
    console.log('Faculty records matching "mathalai":');
    console.log(faculty);

    // Check all department admins (role_id = 7)
    const [allDeptAdmins] = await connection.query(
      'SELECT faculty_id, Name, email, status, role_id FROM faculty_profiles WHERE role_id = 7 LIMIT 10'
    );
    console.log('\nAll department admins in faculty_profiles (role_id=7):');
    console.log(allDeptAdmins);

    console.log('\n=== USERS TABLE ===');
    const [users] = await connection.query(
      'SELECT user_id, name, email, isActive FROM users WHERE email LIKE ?',
      ['%mathalai%']
    );
    console.log('User records matching "mathalai":');
    console.log(users);

    // Check all admin users
    const [allUsers] = await connection.query(
      'SELECT user_id, name, email, isActive, role_id FROM users LIMIT 10'
    );
    console.log('\nAll users in users table:');
    console.log(allUsers);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
