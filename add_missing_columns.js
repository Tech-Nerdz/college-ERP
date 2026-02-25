import { sequelize } from './backend/config/db.js';

async function addMissingColumns() {
    try {
        console.log('Adding missing columns to faculty_profiles table...');

        // Check if column exists before adding
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'eduvertex' 
            AND TABLE_NAME = 'faculty_profiles' 
            AND COLUMN_NAME = 'phd_status'
        `);

        if (results.length === 0) {
            await sequelize.query(`
                ALTER TABLE faculty_profiles 
                ADD COLUMN phd_status ENUM('Yes', 'No', 'Pursuing') DEFAULT 'No'
            `);
            console.log('Added phd_status column to faculty_profiles');
        } else {
            console.log('phd_status column already exists');
        }

        // Check and add other potentially missing columns
        const columnsToCheck = [
            { name: 'coe_id', sql: 'ALTER TABLE faculty_profiles ADD COLUMN coe_id INT NULL' },
            { name: 'AICTE_ID', sql: 'ALTER TABLE faculty_profiles ADD COLUMN AICTE_ID INT NULL' },
            { name: 'Anna_University_ID', sql: 'ALTER TABLE faculty_profiles ADD COLUMN Anna_University_ID INT NULL' },
            { name: 'linkedin_url', sql: 'ALTER TABLE faculty_profiles ADD COLUMN linkedin_url TEXT NULL' },
            { name: 'perm_address', sql: 'ALTER TABLE faculty_profiles ADD COLUMN perm_address TEXT NULL' },
            { name: 'curr_address', sql: 'ALTER TABLE faculty_profiles ADD COLUMN curr_address TEXT NULL' },
            { name: 'is_timetable_incharge', sql: 'ALTER TABLE faculty_profiles ADD COLUMN is_timetable_incharge BOOLEAN DEFAULT FALSE' },
            { name: 'is_placement_coordinator', sql: 'ALTER TABLE faculty_profiles ADD COLUMN is_placement_coordinator BOOLEAN DEFAULT FALSE' }
        ];

        for (const col of columnsToCheck) {
            const [checkResults] = await sequelize.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'eduvertex' 
                AND TABLE_NAME = 'faculty_profiles' 
                AND COLUMN_NAME = '${col.name}'
            `);
            
            if (checkResults.length === 0) {
                try {
                    await sequelize.query(col.sql);
                    console.log(`Added ${col.name} column to faculty_profiles`);
                } catch (e) {
                    console.log(`Error adding ${col.name}: ${e.message}`);
                }
            }
        }

        console.log('Database schema update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating database schema:', error);
        process.exit(1);
    }
}

addMissingColumns();
