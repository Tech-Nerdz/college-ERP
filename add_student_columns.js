import { sequelize } from './backend/config/db.js';

async function addStudentColumns() {
    try {
        console.log('Checking student_profile table columns...');

        // Check what columns exist in student_profile
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'eduvertex' 
            AND TABLE_NAME = 'student_profile'
        `);
        
        console.log('Existing columns:', columns.map(c => c.COLUMN_NAME).join(', '));

        // Check for year column
        const hasYear = columns.some(c => c.COLUMN_NAME === 'year');
        console.log('Has year column:', hasYear);
        
        // Check for userId column  
        const hasUserId = columns.some(c => c.COLUMN_NAME === 'userId');
        console.log('Has userId column:', hasUserId);

        console.log('Table schema check completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error checking table:', error);
        process.exit(1);
    }
}

addStudentColumns();
