import { DataTypes } from 'sequelize';

const FacultyLeaveSchedule = (sequelize) => {
  const FacultyLeaveScheduleModel = sequelize.define('FacultyLeaveSchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leave_id: DataTypes.INTEGER,
    from_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    to_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    reason: DataTypes.TEXT
  }, {
    tableName: 'faculty_leave_schedules',
    timestamps: true
  });

  FacultyLeaveScheduleModel.associate = (models) => {
    FacultyLeaveScheduleModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
  };

  return FacultyLeaveScheduleModel;
};

export default FacultyLeaveSchedule;
