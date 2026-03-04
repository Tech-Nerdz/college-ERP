import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const StudentExtracurricular = sequelize.define('StudentExtracurricular', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'FK → student_profile.id'
        },
        activityName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            comment: 'Name of extracurricular activity (e.g., Debate, Coding Club, Drama)'
        },
        activityType: {
            type: DataTypes.ENUM(
                'club',                    // Clubs and societies
                'competition',             // Competitions and contests
                'volunteer',               // Volunteer work
                'cultural',                // Cultural activities
                'technical',               // Technical workshops/hackathons
                'sports',                  // Sports activities
                'arts',                    // Arts and music
                'leadership',              // Leadership programs
                'social-service',          // Social service activities
                'other'                    // Other activities
            ),
            defaultValue: 'other',
            comment: 'Type of extracurricular activity'
        },
        organizationName: {
            type: DataTypes.STRING(150),
            comment: 'Organization/Club/Society name'
        },
        role: {
            type: DataTypes.STRING(100),
            comment: 'Role in the activity (e.g., President, Member, Participant, Organizer)'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Start date of participation'
        },
        endDate: {
            type: DataTypes.DATE,
            comment: 'End date of participation (null if ongoing)'
        },
        description: {
            type: DataTypes.TEXT,
            comment: 'Detailed description of the activity and accomplishments'
        },
        achievement: {
            type: DataTypes.STRING(500),
            comment: 'Awards/Achievements obtained (e.g., Winner, Runner-up, Appreciation Certificate)'
        },
        level: {
            type: DataTypes.ENUM(
                'college',
                'district',
                'state',
                'national',
                'international'
            ),
            defaultValue: 'college',
            comment: 'Level of activity participation'
        },
        hoursInvolved: {
            type: DataTypes.INTEGER,
            comment: 'Total hours invested in the activity'
        },
        certificateUrl: {
            type: DataTypes.STRING(500),
            comment: 'URL to certificate or proof of participation'
        },
        proofDocumentUrl: {
            type: DataTypes.STRING(500),
            comment: 'Additional proof document (image/PDF)'
        },
        skillsAcquired: {
            type: DataTypes.JSON,
            comment: 'Array of skills learned through this activity',
            defaultValue: []
        },
        participants: {
            type: DataTypes.JSON,
            comment: 'Other team members/participants involved',
            defaultValue: []
        },
        impact: {
            type: DataTypes.TEXT,
            comment: 'Impact and outcome of the activity'
        },
        isOngoing: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Flag to indicate if currently participating'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'completed'),
            defaultValue: 'active',
            comment: 'Current status of participation'
        },
        visibility: {
            type: DataTypes.ENUM('public', 'private', 'admin-only'),
            defaultValue: 'public',
            comment: 'Visibility setting for the activity'
        },
        approvalStatus: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            comment: 'Admin approval status for verification'
        },
        approvedById: {
            type: DataTypes.INTEGER,
            comment: 'FK → users.id (Admin who approved)'
        },
        approvalRemarks: {
            type: DataTypes.STRING(500),
            comment: 'Admin remarks for approval/rejection'
        },
        approvalDate: {
            type: DataTypes.DATE,
            comment: 'Date of approval'
        },
        rating: {
            type: DataTypes.DECIMAL(3, 1),
            comment: 'Rating out of 5 (optional)'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: 'Record creation timestamp'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
            comment: 'Last update timestamp'
        }
    }, {
        tableName: 'student_extracurricular',
        timestamps: true,
        indexes: [
            {
                fields: ['studentId']
            },
            {
                fields: ['studentId', 'approvalStatus']
            },
            {
                fields: ['studentId', 'activityType']
            },
            {
                fields: ['studentId', 'level']
            },
            {
                fields: ['approvalStatus']
            },
            {
                fields: ['activityType']
            },
            {
                fields: ['startDate', 'endDate']
            }
        ]
    });

    // Associations
    StudentExtracurricular.associate = (models) => {
        // Many extracurriculars belong to one student
        StudentExtracurricular.belongsTo(models.Student, {
            foreignKey: 'studentId',
            as: 'student',
            onDelete: 'CASCADE'
        });

        // Approval done by admin/faculty
        StudentExtracurricular.belongsTo(models.User, {
            foreignKey: 'approvedById',
            as: 'approvedBy',
            onDelete: 'SET NULL'
        });
    };

    return StudentExtracurricular;
};
