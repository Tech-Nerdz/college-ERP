import initModels from '../models/index.js';
import colors from 'colors';

// Initialize models
const models = initModels();
const { User } = models;

const seedSuperAdmin = async () => {
    // skip seeding if flag set (startup logic also checks process.env.SEED_SUPERADMIN)
    if (process.env.SEED_SUPERADMIN !== 'true') {
        console.log('Seeding skipped (SEED_SUPERADMIN flag not set)'.cyan);
        return;
    }

    try {
        const superAdminEmail = 'nscetadmin@nscet.org';
        const exists = await User.findOne({ where: { email: superAdminEmail } });

        if (!exists) {
            console.log('Creating initial Super Admin...'.yellow);
            await User.create({
                name: 'GOAT',   
                email: superAdminEmail,
                password: 'password',
                role_id: 2, // super-admin
                phone: '9876543210',
                isActive: true
            });
            console.log('Super Admin "GOAT" created successfully.'.green.bold);
        } else {
            console.log('Super Admin already exists.'.blue);
        }
    } catch (error) {
        console.error(`Error seeding Super Admin: ${error.message}`.red);
    }
};

export default seedSuperAdmin;
