import { DataTypes } from 'sequelize';

const StudentInternalMarks = (sequelize) => {
  const StudentInternalMarksModel = sequelize.define('StudentInternalMarks', {
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
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subjectId',
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academicYear',
      comment: 'Format: YYYY-YYYY',
    },
    internalNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'internalNumber',
      comment: '1 or 2 (for Internal 1, Internal 2)',
    },
    internalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'internalScore',
      comment: 'Out of 60',
    },
    assessmentScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'assessmentScore',
      comment: 'Out of 40',
    },
    totalScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'totalScore',
      comment: 'Internal + Assessment',
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'student_internal_marks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'subjectId', 'semester', 'academicYear', 'internalNumber'],
        name: 'uq_student_subject_sem_year_int'
      },
      {
        fields: ['studentId', 'semester', 'internalNumber'],
        name: 'idx_student_sem_int'
      },
      {
        fields: ['subjectId', 'semester'],
        name: 'idx_subject_semester'
      }
    ]
  });

  StudentInternalMarksModel.associate = (models) => {
    StudentInternalMarksModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentInternalMarksModel.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
  };

  return StudentInternalMarksModel;
};

export default StudentInternalMarks;
