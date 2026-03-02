import { DataTypes } from 'sequelize';

const TimetableStaffAlteration = (sequelize) => {
  const TimetableStaffAlterationModel = sequelize.define('TimetableStaffAlteration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    timetable_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timetable_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    original_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    alternative_faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    alternative_response: DataTypes.TEXT,
    accepted_at: DataTypes.DATE
  }, {
    tableName: 'timetable_staff_alterations',
    timestamps: true
  });

  TimetableStaffAlterationModel.associate = (models) => {
    TimetableStaffAlterationModel.belongsTo(models.TimetableMaster, {
      foreignKey: 'timetable_id',
      as: 'timetable'
    });
    TimetableStaffAlterationModel.belongsTo(models.TimetableDetails, {
      foreignKey: 'timetable_detail_id',
      as: 'timetable_detail'
    });
    TimetableStaffAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'original_faculty_id',
      as: 'original_faculty'
    });
    TimetableStaffAlterationModel.belongsTo(models.Faculty, {
      foreignKey: 'alternative_faculty_id',
      as: 'alternative_faculty'
    });
    TimetableStaffAlterationModel.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester'
    });
  };

  return TimetableStaffAlterationModel;
};

export default TimetableStaffAlteration;
