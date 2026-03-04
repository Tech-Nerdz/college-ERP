import { DataTypes } from 'sequelize';

export const StudentProfileModel = (sequelize) => {
  const StudentProfile = sequelize.define(
    'StudentProfile',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        references: {
          model: 'roles',
          key: 'role_id',
        },
      },
      studentId: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        field: 'studentId',
        comment: 'Unique student ID',
      },
      rollNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        field: 'rollNumber',
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'firstName',
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'lastName',
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        field: 'email',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'phone',
      },
      photo: {
        type: DataTypes.STRING(255),
        defaultValue: 'default-student.png',
        field: 'photo',
        comment: 'Profile photo URL',
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
        field: 'gender',
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'departmentId',
        references: {
          model: 'departments',
          key: 'id',
        },
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'classId',
      },
      batch: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'batch',
        comment: 'Batch year (e.g., 2021-2025)',
      },
      semester: {
        type: DataTypes.TINYINT,
        allowNull: false,
        field: 'semester',
        validate: {
          min: 1,
          max: 8,
        },
      },
      year: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'year',
        comment: 'Academic year (1, 2, 3, or 4)',
      },
      section: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'section',
        comment: 'Class section (A, B, C, etc.)',
      },
      admissionDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'admissionDate',
      },
      admissionType: {
        type: DataTypes.ENUM('regular', 'lateral', 'management'),
        defaultValue: 'regular',
        field: 'admissionType',
      },
      feeStatus: {
        type: DataTypes.ENUM('paid', 'pending', 'partial'),
        defaultValue: 'pending',
        field: 'feeStatus',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated', 'dropped', 'suspended'),
        defaultValue: 'active',
        field: 'status',
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password',
        comment: 'Hashed password',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'createdAt',
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt',
      },
    },
    {
      tableName: 'student_profile',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          fields: ['studentId'],
          unique: true,
        },
        {
          fields: ['rollNumber'],
          unique: true,
        },
        {
          fields: ['email'],
          unique: true,
        },
        {
          fields: ['departmentId'],
        },
        {
          fields: ['semester'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  StudentProfile.associate = (models) => {
    // Association with Role
    StudentProfile.belongsTo(models.Role, {
      foreignKey: 'roleId',
      targetKey: 'role_id',
      as: 'role',
    });

    // Association with Department
    StudentProfile.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      targetKey: 'id',
      as: 'department',
    });

    // Association with Class
    if (models.Class) {
      StudentProfile.belongsTo(models.Class, {
        foreignKey: 'classId',
        targetKey: 'id',
        as: 'class',
      });
    }
  };

  return StudentProfile;
};
