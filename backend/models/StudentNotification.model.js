import { DataTypes } from 'sequelize';

const StudentNotification = (sequelize) => {
  const StudentNotificationModel = sequelize.define('StudentNotification', {
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
    type: {
      type: DataTypes.ENUM(
        'academic',
        'leave',
        'fee',
        'general',
        'disciplinary',
        'attendance',
        'result',
        'approval',
        'announcement'
      ),
      allowNull: false,
      defaultValue: 'general',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'isRead',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'readAt',
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'referenceId',
      comment: 'ID of related entity (e.g., marks_id, attendance_id)',
    },
    referenceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'referenceType',
      comment: 'Type of reference (e.g., marks, attendance, event)',
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'actionUrl',
      comment: 'URL for action button/navigation',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiresAt',
      comment: 'Notification expiry date',
    },
  }, {
    tableName: 'student_notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['studentId'],
        name: 'idx_student'
      },
      {
        fields: ['studentId', 'isRead'],
        name: 'idx_student_read'
      },
      {
        fields: ['studentId', 'type'],
        name: 'idx_student_type'
      },
      {
        fields: ['studentId', 'priority'],
        name: 'idx_student_priority'
      }
    ]
  });

  StudentNotificationModel.associate = (models) => {
    StudentNotificationModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
  };

  return StudentNotificationModel;
};

export default StudentNotification;
