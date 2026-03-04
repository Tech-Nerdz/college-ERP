import { DataTypes } from 'sequelize';

const StudentAttendance = (sequelize) => {
  const StudentAttendanceModel = sequelize.define('StudentAttendance', {
    attendance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'attendance_id',
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subject_id',
    },
    class_section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'class_section_id',
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'faculty_id',
    },
    class_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'class_date',
    },
    period_session_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'period_session_number',
    },
    attendance_status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Late', 'On-Duty'),
      defaultValue: 'Present',
      field: 'attendance_status',
    },
    marked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'marked_at',
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'student_attendance_entry',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'subject_id', 'class_date', 'period_session_number'],
        name: 'uq_student_date_period'
      },
      {
        fields: ['student_id'],
        name: 'idx_stu_att_student_id'
      },
      {
        fields: ['subject_id'],
        name: 'idx_stu_att_subject_id'
      },
      {
        fields: ['class_section_id'],
        name: 'idx_stu_att_class_section_id'
      },
      {
        fields: ['faculty_id'],
        name: 'idx_stu_att_faculty_id'
      },
      {
        fields: ['class_date'],
        name: 'idx_stu_att_class_date'
      },
      {
        fields: ['attendance_status'],
        name: 'idx_stu_att_status'
      }
    ]
  });

  StudentAttendanceModel.associate = (models) => {
    StudentAttendanceModel.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student'
    });
    StudentAttendanceModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject'
    });
    StudentAttendanceModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
    StudentAttendanceModel.belongsTo(models.Class, {
      foreignKey: 'class_section_id',
      as: 'classSection'
    });
  };

  return StudentAttendanceModel;
};

export default StudentAttendance;
