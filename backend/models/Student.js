import { Sequelize, DataTypes, UUIDV4  } from 'sequelize';
import sequelize from '../config/db.js';

const Student = sequelize.define(
  'Student',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: 'students', timestamps: false }
);

export default Student;
