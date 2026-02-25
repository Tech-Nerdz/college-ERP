import { sequelize } from './backend/config/db.js';

async function addUserColumns() {
    try {
        console.log('Adding missing columns to users table...');

        const columnsToCheck = [
            { name: 'department_id', sql: 'ALTER TABLE users ADD COLUMN department_id INT NULL' }
        ];

        for (const col of columnsToCheck) {
            const [checkResults] = await sequelize.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'eduvertex' 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = '${col.name}'
            `);
            
            if (checkResults.length === 0) {
                try {
                    await sequelize.query(col.sql);
                    console.log(`Added ${col.name} column to users table`);
                } catch (e) {
                    console.log(`Error adding ${col.name}: ${e.message}`);
                }
            } else {
                console.log(`${col.name} column already exists`);
            }
        }

        console.log('Users table schema update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating database schema:', error);
        process.exit(1);
    }
}

addUserColumns();
