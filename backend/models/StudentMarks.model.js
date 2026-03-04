import { DataTypes } from 'sequelize';

const StudentMarks = (sequelize) => {
  const StudentMarksModel = sequelize.define('StudentMarks', {
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
    internalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'internalMarks',
      comment: 'Out of 50',
    },
    externalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'externalMarks',
      comment: 'Out of 50',
    },
    totalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'totalMarks',
      comment: 'Internal + External',
    },
    grade: {
      type: DataTypes.ENUM('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'),
      allowNull: true,
    },
    gradePoint: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      field: 'gradePoint',
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
    },
    status: {
      type: DataTypes.ENUM('pass', 'fail', 'absent', 'withheld', 'pending'),
      defaultValue: 'pending',
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'student_marks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'subjectId', 'semester', 'academicYear'],
        name: 'uq_student_subject_sem_year'
      },
      {
        fields: ['studentId', 'semester'],
        name: 'idx_student_semester'
      },
      {
        fields: ['subjectId', 'semester'],
        name: 'idx_subject_semester'
      }
    ]
  });

  StudentMarksModel.associate = (models) => {
    StudentMarksModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentMarksModel.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
  };

  return StudentMarksModel;
};

export default StudentMarks;
