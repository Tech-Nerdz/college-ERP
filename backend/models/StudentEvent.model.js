import { DataTypes } from 'sequelize';

const StudentEvent = (sequelize) => {
  const StudentEventModel = sequelize.define('StudentEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'studentId',
    },
    eventName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'eventName',
    },
    eventType: {
      type: DataTypes.ENUM('cultural', 'technical', 'sports', 'social', 'workshop', 'seminar', 'other'),
      allowNull: false,
      field: 'eventType',
    },
    organizer: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Organizing body/institution',
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'eventDate',
    },
    role: {
      type: DataTypes.ENUM('participant', 'organizer', 'volunteer', 'speaker', 'judge', 'other'),
      defaultValue: 'participant',
    },
    achievement: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Winner, Runner-up, Participation etc.',
    },
    level: {
      type: DataTypes.ENUM('college', 'district', 'state', 'national', 'international'),
      defaultValue: 'college',
    },
    certificateUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'certificateUrl',
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      field: 'approvalStatus',
    },
    approvedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approvedById',
      comment: 'FK → users.id',
    },
    approvalRemarks: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'approvalRemarks',
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approvalDate',
    },
  }, {
    tableName: 'student_events',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['studentId'],
        name: 'idx_student'
      },
      {
        fields: ['studentId', 'eventType'],
        name: 'idx_student_type'
      },
      {
        fields: ['studentId', 'approvalStatus'],
        name: 'idx_student_approval'
      }
    ]
  });

  StudentEventModel.associate = (models) => {
    StudentEventModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentEventModel.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approver'
    });
  };

  return StudentEventModel;
};

export default StudentEvent;
