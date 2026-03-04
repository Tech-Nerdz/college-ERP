import { DataTypes } from 'sequelize';

const StudentCertification = (sequelize) => {
  const StudentCertificationModel = sequelize.define('StudentCertification', {
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
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Certification name',
    },
    issuer: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Issuing organization',
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'issueDate',
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'expiryDate',
      comment: 'Optional for certifications without expiry',
    },
    credentialId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'credentialId',
    },
    credentialUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'credentialUrl',
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of skills learned/certified',
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'documentUrl',
      comment: 'Certificate document URL',
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
    tableName: 'student_certifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['studentId'],
        name: 'idx_student'
      },
      {
        fields: ['studentId', 'approvalStatus'],
        name: 'idx_student_approval'
      }
    ]
  });

  StudentCertificationModel.associate = (models) => {
    StudentCertificationModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentCertificationModel.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approver'
    });
  };

  return StudentCertificationModel;
};

export default StudentCertification;
