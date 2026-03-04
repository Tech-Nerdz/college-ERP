import { DataTypes } from 'sequelize';

const StudentSport = (sequelize) => {
  const StudentSportModel = sequelize.define('StudentSport', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Sport name e.g. Football, Basketball',
    },
    category: {
      type: DataTypes.ENUM('Team Sports', 'Individual Sports', 'Aquatics', 'Combat Sports', 'Other'),
      allowNull: false,
      defaultValue: 'Other',
    },
    joinedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'joinedDate',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    achievements: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'e.g. Winner, Runner-up, Participation',
    },
    level: {
      type: DataTypes.ENUM('college', 'district', 'state', 'national', 'international'),
      allowNull: false,
      defaultValue: 'college',
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'documentUrl',
      comment: 'Certificate/proof URL',
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
    tableName: 'student_sports',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['studentId'],
        name: 'idx_student'
      },
      {
        fields: ['studentId', 'status'],
        name: 'idx_student_status'
      },
      {
        fields: ['studentId', 'approvalStatus'],
        name: 'idx_student_approval'
      }
    ]
  });

  StudentSportModel.associate = (models) => {
    StudentSportModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentSportModel.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approver'
    });
  };

  return StudentSportModel;
};

export default StudentSport;
