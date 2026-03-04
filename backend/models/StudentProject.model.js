import { DataTypes } from 'sequelize';

const StudentProject = (sequelize) => {
  const StudentProjectModel = sequelize.define('StudentProject', {
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Frontend Developer, Team Lead',
    },
    techStack: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'techStack',
      comment: 'Array of technology strings',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'startDate',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'endDate',
      comment: 'Null = ongoing',
    },
    projectUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'projectUrl',
    },
    repoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'repoUrl',
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'thumbnailUrl',
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'planned', 'paused'),
      defaultValue: 'in-progress',
      comment: 'Matches frontend values',
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'imageUrl',
      comment: 'Project thumbnail/screenshot URL',
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
    tableName: 'student_projects',
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

  StudentProjectModel.associate = (models) => {
    StudentProjectModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentProjectModel.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approver'
    });
  };

  return StudentProjectModel;
};

export default StudentProject;
