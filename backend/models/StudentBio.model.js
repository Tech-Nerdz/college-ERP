import { DataTypes } from 'sequelize';

const StudentBio = (sequelize) => {
  const StudentBioModel = sequelize.define('StudentBio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'studentId',
    },
    bloodGroup: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(50),
      defaultValue: 'Indian',
    },
    religion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('General', 'OBC', 'SC', 'ST', 'Other'),
      allowNull: true,
    },
    aadharNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    motherTongue: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    residenceType: {
      type: DataTypes.ENUM('hosteller', 'day_scholar', 'other'),
      allowNull: true,
    },
    currentAddress: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object with street, city, state, pincode, country',
    },
    permanentAddress: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object with street, city, state, pincode, country',
    },
    parentInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object with father, mother, guardian, siblings details',
    },
    references: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of reference contacts',
    },
    previousEducation: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of educational history objects',
    },
    scholarships: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of scholarship details',
    },
    documents: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of document URLs',
    },
  }, {
    tableName: 'student_bio',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId'],
        name: 'uq_students1_studentId'
      }
    ]
  });

  StudentBioModel.associate = (models) => {
    StudentBioModel.belongsTo(models.Student, {
      foreignKey: 'studentId',
      targetKey: 'studentId',
      as: 'student'
    });
  };

  return StudentBioModel;
};

export default StudentBio;
