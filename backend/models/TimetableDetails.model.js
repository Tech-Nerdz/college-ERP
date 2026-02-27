import { DataTypes } from 'sequelize';

const TimetableDetails = (sequelize) => {
  const TimetableDetailsModel = sequelize.define('TimetableDetails', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    timetable_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      allowNull: false
    },
    period_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject_id: DataTypes.INTEGER,
    faculty_id: DataTypes.INTEGER,
    room_number: DataTypes.STRING(50),
    period_type: {
      type: DataTypes.ENUM('lecture', 'practical', 'tutorial', 'break', 'lunch'),
      defaultValue: 'lecture'
    },
    is_break: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'pending'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'timetable_details',
    timestamps: true
  });

  TimetableDetailsModel.associate = (models) => {
    TimetableDetailsModel.belongsTo(models.TimetableMaster, {
      foreignKey: 'timetable_id',
      as: 'timetable'
    });
    TimetableDetailsModel.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class'
    });
    TimetableDetailsModel.belongsTo(models.Subject, {
      foreignKey: 'subject_id',
      as: 'subject'
    });
    TimetableDetailsModel.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
  };

  return TimetableDetailsModel;
};

export default TimetableDetails;
