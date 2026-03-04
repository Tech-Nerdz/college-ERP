import { DataTypes } from 'sequelize';

const StudentDisciplinary = (sequelize) => {
  const StudentDisciplinaryModel = sequelize.define('StudentDisciplinary', {
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
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'recordDate',
    },
    type: {
      type: DataTypes.ENUM('warning', 'suspension', 'fine', 'counseling', 'expulsion', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Description of the incident',
    },
    actionTaken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'actionTaken',
      comment: 'Corrective actions taken',
    },
    staffRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'staffRemarks',
    },
    issuedByFacultyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'issuedByFacultyId',
      comment: 'FK → faculty_profiles.faculty_id',
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resolvedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'resolvedDate',
    },
    fineAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'fineAmount',
    },
    finePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'finePaid',
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of document URLs',
    },
  }, {
    tableName: 'student_disciplinary_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['studentId'],
        name: 'idx_student'
      },
      {
        fields: ['studentId', 'resolved'],
        name: 'idx_student_resolved'
      },
      {
        fields: ['studentId', 'recordDate'],
        name: 'idx_student_date'
      },
      {
        fields: ['issuedByFacultyId'],
        name: 'idx_issued_by'
      }
    ]
  });

  StudentDisciplinaryModel.associate = (models) => {
    StudentDisciplinaryModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentDisciplinaryModel.belongsTo(models.Faculty, {
      foreignKey: 'issuedByFacultyId',
      as: 'issuedByFaculty'
    });
  };

  return StudentDisciplinaryModel;
};

export default StudentDisciplinary;
