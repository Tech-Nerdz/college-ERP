import { DataTypes } from 'sequelize';

const FacultyPhd = (sequelize) => {
  const Phd = sequelize.define('FacultyPhd', {
    phd_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'phd_id'
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    orcid_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    thesis_title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    register_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    guide_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'faculty_phd',
    timestamps: false
  });

  Phd.associate = (models) => {
    Phd.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
  };

  return Phd;
};

export default FacultyPhd;
